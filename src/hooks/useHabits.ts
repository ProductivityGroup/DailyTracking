import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Habit, HabitEntry } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { v4 as uuidv4 } from 'uuid';

export function useHabits() {
  const habits = useLiveQuery(() => db.habits.filter(h => !h.is_archived).toArray());

  const addHabit = async (habit: Omit<Habit, 'id' | 'created_at' | 'updated_at' | 'is_archived'>) => {
    const newHabit: Habit = {
      ...habit,
      id: uuidv4(),
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

export function useTodayEntries() {
  const today = getLocalDateString();
  const entries = useLiveQuery(() => db.entries.where('date').equals(today).toArray(), [today]);

  const toggleTodayEntry = async (habitId: string, currentlyCompleted: boolean) => {
    const existing = await db.entries.where({ habit_id: habitId, date: today }).first();

    if (existing && existing.id) {
      if (currentlyCompleted) {
        // Toggle OFF (optional: in some habit trackers you might just delete the entry or set completed to false)
        await db.entries.update(existing.id, { completed: false });
      } else {
        await db.entries.update(existing.id, { completed: true });
      }
    } else if (!currentlyCompleted) {
      // Create new entry
      const newEntry: HabitEntry = {
        id: uuidv4(),
        habit_id: habitId,
        date: today,
        completed: true,
        created_at: new Date().toISOString()
      };
      await db.entries.add(newEntry);
    }
  };

  const setTodayEntryValue = async (habitId: string, value: number, isCompleted: boolean) => {
    const existing = await db.entries.where({ habit_id: habitId, date: today }).first();

    if (existing && existing.id) {
      await db.entries.update(existing.id, { completed: isCompleted, value });
    } else {
      const newEntry: HabitEntry = {
        id: uuidv4(),
        habit_id: habitId,
        date: today,
        completed: isCompleted,
        value,
        created_at: new Date().toISOString()
      };
      await db.entries.add(newEntry);
    }
  };

  return { todayEntries: entries, toggleTodayEntry, setTodayEntryValue };
}
