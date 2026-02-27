import { Router, Request, Response } from 'express';
import prisma from '../db';

export const syncRoutes = Router();

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

// POST /api/sync/habits — bulk upsert habits from client
syncRoutes.post('/habits', async (req: Request, res: Response) => {
  try {
    const habits = req.body.habits as any[];
    const results = [];

    for (const h of habits) {
      const result = await prisma.habit.upsert({
        where: { id: h.id },
        update: {
          name: h.name,
          description: h.description,
          type: (h.type as string).toUpperCase() as any,
          target_value: h.target_value,
          unit: h.unit,
          color: h.color,
          icon: h.icon,
          category: h.category,
          frequency_type: ((h.frequency_type as string) || 'daily').toUpperCase() as any,
          frequency_days: h.frequency_days || [],
          is_archived: h.is_archived ?? false
        },
        create: {
          id: h.id,
          user_id: DEFAULT_USER_ID,
          name: h.name,
          description: h.description,
          type: (h.type as string).toUpperCase() as any,
          target_value: h.target_value,
          unit: h.unit,
          color: h.color,
          icon: h.icon,
          category: h.category,
          frequency_type: ((h.frequency_type as string) || 'daily').toUpperCase() as any,
          frequency_days: h.frequency_days || [],
          is_archived: h.is_archived ?? false
        }
      });
      results.push(result);
    }

    res.json({ synced: results.length });
  } catch (err) {
    console.error('Sync habits error:', err);
    res.status(500).json({ error: 'Failed to sync habits' });
  }
});

// POST /api/sync/entries — bulk upsert entries from client
syncRoutes.post('/entries', async (req: Request, res: Response) => {
  try {
    const entries = req.body.entries as any[];
    const results = [];

    for (const e of entries) {
      const result = await prisma.habitEntry.upsert({
        where: {
          habit_id_date: { habit_id: e.habit_id, date: e.date }
        },
        update: {
          value: e.value,
          completed: e.completed,
          notes: e.notes
        },
        create: {
          id: e.id,
          habit_id: e.habit_id,
          user_id: DEFAULT_USER_ID,
          date: e.date,
          value: e.value,
          completed: e.completed,
          notes: e.notes
        }
      });
      results.push(result);
    }

    res.json({ synced: results.length });
  } catch (err) {
    console.error('Sync entries error:', err);
    res.status(500).json({ error: 'Failed to sync entries' });
  }
});
