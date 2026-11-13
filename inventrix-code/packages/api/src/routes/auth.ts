import { Router } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../db.js';
import { generateToken } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimit.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.post('/login', authRateLimit, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
}));

router.post('/register', authRateLimit, asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = await query<{ id: number }>(
    'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
    [email, hashedPassword, name, 'customer']
  );
  const id = result.rows[0].id;

  const token = generateToken({ id, email, role: 'customer' });

  res.status(201).json({
    token,
    user: { id, email, name, role: 'customer' }
  });
}));

export default router;
