import { Router } from 'express';
import { query } from '../db.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { generateProductImage } from '../services/imageGenerator.js';
import { protectedRouteRateLimit } from '../middleware/rateLimit.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { withPointPrice } from '../services/points.js';
import { parseId } from '../validation.js';

const router = Router();

const PRODUCT_NOT_FOUND = { error: 'Product not found' };

router.get('/', asyncHandler(async (req, res) => {
  const { rows } = await query<{ price: number }>('SELECT * FROM products ORDER BY created_at DESC');
  res.json(rows.map(withPointPrice));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json(PRODUCT_NOT_FOUND);
  }
  const { rows } = await query<{ price: number }>('SELECT * FROM products WHERE id = $1', [id]);
  if (rows.length === 0) {
    return res.status(404).json(PRODUCT_NOT_FOUND);
  }
  res.json(withPointPrice(rows[0]));
}));

router.post('/', protectedRouteRateLimit, authenticate, requireAdmin, asyncHandler<AuthRequest>(async (req, res) => {
  const { name, description, price, stock, image_url } = req.body;
  const result = await query<{ id: number }>(
    'INSERT INTO products (name, description, price, stock, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [name, description, price, stock, image_url]
  );
  res.status(201).json({ id: result.rows[0].id, name, description, price, stock, image_url });
}));

router.put('/:id', protectedRouteRateLimit, authenticate, requireAdmin, asyncHandler<AuthRequest>(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json(PRODUCT_NOT_FOUND);
  }
  const { name, description, price, stock, image_url } = req.body;
  await query(
    'UPDATE products SET name = $1, description = $2, price = $3, stock = $4, image_url = $5 WHERE id = $6',
    [name, description, price, stock, image_url, id]
  );
  res.json({ id: req.params.id, name, description, price, stock, image_url });
}));

router.delete('/:id', protectedRouteRateLimit, authenticate, requireAdmin, asyncHandler<AuthRequest>(async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json(PRODUCT_NOT_FOUND);
  }
  await query('DELETE FROM products WHERE id = $1', [id]);
  res.status(204).send();
}));

router.post('/generate-image', protectedRouteRateLimit, authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { productName, description } = req.body;
    const imageUrl = await generateProductImage(productName, description);
    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Image generation failed' });
  }
});

export default router;
