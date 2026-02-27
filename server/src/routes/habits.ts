import { Router, Request, Response } from 'express';
import prisma from '../db';

export const habitRoutes = Router();

// Default user ID for single-user mode (V1)
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/habits — list all habits for the user
habitRoutes.get('/', async (_req: Request, res: Response) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { user_id: DEFAULT_USER_ID },
      orderBy: { created_at: 'desc' }
    });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// POST /api/habits — create a new habit
habitRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const habit = await prisma.habit.create({
      data: {
        ...req.body,
        user_id: DEFAULT_USER_ID,
        type: (req.body.type as string).toUpperCase(),
        frequency_type: (req.body.frequency_type as string || 'daily').toUpperCase()
      }
    });
    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

// PATCH /api/habits/:id — update a habit
habitRoutes.patch('/:id', async (req: Request, res: Response) => {
  try {
    const habit = await prisma.habit.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update habit' });
  }
});

// DELETE /api/habits/:id — archive a habit (soft delete)
habitRoutes.delete('/:id', async (req: Request, res: Response) => {
  try {
    const habit = await prisma.habit.update({
      where: { id: req.params.id },
      data: { is_archived: true }
    });
    res.json(habit);
  } catch (err) {
    res.status(500).json({ error: 'Failed to archive habit' });
  }
});
