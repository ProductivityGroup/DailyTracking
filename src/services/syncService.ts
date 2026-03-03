import { db } from '../db/db';
import { supabase } from '../supabaseClient';
import { API_BASE } from '../config';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

async function authenticatedFetch(endpoint: string, options: RequestInit = {}) {

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${API_BASE}${endpoint}`, { ...options, headers });
}

export async function syncToServer(): Promise<SyncStatus> {
  if (!navigator.onLine) return 'offline';

  try {
    // PUSH profiles
    const profiles = await db.profiles.toArray();
    if (profiles.length > 0) {
      await authenticatedFetch('/sync/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profiles })
      });
    }

    // PUSH habits
    const habits = await db.habits.toArray();
    if (habits.length > 0) {
      await authenticatedFetch('/sync/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habits })
      });
    }

    // PUSH entries
    const entries = await db.entries.toArray();
    if (entries.length > 0) {
      await authenticatedFetch('/sync/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries })
      });
    }

    // PULL ALL DATA
    const res = await authenticatedFetch('/sync');
    if (res.ok) {
      const { profiles: serverProfiles, habits: serverHabits, entries: serverEntries } = await res.json();

      // Merge into local Dexie
      if (serverProfiles?.length > 0) await db.profiles.bulkPut(serverProfiles);

      // Map properties back if they differ in casing/naming, but Prisma uses the identical schema
      if (serverHabits?.length > 0) {
        const habitsToSave = serverHabits.map((h: any) => ({
          ...h,
          type: h.type.toLowerCase(),
          frequency_type: h.frequency_type.toLowerCase()
        }));
        await db.habits.bulkPut(habitsToSave);
      }

      if (serverEntries?.length > 0) {
        await db.entries.bulkPut(serverEntries);
      }
    }

    return 'success';
  } catch (err) {
    console.error('Sync failed:', err);
    return 'error';
  }
}

export async function fetchAnalytics(habitId: string) {
  try {
    const res = await authenticatedFetch(`/analytics/${habitId}`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return await res.json();
  } catch (err) {
    console.error('Analytics fetch failed:', err);
    return null;
  }
}

export async function fetchSummary() {
  try {
    const res = await authenticatedFetch('/analytics/summary');
    if (!res.ok) throw new Error('Failed to fetch summary');
    return await res.json();
  } catch (err) {
    console.error('Summary fetch failed:', err);
    return null;
  }
}
