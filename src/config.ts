// This config file ensures the app works seamlessly both:
// 1. Offline / Local Testing (localhost)
// 2. Online / Production (deployed to Vercel/Netlify)

const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

// If running locally, hit the local backend.
// If deployed online, use the environment variable URL (or a hardcoded production URL if forgotten)
export const API_BASE = isLocalhost
  ? 'http://localhost:3001/api'
  : (import.meta.env.VITE_API_URL || 'https://dailytracking-api.onrender.com/api');
