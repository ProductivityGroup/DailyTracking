export type HabitType = 'boolean' | 'numeric' | 'duration' | 'rating';
export type FrequencyType = 'daily' | 'weekly' | 'custom';

export interface Habit {
  id?: string; // Optional for Dexie auto-increment/UUID generation if needed, though we will use uuid v4
  name: string;
  description?: string;
  type: HabitType;
  target_value?: number;
  unit?: string;
  color: string;
  icon: string;
  category?: string;
  frequency_type: FrequencyType;
  frequency_days?: number[];
  is_archived: boolean;
  created_at: string; // ISO date string
  updated_at: string;
}

export interface HabitEntry {
  id?: string;
  habit_id: string; // Foreign key
  date: string; // YYYY-MM-DD
  value?: number;
  completed: boolean;
  notes?: string;
  created_at: string;
}
