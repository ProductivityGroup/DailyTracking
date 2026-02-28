# Deployment Guide: DailyTracking (Full Vercel Stack)

This guide provides the **exact, step-by-step instructions** to deploy DailyTracking entirely on Vercel, using Supabase for the database and authentication.

---

## Step 1: Set Up Database and Authentication (Supabase)
Supabase gives us a free Postgres database and a complete Auth system natively tied to it.

1. Go to [Supabase.com](https://supabase.com/) and create an account.
2. Click **New Project** and name it `DailyTracking`. Save the database password securely.
3. Wait a few minutes for the project to provision.
4. Go to **Project Settings > API**. Copy two values:
   - **Project URL** (`https://...supabase.co`)
   - **anon / public Key** (`eyJ...`)
5. Go to **Project Settings > Database**. Copy your **Connection details (URI)** (this is your Postgres `DATABASE_URL`).
   - *Make sure to replace `[YOUR-PASSWORD]` in the string with the password you created in Step 2!*
6. Go to **Authentication > Providers** and ensure "Email" is enabled.

---

## Step 2: Configure Environment Variables
You need precisely these environment variables to connect your app to Supabase.

**Frontend Requirements (Vercel Build)**:
- `VITE_SUPABASE_URL` = (Your Project URL from Step 1)
- `VITE_SUPABASE_ANON_KEY` = (Your anon Key from Step 1)

**Backend Requirements (Vercel Serverless Functions)**:
- `DATABASE_URL` = (Your Postgres Connection URI from Step 1)
- `SUPABASE_JWT_SECRET` = (Find this in Supabase Settings > API > JWT Secret)
- `CRON_SECRET` = (Make up a random 32-character password. This keeps your automated email reminders secure!)

---

## Step 3: Pushing the Database Schema
Before launching, we must build the database tables inside Supabase.

1. Open a terminal on your computer inside the `/server` folder.
2. Open `/server/.env` and paste your `DATABASE_URL` from Supabase.
3. Run `npx prisma db push`.
   - *This command securely connects to Supabase and structures all your custom Tables (`User`, `Habit`, `HabitEntry`).*

---

## Step 4: Deploy Everything to Vercel
Thanks to the custom `vercel.json` config, Vercel will act as a Monorepo, building both the React frontend and exposing the Express backend instantly.

1. Make sure all your recent code is pushed to your GitHub `main` branch.
2. Go to [Vercel.com](https://vercel.com/) and log in with GitHub.
3. Click **Add New > Project** and import the `DailyTracking` repository.
4. Leave the **Root Directory** as `./`.
5. Open the **Environment Variables** section and meticulously add **all FIVE** keys from Step 2.
6. Click **Deploy**.

Vercel will quickly build your frontend, wrap your Express API into Serverless Functions, and hand you a beautiful, live `.vercel.app` URL. Visit it, create an account, and start tracking habits securely!
