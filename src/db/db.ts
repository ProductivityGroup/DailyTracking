import Dexie, { Table } from 'dexie';
import { Habit, HabitEntry, Profile } from '../types';

export class TrackingDB extends Dexie {
  habits!: Table<Habit, string>;
  entries!: Table<HabitEntry, string>;
  profiles!: Table<Profile, string>;

  constructor() {
    super('DailyTrackingDB');
    this.version(2).stores({
      profiles: 'id, name, created_at',
      habits: 'id, profile_id, name, type, is_archived, created_at',
      entries: 'id, habit_id, date, [habit_id+date]'
    }).upgrade(tx => {
       // Apply 'default' profile to all existing habits if missing
       tx.table('habits').toCollection().modify(habit => {
           if (!habit.profile_id) habit.profile_id = 'default';
       });
    });

    this.version(1).stores({
      habits: 'id, name, type, is_archived, created_at',
      entries: 'id, habit_id, date, [habit_id+date]'
    });
  }
}

export const db = new TrackingDB();
