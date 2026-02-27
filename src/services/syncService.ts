import { db } from '../db/db';

const API_BASE = 'http://localhost:3001/api';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

export async function syncToServer(): Promise<SyncStatus> {
  if (!navigator.onLine) return 'offline';

  try {
    // Push all local habits
    const habits = await db.habits.toArray();
    if (habits.length > 0) {
      await fetch(`${API_BASE}/sync/habits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habits })
      });
    }

    // Push all local entries
    const entries = await db.entries.toArray();
    if (entries.length > 0) {
      await fetch(`${API_BASE}/sync/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries })
      });
    }

    return 'success';
  } catch (err) {
    console.error('Sync failed:', err);
    return 'error';
  }
}

export async function fetchAnalytics(habitId: string) {
  try {
    const res = await fetch(`${API_BASE}/analytics/${habitId}`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return await res.json();
  } catch (err) {
    console.error('Analytics fetch failed:', err);
    return null;
  }
}

export async function fetchSummary() {
  try {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    if (!res.ok) throw new Error('Failed to fetch summary');
    return await res.json();
  } catch (err) {
    console.error('Summary fetch failed:', err);
    return null;
  }
}
