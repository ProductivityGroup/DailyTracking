import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Habit, HabitEntry } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { v4 as uuidv4 } from 'uuid';
import { useProfiles } from '../ProfileContext';

export function useHabits() {
  const { activeProfile } = useProfiles();
  const profileId = activeProfile?.id || 'default';

  const habits = useLiveQuery(
    () => db.habits.filter(h => !h.is_archived && h.profile_id === profileId).toArray(),
    [profileId]
  );

  const addHabit = async (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'is_archived' | 'profile_id'>) => {
    const newHabit: Habit = {
      ...habit,
      id: uuidv4(),
      profile_id: profileId,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await db.habits.add(newHabit);
  };

  const deleteHabit = async (id: string) => {
    await db.habits.delete(id);
    await db.entries.where('habit_id').equals(id).delete();
  };

  return { habits, addHabit, deleteHabit };
}

export function useDateEntries(dateParam?: string) {
  const date = dateParam || getLocalDateString();
  const entries = useLiveQuery(() => db.entries.where('date').equals(date).toArray(), [date]);

  const toggleDateEntry = async (habitId: string, currentlyCompleted: boolean) => {
    const existing = await db.entries.where({ habit_id: habitId, date: date }).first();

    if (existing && existing.id) {
      if (currentlyCompleted) {
        // Toggle OFF
        await db.entries.update(existing.id, { completed: false });
      } else {
        await db.entries.update(existing.id, { completed: true });
      }
    } else if (!currentlyCompleted) {
      // Create new entry
      const newEntry: HabitEntry = {
        id: uuidv4(),
        habit_id: habitId,
        date: date,
        completed: true,
        created_at: new Date().toISOString()
      };
      await db.entries.add(newEntry);
    }
  };

  const setDateEntryValue = async (habitId: string, value: number, isCompleted: boolean) => {
    const existing = await db.entries.where({ habit_id: habitId, date: date }).first();

    if (existing && existing.id) {
      await db.entries.update(existing.id, { completed: isCompleted, value });
    } else {
      const newEntry: HabitEntry = {
        id: uuidv4(),
        habit_id: habitId,
        date: date,
        completed: isCompleted,
        value,
        created_at: new Date().toISOString()
      };
      await db.entries.add(newEntry);
    }
  };

  const removeDateEntry = async (habitId: string) => {
    const existing = await db.entries.where({ habit_id: habitId, date: date }).first();
    if (existing && existing.id) {
      await db.entries.delete(existing.id);
    }
  };

  return { dateEntries: entries, toggleDateEntry, setDateEntryValue, removeDateEntry };
}
