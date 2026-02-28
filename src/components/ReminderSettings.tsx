import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare, Sun, Sunset } from 'lucide-react';
import { API_BASE } from '../config';
import './ReminderSettings.css';

interface ReminderSettingsType {
  sms_enabled: boolean;
  phone: string;
  morning_time: string;
  afternoon_time: string;
}

interface Props {
  onClose: () => void;
}

// Convert HH:MM (24h) to { hour12, minute, ampm }
function parseTime(timeStr: string) {
  const [hh, mm] = timeStr.split(':').map(Number);
  const ampm = hh < 12 ? 'AM' : 'PM';
  const hour12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  return { hour12, minute: mm, ampm };
}

// Convert { hour12, minute, ampm } back to HH:MM 24h
function formatTime(hour12: number, minute: number, ampm: string): string {
  let hh = hour12 % 12;
  if (ampm === 'PM') hh += 12;
  return `${String(hh).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

interface TimePickerProps {
  value: string;  // HH:MM 24h
  onChange: (val: string) => void;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  iconClass: string;
}

function TimePicker({ value, onChange, label, sublabel, icon, iconClass }: TimePickerProps) {
  const parsed = parseTime(value);
  const [hour, setHour] = useState(parsed.hour12);
  const [minute, setMinute] = useState(parsed.minute);
  const [ampm, setAmpm] = useState(parsed.ampm);

  // Sync when outer value changes
  useEffect(() => {
    const p = parseTime(value);
    setHour(p.hour12);
    setMinute(p.minute);
    setAmpm(p.ampm);
  }, [value]);

  const update = (h: number, m: number, ap: string) => {
    onChange(formatTime(h, m, ap));
  };

  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div className="time-card">
      <div className="time-card-label">
        <span className={`time-icon ${iconClass}`}>{icon}</span>
        <div>
          <p className="time-card-title">{label}</p>
          <p className="time-card-sub">{sublabel}</p>
        </div>
      </div>
      <div className="time-picker-row">
        {/* Hour */}
        <div className="time-segment">
          <button
            type="button"
            className="time-stepper"
            onClick={() => {
              const next = hour === 1 ? 12 : hour - 1;
              setHour(next);
              update(next, minute, ampm);
            }}
          >▲</button>
          <span className="time-display">{String(hour).padStart(2, '0')}</span>
          <button
            type="button"
            className="time-stepper"
            onClick={() => {
              const next = hour === 12 ? 1 : hour + 1;
              setHour(next);
              update(next, minute, ampm);
            }}
          >▼</button>
        </div>

        <span className="time-colon">:</span>

        {/* Minute */}
        <div className="time-segment">
          <button
            type="button"
            className="time-stepper"
            onClick={() => {
              const idx = minutes.indexOf(minute);
              const next = minutes[(idx - 1 + minutes.length) % minutes.length];
              setMinute(next);
              update(hour, next, ampm);
            }}
          >▲</button>
          <span className="time-display">{String(minute).padStart(2, '0')}</span>
          <button
            type="button"
            className="time-stepper"
            onClick={() => {
              const idx = minutes.indexOf(minute);
              const next = minutes[(idx + 1) % minutes.length];
              setMinute(next);
              update(hour, next, ampm);
            }}
          >▼</button>
        </div>

        {/* AM / PM */}
        <div className="ampm-toggle">
          <button
            type="button"
            className={`ampm-btn ${ampm === 'AM' ? 'active' : ''}`}
            onClick={() => { setAmpm('AM'); update(hour, minute, 'AM'); }}
          >AM</button>
          <button
            type="button"
            className={`ampm-btn ${ampm === 'PM' ? 'active' : ''}`}
            onClick={() => { setAmpm('PM'); update(hour, minute, 'PM'); }}
          >PM</button>
        </div>
      </div>
    </div>
  );
}

export default function ReminderSettings({ onClose }: Props) {
  const [settings, setSettings] = useState<ReminderSettingsType>({
    sms_enabled: false,
    phone: '',
    morning_time: '08:00',
    afternoon_time: '17:00'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/settings/reminders`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSettings({
            sms_enabled: data.sms_enabled || false,
            phone: data.phone || '',
            morning_time: data.morning_time || '08:00',
            afternoon_time: data.afternoon_time || '17:00'
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
      const res = await fetch(`${API_BASE}/settings/reminders`, {
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
      const res = await fetch(`${API_BASE}/settings/reminders/test`, { method: 'POST' });
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

          <div className="section-label">Schedule</div>

          <TimePicker
            value={settings.morning_time}
            onChange={val => setSettings({ ...settings, morning_time: val })}
            label="Morning"
            sublabel="All habits for the day"
            icon={<Sun size={16} />}
            iconClass="icon-morning"
          />

          <TimePicker
            value={settings.afternoon_time}
            onChange={val => setSettings({ ...settings, afternoon_time: val })}
            label="Evening Check-in"
            sublabel="Only uncompleted habits"
            icon={<Sunset size={16} />}
            iconClass="icon-afternoon"
          />

          <div className="section-label">Delivery</div>

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
