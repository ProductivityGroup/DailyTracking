import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// Conditionally initialize supabase so it does not crash when starting locally without env vars
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  // Local Development Bypass
  const isLocalMock = (!supabaseUrl || !supabaseKey) && token === 'mock-token';

  try {
    let validUserId: string;
    let userEmail: string = '';
    let userDisplayName: string = 'User';

    if (isLocalMock) {
      // Bypass Supabase network call for local development
      validUserId = 'local-dev-user';
      userEmail = 'dev@local.host';
      userDisplayName = 'Local Developer';
    } else {
      // Production Supabase verification
      if (!supabase) {
        return res.status(500).json({ error: 'Supabase client is not configured on the server. Cannot verify token.' });
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      validUserId = user.id;
      userEmail = user.email || '';
      userDisplayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
    }

    // Inject the validated user ID into the Express request object
    (req as any).auth = { userId: validUserId };

    // Auto-create user in our DB if they don't exist yet (simulating what the webhook did)
    // In a pure Supabase setup, we might use a Postgres Trigger, but doing it here guarantees
    // the backend Prisma queries never fail on missing user relations.
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.user.upsert({
        where: { id: validUserId },
        update: {},
        create: {
          id: validUserId,
          email: userEmail,
          display_name: userDisplayName,
        }
      });
    } catch (dbErr) {
      console.error('Error auto-creating user in DB:', dbErr);
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
