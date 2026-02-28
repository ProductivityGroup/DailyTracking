import { Router, Request, Response } from 'express';
import { Webhook } from 'svix';
import prisma from '../db';
import dotenv from 'dotenv';

dotenv.config();

export const webhookRoutes = Router();

webhookRoutes.post('/clerk', async (req: Request, res: Response) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET - cannot verify webhooks.');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  // To verify webhooks in Express, we must use the raw string body.
  // Because app.use(express.json()) is parsed before this route, we recreate stringified payload.
  const payloadString = JSON.stringify(req.body);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(payloadString, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err: any) {
    console.log('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Verification failed' });
  }

  const eventType = evt.type;

  // Handle User Creation
  if (eventType === 'user.created') {
    const { id, email_addresses } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address || `no-email-${id}@example.com`;

    try {
      await prisma.user.create({
        data: {
          id: id,
          email: primaryEmail,
          display_name: primaryEmail.split('@')[0] || 'New User'
        }
      });
      console.log(`Successfully synced new Clerk user: ${id}`);
    } catch (e) {
      console.error(`Failed to sync Clerk user ${id} into database:`, e);
      return res.status(500).json({ error: 'Database sync failure' });
    }
  }

  return res.status(200).json({ success: true });
});
