import React, { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import CustomSelect from '../components/CustomSelect';
import './ManageHabits.css';
import { Trash2 } from 'lucide-react';

const PRESET_ICONS = ['🏃', '📚', '💧', '🧘', '🥦', '🏋️', '🍎', '🖊️', '🎸', '💻', '🚲', '💰', '🛌', '🧹'];
const PRESET_COLORS = [
  '#006493', // Primary Blue
  '#8F2668', // Deep Purple/Pink
  '#2E6C00', // Forest Green
  '#984061', // Rose
  '#006B58', // Teal
  '#A03E00', // Rust Orange
  '#5C53A7', // Indigo
];

export default function ManageHabits() {
  const { habits, addHabit, deleteHabit } = useHabits();
  const [showAddForm, setShowAddForm] = useState(false);

  // Basic form state
  const [name, setName] = useState('');
  const [type, setType] = useState<import('../types').HabitType>('boolean');
  const [targetValue, setTargetValue] = useState<number | ''>('');
  const [unit, setUnit] = useState('');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const randomIcon = PRESET_ICONS[Math.floor(Math.random() * PRESET_ICONS.length)];
    const randomColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];

    await addHabit({
      name,
      type,
      target_value: targetValue === '' ? undefined : Number(targetValue),
      unit: unit.trim() || undefined,
      color: randomColor,
      icon: randomIcon,
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
            <div className="form-group" style={{ flex: 1 }}>
              <CustomSelect
                label="Value Type"
                value={type}
                onChange={val => setType(val as any)}
                options={[
                  { value: 'boolean', label: 'Done / Not Done' },
                  { value: 'numeric', label: 'Number (e.g. 8 glasses)' },
                  { value: 'duration', label: 'Duration (e.g. 30 mins)' },
                ]}
              />
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
