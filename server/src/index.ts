import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { habitRoutes } from './routes/habits';
import { entryRoutes } from './routes/entries';
import { analyticsRoutes } from './routes/analytics';
import { syncRoutes } from './routes/sync';
import { notificationRoutes } from './routes/notifications';
import { settingsRoutes } from './routes/settings';
import { startScheduler } from './scheduler';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/habits', habitRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// Health check that the frontend can use or just for ping
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Create tables if using something like SQLite, or trust Prisma migrations for Postgres
// In our case we run `npx prisma migrate dev` manually, so Prisma manages the schema

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  startScheduler();
});

export default app;
