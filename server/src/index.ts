import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { habitRoutes } from './routes/habits';
import { entryRoutes } from './routes/entries';
import { analyticsRoutes } from './routes/analytics';
import { syncRoutes } from './routes/sync';
import { notificationRoutes } from './routes/notifications';

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
