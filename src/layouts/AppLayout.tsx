import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, ListTodo, BarChart3, Bell } from 'lucide-react';
import ReminderSettings from '../components/ReminderSettings';
import { syncToServer } from '../services/syncService';
import './AppLayout.css';

export default function AppLayout() {
  const [showSettings, setShowSettings] = useState(false);

  // Silently sync local IndexedDB → PostgreSQL on load and when tab becomes visible
  // This keeps the backend up-to-date for notifications
  useEffect(() => {
    syncToServer();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') syncToServer();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <div className="layout-container">
      <header className="app-top-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
        <div className="header-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => setShowSettings(true)} className="header-action-btn" title="Configure Reminders">
            <Bell size={14} />
            <span style={{ marginLeft: '4px' }}>Remind me</span>
          </button>
        </div>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {/* ... NavLinks ... */}
        <NavLink
          to="/"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Home size={22} />
          <span>Today</span>
        </NavLink>
        <NavLink
          to="/analytics"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <BarChart3 size={22} />
          <span>Analytics</span>
        </NavLink>
        <NavLink
          to="/manage"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <ListTodo size={22} />
          <span>Manage</span>
        </NavLink>
      </nav>

      {showSettings && <ReminderSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
