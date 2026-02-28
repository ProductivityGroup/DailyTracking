import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import AppLayout from './layouts/AppLayout';
import HomeDashboard from './pages/HomeDashboard';
import ManageHabits from './pages/ManageHabits';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <>
            <SignedIn>
              <AppLayout />
            </SignedIn>
            <SignedOut>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>DailyTracking</h1>
                <p style={{ color: 'var(--color-text-tertiary)', marginBottom: '30px' }}>Sign in to start tracking your habits.</p>
                <SignInButton mode="modal">
                  <button style={{ padding: '12px 24px', fontSize: '1rem', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    Sign In to Continue
                  </button>
                </SignInButton>
              </div>
            </SignedOut>
          </>
        }>
          <Route index element={<HomeDashboard />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="manage" element={<ManageHabits />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

