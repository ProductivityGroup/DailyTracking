import { useState, useEffect, useCallback } from 'react';
import { syncToServer, SyncStatus } from '../services/syncService';

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>('idle');

  const sync = useCallback(async () => {
    setStatus('syncing');
    const result = await syncToServer();
    setStatus(result);
    // Reset to idle after 3 seconds
    setTimeout(() => setStatus('idle'), 3000);
  }, []);

  // Sync when user comes back online
  useEffect(() => {
    const handleOnline = () => sync();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [sync]);

  // Auto-sync every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.onLine) sync();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [sync]);

  return { syncStatus: status, triggerSync: sync };
}
