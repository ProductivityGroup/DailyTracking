import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare, ChevronUp, ChevronDown, Bell } from 'lucide-react';
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
  const [localTime, setLocalTime] = useState('20:00');
  const { apiFetch } = useApi();

  // Custom time picker logic
  const [hours24Str, minutesStr] = localTime.split(':');
  const hours24 = parseInt(hours24Str, 10) || 0;
  const minutes = parseInt(minutesStr, 10) || 0;
  const isPM = hours24 >= 12;
  const displayHours = hours24 % 12 || 12;

  const handleTimeChange = (newH24: number, newMin: number) => {
    const h = Math.max(0, Math.min(23, newH24));
    const m = Math.max(0, Math.min(59, newMin));
    setLocalTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  const incrementHour = () => handleTimeChange((hours24 + 1) % 24, minutes);
  const decrementHour = () => handleTimeChange((hours24 + 23) % 24, minutes);
  const incrementMinute = () => handleTimeChange(hours24, (minutes + 5) % 60);
  const decrementMinute = () => handleTimeChange(hours24, (minutes + 55) % 60);

  const toggleAMPM = (wantPM: boolean) => {
    if (wantPM && !isPM) handleTimeChange((hours24 + 12) % 24, minutes);
    if (!wantPM && isPM) handleTimeChange((hours24 + 12) % 24, minutes);
  };

    useEffect(() => {
    const savedLocalTime = localStorage.getItem('localReminderTime');
    if (savedLocalTime) setLocalTime(savedLocalTime);

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
    localStorage.setItem('localReminderTime', localTime);

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

          <div className="section-label">Browser Notifications</div>
          <div className="time-card">
            <div className="time-card-label">
              <div className={`time-icon ${isPM ? 'icon-afternoon' : 'icon-morning'}`}>
                <Bell size={18} />
              </div>
              <div>
                <h3 className="time-card-title">Daily Reminder Time</h3>
                <p className="time-card-sub">When should your localized browser prompt you?</p>
              </div>
            </div>

            <div className="time-picker-row">
              <div className="time-segment">
                <button type="button" className="time-stepper" onClick={incrementHour}><ChevronUp size={16} /></button>
                <div className="time-display">{String(displayHours).padStart(2, '0')}</div>
                <button type="button" className="time-stepper" onClick={decrementHour}><ChevronDown size={16} /></button>
              </div>
              <div className="time-colon">:</div>
              <div className="time-segment">
                <button type="button" className="time-stepper" onClick={incrementMinute}><ChevronUp size={16} /></button>
                <div className="time-display">{String(minutes).padStart(2, '0')}</div>
                <button type="button" className="time-stepper" onClick={decrementMinute}><ChevronDown size={16} /></button>
              </div>
              <div className="ampm-toggle">
                <button type="button" className={`ampm-btn ${!isPM ? 'active' : ''}`} onClick={() => toggleAMPM(false)}>AM</button>
                <button type="button" className={`ampm-btn ${isPM ? 'active' : ''}`} onClick={() => toggleAMPM(true)}>PM</button>
              </div>
            </div>
          </div>

          <div className="section-label" style={{ marginTop: '24px' }}>External Push Notifications</div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
            A backup digest is sent every evening (20:00 UTC) containing a list of your uncompleted habits.
          </p>

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
