import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { initDb, query, closeDb } from '../src/db.js';
import { generateToken } from '../src/middleware/auth.js';

const app = createApp();

const createTestProduct = async (stock: number) => {
  const { rows } = await query<{ id: number }>(
    "INSERT INTO products (name, description, price, stock) VALUES ('Integration Test Product', 'test', 10, $1) RETURNING id",
    [stock]
  );
  return rows[0].id;
};

const getStock = async (productId: number) => {
  const { rows } = await query<{ stock: number }>('SELECT stock FROM products WHERE id = $1', [productId]);
  return rows[0].stock;
};

const countOrderLines = async (productId: number) => {
  const { rows } = await query<{ count: number }>(
    'SELECT COUNT(*)::int AS count FROM order_items WHERE product_id = $1',
    [productId]
  );
  return rows[0].count;
};

const countOrders = async () => {
  const { rows } = await query<{ count: number }>('SELECT COUNT(*)::int AS count FROM orders');
  return rows[0].count;
};

const deleteTestProduct = async (productId: number) => {
  const { rows } = await query<{ order_id: number }>(
    'DELETE FROM order_items WHERE product_id = $1 RETURNING order_id',
    [productId]
  );
  const orderIds = rows.map((row) => row.order_id);
  if (orderIds.length > 0) {
    await query('DELETE FROM orders WHERE id = ANY($1::int[])', [orderIds]);
  }
  await query('DELETE FROM products WHERE id = $1', [productId]);
};

describe.skipIf(!process.env.DATABASE_URL)('orders (PostgreSQL)', () => {
  const email = `orders-integration-${Date.now()}@test.local`;
  let userId: number;
  let customerToken: string;
  let adminToken: string;
  const createdProductIds: number[] = [];

  beforeAll(async () => {
    await initDb();
    const { rows } = await query<{ id: number }>(
      "INSERT INTO users (email, password, name, role, points) VALUES ($1, 'x', 'Orders Test', 'customer', 1000) RETURNING id",
      [email]
    );
    userId = rows[0].id;
    customerToken = generateToken({ id: userId, email, role: 'customer' });
    const admin = await query<{ id: number; email: string; role: string }>(
      "SELECT id, email, role FROM users WHERE email = 'admin@inventrix.com'"
    );
    adminToken = generateToken(admin.rows[0]);
  });

  afterEach(async () => {
    while (createdProductIds.length > 0) {
      await deleteTestProduct(createdProductIds.pop()!);
    }
  });

  afterAll(async () => {
    await query('DELETE FROM orders WHERE user_id = $1', [userId]);
    await query('DELETE FROM users WHERE id = $1', [userId]);
    await closeDb();
  });

  it('creates the order and decreases stock', async () => {
    /** Catches an order that is saved without its lines or without the stock decrease. */
    const productId = await createTestProduct(5);
    createdProductIds.push(productId);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ product_id: productId, quantity: 2 }] });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: expect.any(Number), points_spent: 20 });
    const { rows } = await query('SELECT subtotal, gst, total, status FROM orders WHERE id = $1', [res.body.id]);
    expect(rows[0]).toMatchObject({ subtotal: 20, gst: 2, total: 22, status: 'pending' });
    expect(await getStock(productId)).toBe(3);
    expect(await countOrderLines(productId)).toBe(1);
  });

  it('rolls back the whole order when one line has insufficient stock', async () => {
    /** Catches a partial order whose earlier lines stay saved after a later line fails. */
    const inStockId = await createTestProduct(5);
    const lowStockId = await createTestProduct(1);
    createdProductIds.push(inStockId, lowStockId);
    const ordersBefore = await countOrders();

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [{ product_id: inStockId, quantity: 1 }, { product_id: lowStockId, quantity: 2 }] });

    expect(res.status).toBe(409);
    expect(await getStock(inStockId)).toBe(5);
    expect(await getStock(lowStockId)).toBe(1);
    expect(await countOrderLines(inStockId)).toBe(0);
    expect(await countOrders()).toBe(ordersBefore);
  });

  it('returns 404 when the status update targets a missing order', async () => {
    /** Catches a status update on a missing order that reports success. */
    const res = await request(app)
      .patch('/api/orders/2147483647/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'shipped' });

    expect(res.status).toBe(404);
  });
});
