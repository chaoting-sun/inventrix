import { describe, it, expect, afterAll } from 'vitest';
import { initDb, query, closeDb } from '../src/db.js';

describe.skipIf(!process.env.DATABASE_URL)('initDb (PostgreSQL)', () => {
  afterAll(async () => {
    await closeDb();
  });

  it('runs twice without error', async () => {
    /** Catches a schema or seed step that is not idempotent and fails on an existing database. */
    await initDb();
    await initDb();

    const { rows } = await query<{ count: number }>(
      "SELECT COUNT(*)::int AS count FROM users WHERE email IN ('admin@inventrix.com', 'customer@inventrix.com')"
    );
    expect(rows[0].count).toBe(2);
  });

  it('gives a new user 0 points and a new order 0 points_spent', async () => {
    /** Catches a missing points or points_spent column, or a wrong default. */
    await initDb();
    const email = `points-default-${Date.now()}@test.local`;

    try {
      const user = await query<{ id: number; points: number }>(
        "INSERT INTO users (email, password, name, role) VALUES ($1, 'x', 'Points Test', 'customer') RETURNING id, points",
        [email]
      );
      expect(user.rows[0].points).toBe(0);

      const order = await query<{ points_spent: number }>(
        "INSERT INTO orders (user_id, subtotal, gst, total, status) VALUES ($1, 0, 0, 0, 'pending') RETURNING points_spent",
        [user.rows[0].id]
      );
      expect(order.rows[0].points_spent).toBe(0);
    } finally {
      await query('DELETE FROM orders WHERE user_id IN (SELECT id FROM users WHERE email = $1)', [email]);
      await query('DELETE FROM users WHERE email = $1', [email]);
    }
  });
});
