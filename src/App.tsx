import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import HomeDashboard from './pages/HomeDashboard';
import ManageHabits from './pages/ManageHabits';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomeDashboard />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="manage" element={<ManageHabits />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

