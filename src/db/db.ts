import Dexie, { Table } from 'dexie';
import { Habit, HabitEntry } from '../types';

export class TrackingDB extends Dexie {
  habits!: Table<Habit, string>;
  entries!: Table<HabitEntry, string>;

  constructor() {
    super('DailyTrackingDB');
    this.version(1).stores({
      habits: 'id, name, type, is_archived, created_at',
      entries: 'id, habit_id, date, [habit_id+date]'
    });
  }
}

export const db = new TrackingDB();
