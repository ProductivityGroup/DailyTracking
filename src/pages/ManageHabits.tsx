import React, { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import './ManageHabits.css';
import { Trash2 } from 'lucide-react';

export default function ManageHabits() {
  const { habits, addHabit, deleteHabit } = useHabits();
  const [showAddForm, setShowAddForm] = useState(false);

  // Basic form state
  const [name, setName] = useState('');
  const [type, setType] = useState<import('../types').HabitType>('boolean');
  const [targetValue, setTargetValue] = useState<number | ''>('');
  const [unit, setUnit] = useState('');
  const [color, setColor] = useState('#006493');
  const [icon, setIcon] = useState('🏃');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addHabit({
      name,
      type,
      target_value: targetValue === '' ? undefined : Number(targetValue),
      unit: unit.trim() || undefined,
      color,
      icon,
      frequency_type: 'daily'
    });

    setName('');
    setType('boolean');
    setTargetValue('');
    setUnit('');
    setShowAddForm(false);
  };

  return (
    <div className="manage-habits">
      <header className="manage-header">
        <h1>Manage Habits</h1>
        <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ New Habit'}
        </button>
      </header>

      {showAddForm && (
        <form className="add-habit-form" onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label>Habit Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Morning Jog"
              autoFocus
            />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>Habit Type</label>
              <select className="type-select" value={type} onChange={e => setType(e.target.value as any)}>
                <option value="boolean">Done / Not Done (Boolean)</option>
                <option value="numeric">Number (e.g. 8 glasses)</option>
                <option value="duration">Duration (e.g. 30 mins)</option>
                <option value="rating">Rating (1 to 5 Stars)</option>
              </select>
            </div>
          </div>

          {(type === 'numeric' || type === 'duration') && (
            <div className="form-group-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Target Value</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={targetValue}
                  onChange={e => setTargetValue(e.target.value ? Number(e.target.value) : '')}
                  placeholder={type === 'numeric' ? "e.g. 8" : "e.g. 30"}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Unit (Optional)</label>
                <input
                  type="text"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder={type === 'numeric' ? "cups, pages" : "mins"}
                />
              </div>
            </div>
          )}

          <div className="form-group-row">
            <div className="form-group">
              <label>Icon</label>
              <input
                type="text"
                value={icon}
                onChange={e => setIcon(e.target.value)}
                maxLength={2}
                className="icon-input"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Color</label>
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="color-input"
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={!name.trim()}>
            Save Habit
          </button>
        </form>
      )}

      <section className="habits-list manage-list">
        {habits?.map(habit => (
          <div key={habit.id} className="manage-habit-card">
            <div className="habit-icon" style={{ backgroundColor: habit.color + '20', color: habit.color }}>
              {habit.icon}
            </div>
            <div className="manage-habit-info">
              <h3>{habit.name}</h3>
              <span className="habit-type">
                Daily • {habit.type.charAt(0).toUpperCase() + habit.type.slice(1)}
                {habit.target_value && ` (${habit.target_value} ${habit.unit || ''})`}
              </span>
            </div>
            <button
              className="delete-btn"
              onClick={() => deleteHabit(habit.id as string)}
              title="Delete Habit"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        {habits?.length === 0 && !showAddForm && (
          <div className="empty-state">No habits created yet.</div>
        )}
      </section>
    </div>
  );
}
