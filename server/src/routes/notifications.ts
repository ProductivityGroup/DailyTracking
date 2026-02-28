import { Router, Request, Response } from 'express';
import prisma from '../db';

export const notificationRoutes = Router();

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/notifications/check — returns uncompleted habits for today (smart suppression)
notificationRoutes.get('/check', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const today = new Date().toISOString().split('T')[0];

    const habits = await prisma.habit.findMany({
      where: { user_id: userId, is_archived: false }
    });

    const completedEntries = await prisma.habitEntry.findMany({
      where: { user_id: userId, date: today, completed: true }
    });

    const completedHabitIds = new Set(completedEntries.map(e => e.habit_id));
    const uncompleted = habits.filter(h => !completedHabitIds.has(h.id));

    res.json({
      total: habits.length,
      completed: completedEntries.length,
      uncompleted: uncompleted.length,
      uncompletedHabits: uncompleted.map(h => ({ id: h.id, name: h.name, icon: h.icon })),
      shouldNotify: uncompleted.length > 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check notifications' });
  }
});

// GET /api/notifications/digest — weekly stats summary for digest notifications
notificationRoutes.get('/digest', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const habits = await prisma.habit.findMany({
      where: { user_id: userId, is_archived: false }
    });

    const weekEntries = await prisma.habitEntry.findMany({
      where: {
        user_id: userId,
        date: { gte: weekAgoStr, lte: todayStr },
        completed: true
      }
    });

    const totalPossible = habits.length * 7;
    const completionRate = totalPossible > 0
      ? Math.round((weekEntries.length / totalPossible) * 100)
      : 0;

    // Per-habit weekly stats
    const habitStats = habits.map(h => {
      const entries = weekEntries.filter(e => e.habit_id === h.id);
      return {
        name: h.name,
        icon: h.icon,
        completedDays: entries.length,
        rate: Math.round((entries.length / 7) * 100)
      };
    });

    // Best and worst habits
    const sorted = [...habitStats].sort((a, b) => b.rate - a.rate);
    const best = sorted[0] || null;
    const worst = sorted[sorted.length - 1] || null;

    res.json({
      period: `${weekAgoStr} to ${todayStr}`,
      totalCompletions: weekEntries.length,
      totalPossible,
      completionRate,
      habitStats,
      bestHabit: best,
      worstHabit: worst
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate digest' });
  }
});
