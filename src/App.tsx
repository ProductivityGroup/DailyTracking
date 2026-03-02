import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import HomeDashboard from './pages/HomeDashboard';
import ManageHabits from './pages/ManageHabits';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Auth from './components/Auth';
import { AuthProvider, useAuth } from './AuthContext';
import { ProfileProvider } from './ProfileContext';

function ProtectedRoutes() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--color-text-secondary)' }}>Loading...</div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomeDashboard />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="manage" element={<ManageHabits />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <BrowserRouter>
          <ProtectedRoutes />
        </BrowserRouter>
      </ProfileProvider>
    </AuthProvider>
  );
}

