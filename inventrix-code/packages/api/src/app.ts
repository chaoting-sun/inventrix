import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import ordersRoutes from './routes/orders.js';
import analyticsRoutes from './routes/analytics.js';
import pointsRoutes from './routes/points.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use('/images', express.static(path.join(__dirname, '../public/images')));

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api', pointsRoutes);

  // Express identifies error middleware by its four-argument signature.
  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    console.error(`Request failed: ${req.method} ${req.originalUrl}`, err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};
