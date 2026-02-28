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
import { webhookRoutes } from './routes/webhooks';
import { startScheduler } from './scheduler';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Use Clerk to protect all API routes below this point
const requireAuth = ClerkExpressRequireAuth({});

// Webhooks from external services (e.g. Clerk user sync) must NOT be behind requireAuth
app.use('/api/webhooks', webhookRoutes);

// Protected Routes
app.use('/api/habits', requireAuth, habitRoutes);
app.use('/api/entries', requireAuth, entryRoutes);
app.use('/api/analytics', requireAuth, analyticsRoutes);
app.use('/api/sync', requireAuth, syncRoutes);
app.use('/api/notifications', requireAuth, notificationRoutes);
app.use('/api/settings', requireAuth, settingsRoutes);

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
