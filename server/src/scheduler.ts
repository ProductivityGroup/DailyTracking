import prisma from './db';
import { sendNtfyNotification } from './services/smsService';

export async function executeCronJob() {
  console.log('Cron job triggered by Vercel for the daily summary...');

  try {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Find all users who want notifications
    const allSettings = await prisma.reminderSettings.findMany({
      where: { sms_enabled: true },
      include: { user: true }
    });

    for (const setting of allSettings) {
      if (!setting.phone) continue;

      // Fetch all active habits for this user
      const allHabits = await prisma.habit.findMany({
        where: { user_id: setting.user_id, is_archived: false }
      });

        if (allHabits.length === 0) continue;

      const todayEntries = await prisma.habitEntry.findMany({
        where: { user_id: setting.user_id, date: dateStr, completed: true }
      });

      const completedIds = new Set(todayEntries.map(e => e.habit_id));
      const uncompletedHabits = allHabits.filter(h => !completedIds.has(h.id));

      if (uncompletedHabits.length === 0) {
        console.log(`[Daily Summary] All habits done for ${setting.user.email}. Skipping.`);
        continue;
      }

      const habitNames = uncompletedHabits.map(h => h.name);
      console.log(`[Daily Summary] Sending ${habitNames.length} uncompleted habit(s) to ${setting.user.email}`);

      sendNtfyNotification(setting.phone, habitNames).catch(console.error);
    }
  } catch (error) {
    console.error('Cron job error:', error);
  }
}
