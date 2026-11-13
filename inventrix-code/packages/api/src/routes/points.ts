import { Router } from 'express';
import db from '../db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { protectedRouteRateLimit } from '../middleware/rateLimit.js';
import { EARN_AMOUNT, tryRegisterEarn, revertEarn } from '../services/points.js';

const router = Router();

const getBalance = (userId: number): number | undefined => {
  const row = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as { points: number } | undefined;
  return row?.points;
};

router.get('/me/points', protectedRouteRateLimit, authenticate, (req: AuthRequest, res) => {
  const balance = getBalance(req.user!.id);
  if (balance === undefined) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  res.json({ balance });
});

router.post('/points/earn', protectedRouteRateLimit, authenticate, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  if (getBalance(userId) === undefined) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const now = Date.now();
  if (!tryRegisterEarn(userId, now)) {
    return res.status(429).json({ error: 'Too many earn requests, please try again later' });
  }

  try {
    db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(EARN_AMOUNT, userId);
  } catch (error) {
    revertEarn(userId, now);
    return res.status(500).json({ error: 'Failed to add points' });
  }
  res.json({ balance: getBalance(userId) });
});

export default router;
