import prisma from './db';
import { sendNtfyNotification } from './services/smsService';

// This function is triggered securely by Vercel Cron every minute
export async function executeCronJob() {
  console.log('Cron job triggered by Vercel...');

  try {
    const now = new Date();
      const hh = now.getHours().toString().padStart(2, '0');
      const mm = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${hh}:${mm}`;

      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      // Find all active settings
      const allSettings = await prisma.reminderSettings.findMany({
        where: { sms_enabled: true },
        include: { user: true }
      });

      for (const setting of allSettings) {
        const isMorning = setting.morning_time === currentTimeStr;
        const isAfternoon = setting.afternoon_time === currentTimeStr;

        if (!isMorning && !isAfternoon) continue;

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

        let habitNames: string[];

        if (isMorning) {
          // Morning: show ALL habits as a heads-up for the day
          habitNames = allHabits.map(h => h.name);
          console.log(`[Morning] Sending full habit list to ${setting.user.email}`);
        } else {
          // Afternoon: show only uncompleted habits
          if (uncompletedHabits.length === 0) {
            console.log(`[Afternoon] All habits done for ${setting.user.email}. Skipping.`);
            continue;
          }
          habitNames = uncompletedHabits.map(h => h.name);
          console.log(`[Afternoon] Sending ${habitNames.length} uncompleted habit(s) to ${setting.user.email}`);
        }

        if (setting.sms_enabled && setting.phone) {
          sendNtfyNotification(setting.phone, habitNames).catch(console.error);
        }
      }
  } catch (error) {
    console.error('Cron job error:', error);
  }
}
