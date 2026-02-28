# Deployment Guide: DailyTracking (Multi-User Edition)

This guide provides the **exact, step-by-step instructions** to deploy the multi-user version of DailyTracking. By following these steps, your app will have secure user authentication, a live cloud database, a 24/7 backend API, and a globally hosted frontend.

---

## Step 1: Set Up Authentication (Clerk)
We use Clerk to handle secure sign-ins and protect user data.

1. Go to [Clerk.com](https://clerk.com/) and create an account.
2. Click **Add Application** and name it `DailyTracking`.
3. Select the login methods you want (e.g., Email, Google).
4. **Important:** On the Clerk Dashboard, navigate to **Webhooks** (under the "Configure" menu).
   - Click **Add Endpoint**.
   - Set the Endpoint URL to your future backend URL: `https://YOUR_RENDER_URL.onrender.com/api/webhooks/clerk` *(You will update this URL later in Step 3)*.
   - Subscribe to the `user.created` event.
   - Click **Create**. Clerk will generate a **Signing Secret** (an `whsec_...` key). Save this!
5. From the Clerk Dashboard's "API Keys" page, copy two values:
   - **Publishable Key** (`pk_...`)
   - **Secret Key** (`sk_...`)

---

## Step 2: Host the Database (Neon)
We use Neon for a free, serverless Postgres database.

1. Go to [Neon.tech](https://neon.tech/) and create an account.
2. Create a new project named `DailyTracking`.
3. You will immediately be shown a **Connection String** representing your database (e.g., `postgresql://...`).
4. **Copy this Connection String**.

---

## Step 3: Deploy the Backend API (Render)
We use Render to run our Node.js server 24/7.

1. Make sure all your recent code is pushed to your GitHub `main` branch.
2. Go to [Render.com](https://render.com/) and create a free account.
3. Click **New > Web Service**.
4. Connect to your GitHub repository and select `DailyTracking`.
5. Configure the Web Service:
   - **Name**: `dailytracking-api`
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate && npx tsc`
   - **Start Command**: `node dist/index.js`
6. Open the **Environment Variables** section and meticulously add these 5 keys:
   - `DATABASE_URL` = (Your Neon Connection String from Step 2)
   - `PORT` = `3001`
   - `CLERK_PUBLISHABLE_KEY` = (Your Clerk `pk_...` from Step 1)
   - `CLERK_SECRET_KEY` = (Your Clerk `sk_...` from Step 1)
   - `CLERK_WEBHOOK_SECRET` = (Your Clerk Webhook `whsec_...` from Step 1)
7. Click **Create Web Service**.
8. Render will deploy your API and give you a URL (e.g., `https://dailytracking-api.onrender.com`).
   - *Self-Correction: Go back to Clerk (Step 1) and update your Webhook Endpoint URL with this newly generated Render URL!*

---

## Step 4: Initialize the Database Schema
Right now, your Neon database is completely blank. We must push the Prisma schema to it.

1. Open a terminal on your *local computer* inside the `/server` folder.
2. Temporarily set your local `.env` file's `DATABASE_URL` to match your Neon Connection String.
3. Run `npx prisma db push`.
   - *This command securely connects to Neon and builds all the Tables (`User`, `Habit`, `HabitEntry`, etc.)*
4. Run `npx ts-node prisma/seed.ts` if you want to initialize some pre-made habits.

---

## Step 5: Deploy the Frontend App (Vercel)
We use Vercel to host the React application visually.

1. Go to [Vercel.com](https://vercel.com/) and log in with GitHub.
2. Click **Add New > Project** and import the `DailyTracking` repository.
3. Leave the **Root Directory** as `./` (do not select `server`).
4. Framework Preset will automatically detect "Vite".
5. Open the **Environment Variables** section and add these 2 keys:
   - `VITE_API_URL` = `https://dailytracking-api.onrender.com/api` *(Your Render URL from Step 3... MAKE SURE YOU ADD `/api` to the end!)*
   - `VITE_CLERK_PUBLISHABLE_KEY` = (Your Clerk `pk_...` from Step 1)
6. Click **Deploy**.

Vercel will quickly build your frontend and hand you a beautiful, live `.vercel.app` URL. Visit it, sign up with Clerk, and start tracking habits on the internet!
