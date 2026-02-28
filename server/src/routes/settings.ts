import { Router, Request, Response } from 'express';
import prisma from '../db';

const settingsRoutes = Router();

// GET /api/settings/reminders
settingsRoutes.get('/reminders', async (_req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return res.status(404).json({ error: 'User not found' });

    let settings = await prisma.reminderSettings.findUnique({
      where: { user_id: user.id }
    });

    if (!settings) {
      settings = await prisma.reminderSettings.create({
        data: { user_id: user.id }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching reminder settings:', error);
    res.status(500).json({ error: 'Failed to fetch reminder settings' });
  }
});

// POST /api/settings/reminders
settingsRoutes.post('/reminders', async (req: Request, res: Response) => {
  try {
    const { sms_enabled, phone, morning_time, afternoon_time } = req.body;

    const user = await prisma.user.findFirst();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const settings = await prisma.reminderSettings.upsert({
      where: { user_id: user.id },
      update: { sms_enabled, phone, morning_time, afternoon_time },
      create: { user_id: user.id, sms_enabled, phone, morning_time, afternoon_time }
    });

    res.json(settings);
  } catch (error) {
    console.error('Error updating reminder settings:', error);
    res.status(500).json({ error: 'Failed to update reminder settings' });
  }
});

// POST /api/settings/reminders/test - fire a test notification immediately
settingsRoutes.post('/reminders/test', async (_req: Request, res: Response) => {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return res.status(404).json({ error: 'User not found' });

    const settings = await prisma.reminderSettings.findUnique({ where: { user_id: user.id } });
    if (!settings) return res.status(404).json({ error: 'No reminder settings found. Save settings first.' });

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const allHabits = await prisma.habit.findMany({ where: { user_id: user.id, is_archived: false } });
    const completedEntries = await prisma.habitEntry.findMany({
      where: { user_id: user.id, date: dateStr, completed: true }
    });
    const completedIds = new Set(completedEntries.map(e => e.habit_id));
    const uncompletedNames = allHabits.filter(h => !completedIds.has(h.id)).map(h => h.name);
    const allNames = allHabits.map(h => h.name);

    // Test with realistic data — use all habits if nothing is uncompleted
    const habitNames = uncompletedNames.length > 0 ? uncompletedNames : (allNames.length > 0 ? allNames.map(n => n + ' (demo)') : ['No habits yet!']);

    const sent: string[] = [];

    if (settings.sms_enabled && settings.phone) {
      const count = habitNames.length;
      const label = uncompletedNames.length > 0 ? `${count} habit${count !== 1 ? 's' : ''} still left today:` : `Today's habits (demo):`;
      await fetch(`https://ntfy.sh/${settings.phone.trim()}`, {
        method: 'POST',
        headers: {
          'Title': 'DailyTracking Test Reminder',
          'Priority': 'default',
          'Tags': 'white_check_mark',
          'Content-Type': 'text/plain'
        },
        body: `${label}\n${habitNames.map(n => `  - ${n}`).join('\n')}`
      });
      sent.push(`ntfy (${settings.phone})`);
    }

    if (sent.length === 0) {
      return res.status(400).json({ error: 'No notification methods enabled. Toggle on ntfy or email in settings.' });
    }

    res.json({ success: true, sent });
  } catch (error: any) {
    console.error('Error sending test notification:', error?.message || error);
    res.status(500).json({ error: 'Failed to send test notification', detail: error?.message || String(error) });
  }
});

export { settingsRoutes };
