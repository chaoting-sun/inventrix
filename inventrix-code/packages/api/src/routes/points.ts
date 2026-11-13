import { Router } from 'express';
import { query } from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { protectedRouteRateLimit } from '../middleware/rateLimit.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { EARN_AMOUNT, tryRegisterEarn, revertEarn } from '../services/points.js';

const router = Router();

const getBalance = async (userId: number): Promise<number | undefined> => {
  const { rows } = await query<{ points: number }>('SELECT points FROM users WHERE id = $1', [userId]);
  return rows[0]?.points;
};

router.get('/me/points', protectedRouteRateLimit, authenticate, asyncHandler<AuthRequest>(async (req, res) => {
  const balance = await getBalance(req.user!.id);
  if (balance === undefined) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  res.json({ balance });
}));

router.post('/points/earn', protectedRouteRateLimit, authenticate, asyncHandler<AuthRequest>(async (req, res) => {
  const userId = req.user!.id;
  if ((await getBalance(userId)) === undefined) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const now = Date.now();
  if (!tryRegisterEarn(userId, now)) {
    return res.status(429).json({ error: 'Too many earn requests, please try again later' });
  }

  let rows: { points: number }[];
  try {
    ({ rows } = await query<{ points: number }>(
      'UPDATE users SET points = points + $1 WHERE id = $2 RETURNING points',
      [EARN_AMOUNT, userId]
    ));
  } catch (error) {
    revertEarn(userId, now);
    return res.status(500).json({ error: 'Failed to add points' });
  }
  res.json({ balance: rows[0].points });
}));

export default router;
