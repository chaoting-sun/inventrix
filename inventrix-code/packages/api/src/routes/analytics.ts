import { Router } from 'express';
import { query } from '../db.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { protectedRouteRateLimit } from '../middleware/rateLimit.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/dashboard', protectedRouteRateLimit, authenticate, requireAdmin, asyncHandler<AuthRequest>(async (req, res) => {
  const [totalRevenue, totalOrders, totalProducts, lowStock, recentOrders, topProducts, ordersByStatus] = await Promise.all([
    query("SELECT COALESCE(SUM(total), 0)::float as revenue FROM orders WHERE status != 'cancelled'"),
    query('SELECT COUNT(*)::int as count FROM orders'),
    query('SELECT COUNT(*)::int as count FROM products'),
    query('SELECT COUNT(*)::int as count FROM products WHERE stock < 10'),
    query(`
      SELECT o.id, o.total, o.status, o.created_at, u.name as user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `),
    query(`
      SELECT p.name, SUM(oi.quantity)::int as total_sold, SUM(oi.quantity * oi.price)::float as revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT 5
    `),
    query(`
      SELECT status, COUNT(*)::int as count
      FROM orders
      GROUP BY status
    `)
  ]);

  res.json({
    summary: {
      totalRevenue: totalRevenue.rows[0].revenue,
      totalOrders: totalOrders.rows[0].count,
      totalProducts: totalProducts.rows[0].count,
      lowStockItems: lowStock.rows[0].count
    },
    recentOrders: recentOrders.rows,
    topProducts: topProducts.rows,
    ordersByStatus: ordersByStatus.rows
  });
}));

router.get('/inventory', protectedRouteRateLimit, authenticate, requireAdmin, asyncHandler<AuthRequest>(async (req, res) => {
  const { rows } = await query(`
    SELECT id, name, stock, price,
    CASE
      WHEN stock = 0 THEN 'out_of_stock'
      WHEN stock < 10 THEN 'low_stock'
      ELSE 'in_stock'
    END as status
    FROM products
    ORDER BY stock ASC
  `);

  res.json(rows);
}));

export default router;
