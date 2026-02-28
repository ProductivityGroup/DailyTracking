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
import { executeCronJob } from './scheduler';
import { requireAuth } from './authMiddleware';
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Secure Cron Endpoint for Vercel
app.get('/api/cron', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized cron trigger' });
  }

  await executeCronJob();
  res.status(200).json({ status: 'Cron job executed successfully' });
});

// Protected Routes using Supabase Auth
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

// Only call app.listen when running locally!
// Vercel Serverless Functions will export the app and handle the binding automatically.
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    // Local dev: We don't have Vercel Cron, so we can't reliably test times locally anymore
    // unless we curl the endpoint or set up node-cron strictly for dev mode.
  });
}

export default app;
