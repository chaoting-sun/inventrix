import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import db from '../src/db.js';
import { generateToken } from '../src/middleware/auth.js';
import { resetEarnHistory, tryRegisterEarn } from '../src/services/points.js';

const app = createApp();

let seq = 0;
const createUser = (points = 0) => {
  const email = `user${++seq}@test.com`;
  const id = Number(
    db.prepare('INSERT INTO users (email, password, name, role, points) VALUES (?, ?, ?, ?, ?)')
      .run(email, 'x', 'Test', 'customer', points).lastInsertRowid
  );
  return { id, token: generateToken({ id, email, role: 'customer' }) };
};

const createProduct = (price: number, stock: number) =>
  Number(
    db.prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)')
      .run(`P${++seq}`, price, stock).lastInsertRowid
  );

const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
const balanceOf = (id: number) => (db.prepare('SELECT points FROM users WHERE id = ?').get(id) as any).points;
const stockOf = (id: number) => (db.prepare('SELECT stock FROM products WHERE id = ?').get(id) as any).stock;
const orderCount = () => (db.prepare('SELECT COUNT(*) c FROM orders').get() as any).c;

beforeEach(() => resetEarnHistory());

describe('point_price', () => {
  it.each([
    [0.2, 1],
    [1, 1],
    [9.99, 10],
    [10, 10],
    [1299.99, 1300]
  ])('price %s -> point_price %s', async (price, expected) => {
    const id = createProduct(price, 5);
    const res = await request(app).get(`/api/products/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.point_price).toBe(expected);

    const list = await request(app).get('/api/products');
    expect(list.body.find((p: any) => p.id === id).point_price).toBe(expected);
  });
});

describe('GET /api/me/points', () => {
  it('requires login', async () => {
    expect((await request(app).get('/api/me/points')).status).toBe(401);
  });

  it('starts at 0 for new accounts', async () => {
    const u = createUser();
    const res = await request(app).get('/api/me/points').set(auth(u.token));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ balance: 0 });
  });
});

describe('POST /api/points/earn', () => {
  it('requires login', async () => {
    expect((await request(app).post('/api/points/earn')).status).toBe(401);
  });

  it('adds 10 points per call', async () => {
    const u = createUser();
    const res = await request(app).post('/api/points/earn').set(auth(u.token));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ balance: 10 });
    expect(balanceOf(u.id)).toBe(10);
  });

  it('returns 429 on the 4th call within 10 seconds and adds no points', async () => {
    const u = createUser();
    for (let i = 1; i <= 3; i++) {
      const ok = await request(app).post('/api/points/earn').set(auth(u.token));
      expect(ok.status).toBe(200);
      expect(ok.body.balance).toBe(10 * i);
    }
    const blocked = await request(app).post('/api/points/earn').set(auth(u.token));
    expect(blocked.status).toBe(429);
    expect(balanceOf(u.id)).toBe(30);
  });

  it('limits per account, not globally', async () => {
    const a = createUser();
    const b = createUser();
    for (let i = 0; i < 3; i++) await request(app).post('/api/points/earn').set(auth(a.token));
    expect((await request(app).post('/api/points/earn').set(auth(a.token))).status).toBe(429);
    expect((await request(app).post('/api/points/earn').set(auth(b.token))).status).toBe(200);
  });

  it('allows earning again once the 10 second window has passed', () => {
    const userId = 999001;
    const t0 = 1_000_000;
    expect(tryRegisterEarn(userId, t0)).toBe(true);
    expect(tryRegisterEarn(userId, t0 + 1000)).toBe(true);
    expect(tryRegisterEarn(userId, t0 + 2000)).toBe(true);
    expect(tryRegisterEarn(userId, t0 + 9999)).toBe(false);
    expect(tryRegisterEarn(userId, t0 + 10_000)).toBe(true);
  });
});

describe('POST /api/orders (checkout with points)', () => {
  it('requires login', async () => {
    const res = await request(app).post('/api/orders').send({ items: [] });
    expect(res.status).toBe(401);
  });

  it('spends points, reduces stock and records the order', async () => {
    const u = createUser(100);
    const p = createProduct(9.99, 5); // point_price 10
    const res = await request(app)
      .post('/api/orders').set(auth(u.token))
      .send({ items: [{ product_id: p, quantity: 3 }] });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: expect.any(Number), points_spent: 30, balance: 70 });
    expect(balanceOf(u.id)).toBe(70);
    expect(stockOf(p)).toBe(2);

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(res.body.id) as any;
    expect(order.points_spent).toBe(30);
    expect(order.subtotal).toBeCloseTo(29.97);
    expect(order.gst).toBeCloseTo(2.997);
    expect(order.total).toBeCloseTo(32.967);
    expect(order.user_id).toBe(u.id);
  });

  it('returns 402 when points are insufficient and leaves data unchanged', async () => {
    const u = createUser(5);
    const p = createProduct(9.99, 5); // 10 points each
    const before = orderCount();
    const res = await request(app)
      .post('/api/orders').set(auth(u.token))
      .send({ items: [{ product_id: p, quantity: 1 }] });

    expect(res.status).toBe(402);
    expect(balanceOf(u.id)).toBe(5);
    expect(stockOf(p)).toBe(5);
    expect(orderCount()).toBe(before);
  });

  it('returns 409 when stock is insufficient and leaves data unchanged', async () => {
    const u = createUser(1000);
    const p = createProduct(1, 2);
    const before = orderCount();
    const res = await request(app)
      .post('/api/orders').set(auth(u.token))
      .send({ items: [{ product_id: p, quantity: 3 }] });

    expect(res.status).toBe(409);
    expect(balanceOf(u.id)).toBe(1000);
    expect(stockOf(p)).toBe(2);
    expect(orderCount()).toBe(before);
  });

  it('rolls back everything when a later line fails', async () => {
    const u = createUser(1000);
    const ok = createProduct(1, 10);
    const scarce = createProduct(1, 1);
    const before = orderCount();
    const res = await request(app)
      .post('/api/orders').set(auth(u.token))
      .send({ items: [{ product_id: ok, quantity: 2 }, { product_id: scarce, quantity: 5 }] });

    expect(res.status).toBe(409);
    expect(stockOf(ok)).toBe(10);
    expect(stockOf(scarce)).toBe(1);
    expect(balanceOf(u.id)).toBe(1000);
    expect(orderCount()).toBe(before);
  });

  it('sums duplicate lines so they cannot bypass the stock check', async () => {
    const u = createUser(1000);
    const p = createProduct(1, 2);
    const res = await request(app)
      .post('/api/orders').set(auth(u.token))
      .send({ items: [{ product_id: p, quantity: 2 }, { product_id: p, quantity: 2 }] });
    expect(res.status).toBe(409);
    expect(stockOf(p)).toBe(2);
  });

  it.each([
    ['missing items', {}],
    ['empty items', { items: [] }],
    ['zero quantity', { items: [{ product_id: 1, quantity: 0 }] }],
    ['negative quantity', { items: [{ product_id: 1, quantity: -1 }] }],
    ['fractional quantity', { items: [{ product_id: 1, quantity: 1.5 }] }],
    ['string quantity', { items: [{ product_id: 1, quantity: '2' }] }],
    ['bad product_id', { items: [{ product_id: 'a', quantity: 1 }] }]
  ])('returns 400 for %s', async (_name, body) => {
    const u = createUser(1000);
    const res = await request(app).post('/api/orders').set(auth(u.token)).send(body);
    expect(res.status).toBe(400);
    expect(balanceOf(u.id)).toBe(1000);
  });

  it('returns 400 for an unknown product and leaves data unchanged', async () => {
    const u = createUser(1000);
    const res = await request(app)
      .post('/api/orders').set(auth(u.token))
      .send({ items: [{ product_id: 99999999, quantity: 1 }] });
    expect(res.status).toBe(400);
    expect(balanceOf(u.id)).toBe(1000);
  });
});
