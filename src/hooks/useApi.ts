import { supabase } from '../supabaseClient';
import { API_BASE } from '../config';

/**
 * A custom hook that returns an authenticated `fetch` function.
 * It automatically injects the Supabase JWT Bearer token into every request.
 */
export function useApi() {
  const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
    // If running completely locally, we don't even need to hit the backend because
    // we use an offline-first Dexie local database. This avoids needing Supabase Postgres locally!
    if (API_BASE.includes('localhost')) {
      console.log(`[Local Mock] Bypassing fetch to ${endpoint}`);
      return new Response(JSON.stringify({ mock: true, status: 'ok' }), { status: 200 });
    }

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
  };

  return { apiFetch: authenticatedFetch };
}
