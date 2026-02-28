# Deployment Plan: Taking DailyTracking Online

This guide explains exactly how to deploy the DailyTracking application so that multiple users can access it from anywhere on the internet.

## 1. Hosting the PostgreSQL Database
Since your app uses a database, you cannot rely on the local PostgreSQL installed on your Mac.

**Recommended Host**: [Neon.tech](https://neon.tech/) (Free & Serverless) or [Supabase](https://supabase.com/)
1. Create a free account on Neon.
2. Create a new Database project.
3. Once created, they will give you a **Connection String** that looks like `postgres://user:password@hostname...`
4. Copy this string.

## 2. Deploying the Backend (Node.js/Express)
Your backend server needs to run 24/7 in the cloud. We will use **Render**.

**Recommended Host**: [Render.com](https://render.com/) (Web Service)
1. Push your code to GitHub (which we already did!).
2. Create an account on Render and click **New > Web Service**.
3. Connect your GitHub account and select the `DailyTracking` repository.
4. Set the following configurations:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate && npx tsc`
   - **Start Command**: `node dist/index.js`
5. **Environment Variables**: Add your database connection string here!
   - `DATABASE_URL` = `[Paste the Neon/Supabase URL from Step 1]`
   - `PORT` = `3001`
6. Click **Deploy**. Render will give you a public URL (e.g., `https://dailytracking-api.onrender.com`). *Copy this URL.*

*(Note: Once deployed, you will need to run the database migration once via a manual script on Render or locally pointing to the cloud DB to create the tables `npx prisma db push`)*

## 3. Deploying the Frontend (React/Vite)
The frontend needs to be compiled into static HTML/JS files and served globally. We will use **Vercel**.

**Recommended Host**: [Vercel.com](https://vercel.com/)
1. Go to Vercel, click **Add New Project**, and import your `DailyTracking` repository from GitHub.
2. Set the **Root Directory** to `.` (the main repository folder, not the server folder).
3. The Build command is automatically detected (`npm run build`).
4. **Environment Variables**: Tell the frontend where the backend lives!
   - Add `VITE_API_URL` = `[Paste the Render URL from Step 2]` (e.g., `https://dailytracking-api.onrender.com/api`)
5. Click **Deploy**.

Vercel will build the frontend and give you a live webpage URL!

---

## What's Next for Multi-User Support?
Right now, the database does not have a "login" screen, so it just lumps everyone's habits together under a single default user ID.

To make it truly support multiple people safely:
1. We need to integrate **Clerk Authentication**.
2. We need to update the React frontend to show a sign-in wall.
3. We need to update the Backend API routes to read the individual user's secure token so it knows exactly *whose* habits to return.

*Check `implementation_plan.md` for the technical roadmap on adding Authentication.*
