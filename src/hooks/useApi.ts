import { supabase } from '../supabaseClient';
import { API_BASE } from '../config';

/**
 * A custom hook that returns an authenticated `fetch` function.
 * It automatically injects the Supabase JWT Bearer token into every request.
 */
export function useApi() {
  const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {

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
