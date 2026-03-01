# Deployment Guide: DailyTracking (Full Vercel Stack)

This guide provides the **exact, step-by-step instructions** to deploy DailyTracking entirely on Vercel, using Supabase for the database and authentication.

---

## Step 1: Set Up Database and Authentication (Supabase)
Supabase gives us a free Postgres database and a complete Auth system natively tied to it.

1. Go to [Supabase.com](https://supabase.com/) and create an account.
2. Click **New Project** and name it `DailyTracking`. Save the database password securely.
3. Wait a few minutes for the project to provision.
4. Go to **Authentication > Add User**.
   - Create a strictly manual user with the exact email: `shared@dailytracking.app`
   - Set the password to whatever simple "Group Password" you want to share with everyone.
   - **Important**: Choose *Auto Confirm User* so you don't have to deal with email verification.
5. Go to **Project Settings** (the gear icon on the very bottom left) **> API**. Copy two values:
   - **Project URL**: Found at the top of the page under the "Project URL" section (`https://....supabase.co`)
   - **Publishable API key**: Found under the "Project API keys" section (`eyJ...`)
6. Click the **Connect** button at the very top center of the dashboard and select the **ORMs / Prisma** tab.
   - **`DATABASE_URL`**: Copy the connection string. By default, "Use connection pooling" is enabled. It uses port `6543` and ends with `?pgbouncer=true...`.
   - **`DIRECT_URL`**: Uncheck the "Use connection pooling" toggle. The port will change to `5432`. Copy this as your Direct URL.
   - *Make sure to replace `[YOUR-PASSWORD]` in both strings with your actual database password!*
7. Go to **Authentication > Providers** and ensure "Email" is enabled.

---

## Step 2: Configure Environment Variables
You need precisely these environment variables to connect your app to Supabase.

**Frontend Requirements (Vercel Build)**:
- `VITE_SUPABASE_URL` = (Your Project URL from Step 1)
- `VITE_SUPABASE_ANON_KEY` = (Your Publishable API key from Step 1)

**Backend Requirements (Vercel Serverless Functions)**:
- `DATABASE_URL` = (Your Pooled URI, e.g., `postgresql://...:6543/postgres?pgbouncer=true&connection_limit=1`)
- `DIRECT_URL` = (Your Direct URI, e.g., `postgresql://...:5432/postgres`)
- `CRON_SECRET` = (Make up a random 32-character password. This keeps your automated email reminders secure!)

---

## Step 3: Pushing the Database Schema
Before launching, we must build the database tables inside Supabase.

1. Open a terminal on your computer inside the `/server` folder.
2. Open `/server/.env` and paste your `DATABASE_URL` AND your `DIRECT_URL` from Supabase.
3. Run `npx prisma db push`.
   - *This command securely connects to Supabase and structures all your custom Tables (`User`, `Habit`, `HabitEntry`).*

---

## Step 4: Deploy Everything to Vercel
Thanks to the custom `vercel.json` config, Vercel will act as a Monorepo, building both the React frontend and exposing the Express backend instantly.

1. Make sure all your recent code is pushed to your GitHub `main` branch.
2. Go to [Vercel.com](https://vercel.com/) and log in with GitHub.
3. Click **Add New > Project** and import the `DailyTracking` repository.
4. Vercel will ask you to configure the project. **Leave the Root Directory as `./`**.
   *Note: Vercel might show a message saying "For monorepos, create a separate project for each directory." **Ignore this.** Our custom `vercel.json` file is specifically designed to bypass this limitation and host both the frontend and backend in one single project.*
5. Expand the **Build and Output Settings** section. Change the **Framework Preset** from `Other` to **`Vite`** (the Build Command will automatically set to `npm run build`).
6. Open the **Environment Variables** section and meticulously add **all FIVE** keys from Step 2.
7. Click **Deploy**.

Vercel will quickly build your frontend, wrap your Express API into Serverless Functions, and hand you a beautiful, live `.vercel.app` URL. Visit it, create an account, and start tracking habits securely!
