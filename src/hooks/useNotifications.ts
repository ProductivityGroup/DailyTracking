import { useEffect } from 'react';
import { useHabits, useDateEntries } from './useHabits';
import { useApi } from './useApi';

export function useNotifications() {
  const { habits } = useHabits();
  const { dateEntries: todayEntries } = useDateEntries();
  const { apiFetch } = useApi();

  useEffect(() => {
    // Request permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Check every minute if we need to remind the user
    const interval = setInterval(() => {
      const now = new Date();

      // Configurable daily reminder
      const savedTime = localStorage.getItem('localReminderTime') || '20:00';
      const [hourStr, minuteStr] = savedTime.split(':');
      const reminderHour = parseInt(hourStr, 10);
      const reminderMinute = parseInt(minuteStr, 10);

      if (now.getHours() === reminderHour && now.getMinutes() === reminderMinute) {
        checkAndNotify();
      }

      // Weekly digest on Sunday at 9:00 PM
      if (now.getDay() === 0 && now.getHours() === 21 && now.getMinutes() === 0) {
        sendWeeklyDigest();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [habits, todayEntries]);

  const checkAndNotify = () => {
    if (!habits || habits.length === 0) return;
    if (Notification.permission !== 'granted') return;

    const uncompleted = habits.filter(h =>
      !todayEntries?.some(e => e.habit_id === h.id && e.completed)
    );

    // Smart suppression: only notify if there are uncompleted habits
    if (uncompleted.length > 0) {
      new Notification('Daily Habit Tracker', {
        body: `You have ${uncompleted.length} habit(s) left to complete today. Time to get them done!`,
        icon: '/vite.svg'
      });
    }
  };

  const sendWeeklyDigest = async () => {
    if (Notification.permission !== 'granted') return;

    try {
      const res = await apiFetch('/notifications/digest');
      if (!res.ok) return;
      const data = await res.json();

      const bestLine = data.bestHabit
        ? `\n🏆 Best: ${data.bestHabit.icon} ${data.bestHabit.name} (${data.bestHabit.rate}%)`
        : '';
      const worstLine = data.worstHabit && data.worstHabit.rate < 100
        ? `\n💪 Needs work: ${data.worstHabit.icon} ${data.worstHabit.name} (${data.worstHabit.rate}%)`
        : '';

      new Notification('📊 Weekly Digest', {
        body: `Completion rate: ${data.completionRate}% (${data.totalCompletions}/${data.totalPossible} check-ins)${bestLine}${worstLine}`,
        icon: '/vite.svg'
      });
    } catch (err) {
      console.error('Weekly digest failed:', err);
    }
  };

  // Expose a test function for manual verification
  const testNotification = () => {
    if (Notification.permission === 'granted') {
      checkAndNotify();
      // If none uncompleted, show a dummy one for testing
      if (!habits || habits.filter(h => !todayEntries?.some(e => e.habit_id === h.id && e.completed)).length === 0) {
        new Notification('Daily Habit Tracker', {
          body: 'All habits done today! (Test Notification)',
          icon: '/vite.svg'
        });
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          testNotification();
        }
      });
    }
  };

  return { testNotification };
}
