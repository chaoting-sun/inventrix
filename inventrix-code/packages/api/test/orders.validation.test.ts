import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../src/db.js', () => ({
  query: vi.fn(),
  withTransaction: vi.fn(),
  initDb: vi.fn(),
  closeDb: vi.fn(),
}));

import { createApp } from '../src/app.js';
import { query, withTransaction } from '../src/db.js';
import { generateToken } from '../src/middleware/auth.js';

const app = createApp();
const customerToken = generateToken({ id: 2, email: 'customer@inventrix.com', role: 'customer' });
const adminToken = generateToken({ id: 1, email: 'admin@inventrix.com', role: 'admin' });

const postOrder = (items: unknown) =>
  request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({ items });

const expectDbUntouched = () => {
  expect(query).not.toHaveBeenCalled();
  expect(withTransaction).not.toHaveBeenCalled();
};

describe('POST /api/orders validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for quantity 0', async () => {
    /** Catches a zero quantity that reaches the database and creates an empty order line. */
    const res = await postOrder([{ product_id: 1, quantity: 0 }]);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/quantity/);
    expectDbUntouched();
  });

  it('returns 400 for quantity 1.5', async () => {
    /** Catches a fractional quantity that reaches the database. */
    const res = await postOrder([{ product_id: 1, quantity: 1.5 }]);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/quantity/);
    expectDbUntouched();
  });

  it('returns 400 for an empty items array', async () => {
    /** Catches an order with no lines that is created with a zero total. */
    const res = await postOrder([]);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/items/);
    expectDbUntouched();
  });
});

describe('PATCH /api/orders/:id/status validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for a status outside the allowed set', async () => {
    /** Catches an unknown status that reaches the database and fails as a 500 on the CHECK constraint. */
    const res = await request(app)
      .patch('/api/orders/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'lost' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/status/);
    expectDbUntouched();
  });
});
