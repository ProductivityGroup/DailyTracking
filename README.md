# DailyTracking - Premium Habit Dashboard

A comprehensive, beautifully designed daily habit tracking application that helps you build consistency through advanced analytics, configurable reminders, and flexible habit types.

![Analytics Dashboard](./assets/dashboard_preview.png) *(Note: add screenshot here)*

## 🌟 Key Features

*   **Four Habit Types**: Track simple tick-box completions, numeric values (e.g., 8 glasses of water), duration-based activities (e.g., 30 mins reading).
*   **Premium Analytics**:
    *   Unified Master Timeline graph comparing all habits simultaneously
    *   30-day consistency and check-in trends
    *   Weekly and Monthly completion rate aggregations
    *   Highest/Current Streak calculations per habit
*   **Smart Reminders**:
    *   Daily morning digest pushing all active habits to your device
    *   Afternoon/Evening check-ins that intelligently suppress habits you've already completed
    *   Weekly automatic Sunday digest with statistics and your best/worst performing habits
    *   Powered by `ntfy.sh` for instant, free push notifications to your phone
*   **Data Export**: 1-click export of all habit and entry data to CSV.
*   **Offline-First Architecture**: Uses IndexedDB (Dexie) on the frontend with background synchronization to a PostgreSQL database on the backend.

## 💻 Tech Stack

**Frontend:**
*   React 18 + TypeScript + Vite
*   `recharts` for advanced data visualization
*   `lucide-react` for iconography
*   `dexie` & `dexie-react-hooks` for local IndexedDB caching

**Backend:**
*   Node.js + Express + TypeScript
*   Prisma ORM connected to PostgreSQL
*   `node-cron` for scheduled reminder digests
*   `ntfy.sh` HTTP integration for mobile push notifications

## 🚀 Local Development Setup

### Prerequisites
*   Node.js (v18+ recommended)
*   PostgreSQL running locally or via Docker

### 1. Database & Backend Setup

Navigate to the `server/` directory:
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory and configure your Postgres connection:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dailytracking?schema=public"
PORT=3001
```

Run database migrations and seed realistic test data:
```bash
npx prisma db push
npx ts-node prisma/seed.ts
```

Start the backend server (runs on `localhost:3001`):
```bash
npm run dev
```

### 2. Frontend Setup

In a new terminal window, navigate to the root directory:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The application will now be running on `http://localhost:5173`.

## 📱 Setting up Mobile Push Notifications
DailyTracking uses `ntfy.sh` for push notifications, keeping things completely free without SMS limits.

1. Download the **ntfy** app on iOS or Android.
2. In the app, subscribe to a new topic (e.g., `my-secret-dailytracker-123`).
3. Open DailyTracking locally, click **Remind Me** in the top right.
4. Toggle SMS/Push Notifications on, and enter your exact topic name (`my-secret-dailytracker-123`).
5. Set your preferred morning and afternoon check-in times.
6. Click **Save**, then click the **Test** button to verify the connection!

## 🤝 Contributing
Open to pull requests and issues for any bugs or enhancements. If adding a new chart type to the Analytics Dashboard, please follow the unified dataset pattern in `AnalyticsDashboard.tsx`.
