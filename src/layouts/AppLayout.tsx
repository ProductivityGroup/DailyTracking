import { Outlet, NavLink } from 'react-router-dom';
import { Home, ListTodo, BarChart3, Bell, Cloud, CloudOff, RefreshCw, CheckCircle } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useSync } from '../hooks/useSync';
import './AppLayout.css';

export default function AppLayout() {
  const { testNotification } = useNotifications();
  const { syncStatus, triggerSync } = useSync();

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing': return <RefreshCw size={16} className="spin" />;
      case 'success': return <CheckCircle size={16} style={{ color: '#34a853' }} />;
      case 'error': return <CloudOff size={16} style={{ color: 'var(--md-sys-color-error)' }} />;
      case 'offline': return <CloudOff size={16} style={{ color: 'var(--md-sys-color-outline)' }} />;
      default: return <Cloud size={16} />;
    }
  };

  return (
    <div className="layout-container">
      <header className="app-top-header">
        <button onClick={triggerSync} className="header-btn" title={`Sync: ${syncStatus}`}>
          {getSyncIcon()}
        </button>
        <button onClick={testNotification} className="header-btn" title="Test Notification">
          <Bell size={16} />
        </button>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Home size={24} />
          <span>Today</span>
        </NavLink>
        <NavLink
          to="/analytics"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <BarChart3 size={24} />
          <span>Analytics</span>
        </NavLink>
        <NavLink
          to="/manage"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <ListTodo size={24} />
          <span>Manage</span>
        </NavLink>
      </nav>
    </div>
  );
}
