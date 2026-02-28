import { useAuth } from '@clerk/clerk-react';
import { API_BASE } from '../config';

/**
 * A custom hook that returns an authenticated `fetch` function.
 * It automatically injects the Clerk JWT Bearer token into every request.
 */
export function useApi() {
  const { getToken } = useAuth();

  const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getToken();

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
