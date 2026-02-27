import React, { useState } from 'react';
import { Habit, HabitEntry } from '../types';

interface HabitCardProps {
  habit: Habit;
  entry?: HabitEntry;
  onToggleBoolean: (id: string, currentlyCompleted: boolean) => void;
  onSetValue: (id: string, value: number, isCompleted: boolean) => void;
}

export default function HabitCard({ habit, entry, onToggleBoolean, onSetValue }: HabitCardProps) {
  const isCompleted = entry?.completed || false;
  const currentValue = entry?.value || '';

  const [inputValue, setInputValue] = useState<number | string>(currentValue);

  const handleBooleanClick = () => {
    if (habit.type === 'boolean') {
      onToggleBoolean(habit.id as string, isCompleted);
    }
  };

  const handleLogValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inputValue !== '') {
      const numValue = Number(inputValue);
      const isMet = habit.target_value ? numValue >= habit.target_value : true;
      onSetValue(habit.id as string, numValue, isMet);
    }
  };

  const renderInputArea = () => {
    if (habit.type === 'boolean') {
      return (
        <button className={`check-button ${isCompleted ? 'checked' : ''}`}>
          {isCompleted && <span className="checkmark">✓</span>}
        </button>
      );
    }

    if (habit.type === 'numeric' || habit.type === 'duration') {
      return (
        <div className="habit-input-container" onClick={e => e.stopPropagation()}>
          <input
            type="number"
            className="habit-inline-input"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={habit.target_value ? `${habit.target_value}` : '0'}
          />
          <span className="habit-unit">{habit.unit}</span>
          <button className="log-btn" onClick={handleLogValue}>Log</button>
        </div>
      );
    }

    if (habit.type === 'rating') {
      return (
        <div className="habit-rating-container" onClick={e => e.stopPropagation()}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              className={`star-btn ${Number(inputValue) >= star ? 'active' : ''}`}
              onClick={() => {
                setInputValue(star);
                onSetValue(habit.id as string, star, true);
              }}
            >
              ★
            </button>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={`habit-card ${isCompleted ? 'completed' : ''} ${habit.type !== 'boolean' ? 'interactive-card' : ''}`}
      onClick={handleBooleanClick}
      style={habit.type !== 'boolean' && isCompleted ? { borderColor: habit.color, backgroundColor: 'var(--md-sys-color-surface)' } : undefined}
    >
      <div className="habit-icon" style={{ backgroundColor: isCompleted && habit.type === 'boolean' ? 'transparent' : habit.color + '20', color: isCompleted && habit.type === 'boolean' ? 'var(--md-sys-color-on-primary)' : habit.color }}>
        {habit.icon || '📌'}
      </div>
      <div className="habit-info">
        <h3>{habit.name}</h3>
        {habit.type !== 'boolean' && habit.target_value && (
          <span className="habit-target">Target: {habit.target_value} {habit.unit}</span>
        )}
      </div>
      <div className="habit-controls">
        {renderInputArea()}
      </div>
    </div>
  );
}
