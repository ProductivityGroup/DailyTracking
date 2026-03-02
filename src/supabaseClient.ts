import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Mock client for local development
const isMock = isLocalhost || !supabaseUrl || !supabaseKey;

if (isMock) {
  console.warn('⚠️ Running in LOCAL MOCK mode. Supabase interactions are bypassed.');
}

export const supabase = isMock
  ? {
      auth: {
        getSession: async () => ({
          data: {
            session: {
              user: { id: 'local-dev-user', email: 'dev@local.host' },
              access_token: 'mock-token'
            }
          },
          error: null
        }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } }
        }),
        signOut: async () => {},
        signUp: async () => ({ error: null }),
        signInWithPassword: async () => ({ error: null })
      }
    } as any // Cast to any to bypass strict type checking for the mock
  : createClient(supabaseUrl, supabaseKey);
