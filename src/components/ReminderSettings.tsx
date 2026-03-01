import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import './ReminderSettings.css';

interface ReminderSettingsType {
  sms_enabled: boolean;
  phone: string;
}

interface Props {
  onClose: () => void;
}

export default function ReminderSettings({ onClose }: Props) {
  const [settings, setSettings] = useState<ReminderSettingsType>({
    sms_enabled: false,
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const { apiFetch } = useApi();

  useEffect(() => {
    apiFetch('/settings/reminders')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSettings({
            sms_enabled: data.sms_enabled || false,
            phone: data.phone || '',
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');
    try {
      const res = await apiFetch('/settings/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSaveMessage('Settings saved!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Error saving settings.');
      }
    } catch {
      setSaveMessage('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestMessage('');
    try {
      const res = await apiFetch('/settings/reminders/test', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setTestMessage('✅ Test sent! Check your ntfy app.');
      } else {
        setTestMessage(`❌ ${data.error}`);
      }
    } catch {
      setTestMessage('❌ Network error.');
    } finally {
      setTesting(false);
      setTimeout(() => setTestMessage(''), 4000);
    }
  };

  if (loading) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content reminder-modal" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <div className="modal-title-group">
            <h2>Reminder Settings</h2>
            <p className="modal-subtitle">Get notified about your habits</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </header>

        <form onSubmit={handleSave} className="reminder-form">

          <div className="section-label">Delivery Schedule</div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
            Daily check-ins are sent every evening (20:00 UTC) containing a list of your uncompleted habits for the day.
          </p>

          <div className="section-label">Push Notifications</div>

          {/* ntfy Push */}
          <div className={`setting-card ${settings.sms_enabled ? 'active' : ''}`}>
            <div className="setting-header">
              <div className="setting-title-icon">
                <MessageSquare size={17} className="icon-sms" />
                <div>
                  <h3>Push Notifications</h3>
                  <p className="setting-sub">via ntfy.sh — free, no account</p>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.sms_enabled}
                  onChange={e => setSettings({ ...settings, sms_enabled: e.target.checked })}
                />
                <span className="slider round"></span>
              </label>
            </div>
            {settings.sms_enabled && (
              <div className="setting-body">
                <input
                  type="text"
                  placeholder="my-habits-topic-abc123"
                  value={settings.phone}
                  onChange={e => setSettings({ ...settings, phone: e.target.value || '' })}
                  required={settings.sms_enabled}
                  className="full-width-input"
                />
                <p className="setting-hint">
                  Install <strong>ntfy</strong> on your phone → subscribe to this topic name. <a href="https://ntfy.sh" target="_blank" rel="noreferrer">ntfy.sh</a>
                </p>
              </div>
            )}
          </div>


          <div className="modal-footer">
            <div className="footer-left">
              {testMessage && <span className={`save-msg ${testMessage.startsWith('❌') ? 'error' : 'success'}`}>{testMessage}</span>}
              {saveMessage && <span className={`save-msg ${saveMessage.includes('Error') ? 'error' : 'success'}`}>{saveMessage}</span>}
            </div>
            <div className="footer-right">
              <button type="button" className="test-btn" onClick={handleTest} disabled={testing}>
                {testing ? 'Sending...' : '🔔 Test'}
              </button>
              <button type="submit" className="save-btn" disabled={saving}>
                <Save size={16} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
