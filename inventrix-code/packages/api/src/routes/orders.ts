import { Router } from 'express';
import { PoolClient } from 'pg';
import { query, withTransaction } from '../db.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { protectedRouteRateLimit } from '../middleware/rateLimit.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { toPointPrice } from '../services/points.js';
import { isPositiveInteger, MAX_INT4, parseId } from '../validation.js';

const router = Router();

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const GST_RATE = 0.1;
const ORDER_NOT_FOUND = { error: 'Order not found' };

router.get('/', protectedRouteRateLimit, authenticate, asyncHandler<AuthRequest>(async (req, res) => {
  let result;
  if (req.user?.role === 'admin') {
    result = await query(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
  } else {
    result = await query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.user?.id]);
  }
  res.json(result.rows);
}));

router.get('/:id', protectedRouteRateLimit, authenticate, asyncHandler<AuthRequest>(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json(ORDER_NOT_FOUND);
  }

  const { rows } = await query(`
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    WHERE o.id = $1
  `, [id]);
  const order = rows[0];

  if (!order) {
    return res.status(404).json(ORDER_NOT_FOUND);
  }

  if (req.user?.role !== 'admin' && order.user_id !== req.user?.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const items = await query(`
    SELECT oi.*, p.name as product_name
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = $1
  `, [id]);

  res.json({ ...order, items: items.rows });
}));

class OrderError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** 驗證並合併相同商品的項目，避免以重複列繞過庫存檢查。 */
const parseItems = (body: any): Map<number, number> => {
  const items = body?.items;
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderError(400, 'items must be a non-empty array');
  }
  const merged = new Map<number, number>();
  for (const item of items) {
    if (!isPositiveInteger(item?.product_id) || !isPositiveInteger(item?.quantity)) {
      throw new OrderError(400, 'product_id and quantity must be positive integers');
    }
    if (item.product_id > MAX_INT4) {
      throw new OrderError(400, `Unknown product ${item.product_id}`);
    }
    merged.set(item.product_id, (merged.get(item.product_id) ?? 0) + item.quantity);
  }
  return merged;
};

// 結帳：單一交易內檢查庫存與點數，扣庫存、扣點、建立訂單。任何錯誤都會整筆回滾。
const checkout = async (client: PoolClient, userId: number, lines: Map<number, number>) => {
  const productIds = [...lines.keys()].sort((a, b) => a - b);
  // Rows are locked in ascending id order so that two concurrent checkouts cannot deadlock.
  const { rows: products } = await client.query<{ id: number; price: number; stock: number }>(
    'SELECT id, price, stock FROM products WHERE id = ANY($1::int[]) ORDER BY id FOR UPDATE',
    [productIds]
  );
  const productById = new Map(products.map(p => [p.id, p]));

  let subtotal = 0;
  let pointsSpent = 0;
  const priced: { id: number; quantity: number; price: number }[] = [];

  for (const productId of productIds) {
    const quantity = lines.get(productId)!;
    const product = productById.get(productId);
    if (!product) {
      throw new OrderError(400, `Unknown product ${productId}`);
    }
    if (product.stock < quantity) {
      throw new OrderError(409, `Insufficient stock for product ${productId}`);
    }
    subtotal += product.price * quantity;
    pointsSpent += toPointPrice(product.price) * quantity;
    priced.push({ id: productId, quantity, price: product.price });
  }

  const { rows: users } = await client.query<{ points: number }>(
    'SELECT points FROM users WHERE id = $1 FOR UPDATE',
    [userId]
  );
  if (users.length === 0) {
    throw new OrderError(401, 'Invalid token');
  }
  if (users[0].points < pointsSpent) {
    throw new OrderError(402, 'Insufficient points');
  }

  const gst = subtotal * GST_RATE;
  const total = subtotal + gst;

  const { rows: orderRows } = await client.query<{ id: number }>(
    'INSERT INTO orders (user_id, subtotal, gst, total, status, points_spent) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [userId, subtotal, gst, total, 'pending', pointsSpent]
  );
  const orderId = orderRows[0].id;

  for (const line of priced) {
    await client.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
      [orderId, line.id, line.quantity, line.price]
    );
    await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [line.quantity, line.id]);
  }

  const { rows: charged } = await client.query<{ points: number }>(
    'UPDATE users SET points = points - $1 WHERE id = $2 RETURNING points',
    [pointsSpent, userId]
  );

  return { id: orderId, points_spent: pointsSpent, balance: charged[0].points };
};

router.post('/', protectedRouteRateLimit, authenticate, asyncHandler<AuthRequest>(async (req, res) => {
  try {
    const lines = parseItems(req.body);
    const order = await withTransaction((client) => checkout(client, req.user!.id, lines));
    res.status(201).json(order);
  } catch (error) {
    if (error instanceof OrderError) {
      return res.status(error.status).json({ error: error.message });
    }
    throw error;
  }
}));

router.patch('/:id/status', protectedRouteRateLimit, authenticate, requireAdmin, asyncHandler<AuthRequest>(async (req, res) => {
  const { status } = req.body;

  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${ORDER_STATUSES.join(', ')}` });
  }

  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json(ORDER_NOT_FOUND);
  }

  const result = await query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
  if (result.rowCount === 0) {
    return res.status(404).json(ORDER_NOT_FOUND);
  }

  res.json({ id: req.params.id, status });
}));

export default router;
