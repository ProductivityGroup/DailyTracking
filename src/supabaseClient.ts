import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock client for local development without environment variables
const isMock = !supabaseUrl || !supabaseKey;

if (isMock) {
  console.warn('⚠️ Supabase environment variables missing. Running in LOCAL MOCK mode.');
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
