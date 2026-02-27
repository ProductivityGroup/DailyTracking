import { Router, Request, Response } from 'express';
import prisma from '../db';

export const entryRoutes = Router();

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/entries?date=YYYY-MM-DD — get all entries for a date
entryRoutes.get('/', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const where: any = { user_id: DEFAULT_USER_ID };
    if (date) where.date = date as string;

    const entries = await prisma.habitEntry.findMany({ where });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// POST /api/entries — create or update entry (upsert on habit_id + date)
entryRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const { habit_id, date, value, completed, notes } = req.body;
    const entry = await prisma.habitEntry.upsert({
      where: {
        habit_id_date: { habit_id, date }
      },
      update: { value, completed, notes },
      create: {
        habit_id,
        user_id: DEFAULT_USER_ID,
        date,
        value,
        completed,
        notes
      }
    });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save entry' });
  }
});

// GET /api/entries/:habitId/history — full history for a habit
entryRoutes.get('/:habitId/history', async (req: Request, res: Response) => {
  try {
    const entries = await prisma.habitEntry.findMany({
      where: { habit_id: req.params.habitId, user_id: DEFAULT_USER_ID },
      orderBy: { date: 'desc' }
    });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});
