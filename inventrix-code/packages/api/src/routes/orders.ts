import { Router } from 'express';
import db from '../db.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { protectedRouteRateLimit } from '../middleware/rateLimit.js';
import { toPointPrice } from '../services/points.js';

const router = Router();

router.get('/', protectedRouteRateLimit, authenticate, (req: AuthRequest, res) => {
  let orders;
  if (req.user?.role === 'admin') {
    orders = db.prepare(`
      SELECT o.*, u.name as user_name, u.email as user_email 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `).all();
  } else {
    orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user?.id);
  }
  res.json(orders);
});

router.get('/:id', protectedRouteRateLimit, authenticate, (req: AuthRequest, res) => {
  const order = db.prepare(`
    SELECT o.*, u.name as user_name, u.email as user_email 
    FROM orders o 
    JOIN users u ON o.user_id = u.id 
    WHERE o.id = ?
  `).get(req.params.id) as any;

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (req.user?.role !== 'admin' && order.user_id !== req.user?.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const items = db.prepare(`
    SELECT oi.*, p.name as product_name 
    FROM order_items oi 
    JOIN products p ON oi.product_id = p.id 
    WHERE oi.order_id = ?
  `).all(req.params.id);

  res.json({ ...order, items });
});

class OrderError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const isPositiveInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v > 0;

/** 驗證並合併相同商品的項目，避免以重複列繞過庫存檢查。 */
const parseItems = (body: any): Map<number, number> => {
  const items = body?.items;
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderError(400, 'items must be a non-empty array');
  }
  const merged = new Map<number, number>();
  for (const item of items) {
    if (!isPositiveInt(item?.product_id) || !isPositiveInt(item?.quantity)) {
      throw new OrderError(400, 'product_id and quantity must be positive integers');
    }
    merged.set(item.product_id, (merged.get(item.product_id) ?? 0) + item.quantity);
  }
  return merged;
};

// 結帳：單一交易內檢查庫存與點數，扣庫存、扣點、建立訂單。任何錯誤都會整筆回滾。
const checkout = db.transaction((userId: number, lines: Map<number, number>) => {
  let subtotal = 0;
  let pointsSpent = 0;
  const priced: { id: number; quantity: number; price: number }[] = [];

  for (const [productId, quantity] of lines) {
    const product = db.prepare('SELECT id, price, stock FROM products WHERE id = ?').get(productId) as
      | { id: number; price: number; stock: number }
      | undefined;
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

  const user = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as { points: number } | undefined;
  if (!user) {
    throw new OrderError(401, 'Invalid token');
  }
  if (user.points < pointsSpent) {
    throw new OrderError(402, 'Insufficient points');
  }

  const gst = subtotal * 0.1;
  const total = subtotal + gst;

  const orderId = db.prepare(
    'INSERT INTO orders (user_id, subtotal, gst, total, status, points_spent) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(userId, subtotal, gst, total, 'pending', pointsSpent).lastInsertRowid;

  for (const line of priced) {
    db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)').run(
      orderId, line.id, line.quantity, line.price
    );
    const updated = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?').run(
      line.quantity, line.id, line.quantity
    );
    if (updated.changes !== 1) {
      throw new OrderError(409, `Insufficient stock for product ${line.id}`);
    }
  }

  const charged = db.prepare('UPDATE users SET points = points - ? WHERE id = ? AND points >= ?').run(
    pointsSpent, userId, pointsSpent
  );
  if (charged.changes !== 1) {
    throw new OrderError(402, 'Insufficient points');
  }

  const balance = (db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as { points: number }).points;
  return { id: Number(orderId), points_spent: pointsSpent, balance };
});

router.post('/', protectedRouteRateLimit, authenticate, (req: AuthRequest, res) => {
  try {
    const lines = parseItems(req.body);
    res.status(201).json(checkout(req.user!.id, lines));
  } catch (error) {
    if (error instanceof OrderError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Checkout failed', error);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

router.patch('/:id/status', protectedRouteRateLimit, authenticate, requireAdmin, (req: AuthRequest, res) => {
  const { status } = req.body;
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ id: req.params.id, status });
});

export default router;
