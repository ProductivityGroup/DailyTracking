import { Router, Request, Response } from 'express';
import prisma from '../db';

export const analyticsRoutes = Router();

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/analytics/summary — overall stats
analyticsRoutes.get('/summary', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const habits = await prisma.habit.findMany({
      where: { user_id: userId, is_archived: false }
    });

    const today = new Date().toISOString().split('T')[0];
    const todayEntries = await prisma.habitEntry.findMany({
      where: { user_id: userId, date: today, completed: true }
    });

    // Last 30 days completion rate
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const recentEntries = await prisma.habitEntry.findMany({
      where: {
        user_id: userId,
        date: { gte: dateStr },
        completed: true
      }
    });

    const totalPossible = habits.length * 30;
    const consistencyScore = totalPossible > 0
      ? Math.round((recentEntries.length / totalPossible) * 100)
      : 0;

    res.json({
      total_habits: habits.length,
      completed_today: todayEntries.length,
      consistency_score_30d: consistencyScore,
      total_checkins: recentEntries.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute summary' });
  }
});

// GET /api/analytics/:habitId — per-habit stats
analyticsRoutes.get('/:habitId', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { habitId } = req.params;
    const entries = await prisma.habitEntry.findMany({
      where: { habit_id: habitId, user_id: userId, completed: true },
      orderBy: { date: 'asc' }
    });

    // Compute streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const dates = entries.map(e => e.date);
    const today = new Date();

    for (let i = 0; i < dates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // Check if current streak extends to today
    if (dates.length > 0) {
      const lastDate = new Date(dates[dates.length - 1]);
      const diffToToday = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      currentStreak = diffToToday <= 1 ? tempStreak : 0;
    }

    // Completion rates
    const last7 = dates.filter(d => {
      const diff = Math.round((today.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
      return diff <= 7;
    }).length;

    const last30 = dates.filter(d => {
      const diff = Math.round((today.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
      return diff <= 30;
    }).length;

    // Heatmap data (last 365 days)
    const heatmap = entries.map(e => ({
      date: e.date,
      value: e.value ?? (e.completed ? 1 : 0)
    }));

    res.json({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      completion_rate_7d: Math.round((last7 / 7) * 100),
      completion_rate_30d: Math.round((last30 / 30) * 100),
      completion_rate_all: entries.length,
      heatmap
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute analytics' });
  }
});
