import { useState } from 'react';
import { useHabits, useDateEntries } from '../hooks/useHabits';
import HabitCard from '../components/HabitCard';
import { getLocalDateString } from '../utils/dateUtils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import './HomeDashboard.css';

export default function HomeDashboard() {
  const [currentDate, setCurrentDate] = useState(getLocalDateString());
  const { habits } = useHabits();
  const { dateEntries, toggleDateEntry, setDateEntryValue, removeDateEntry } = useDateEntries(currentDate);

  const total = habits?.length || 0;
  const completed = habits?.filter(h =>
    dateEntries?.some((e: any) => e.habit_id === h.id && e.completed)
  ).length || 0;

  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

  const handlePrevDay = () => {
    const d = new Date(currentDate + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    setCurrentDate(getLocalDateString(d));
  };

  const handleNextDay = () => {
    const d = new Date(currentDate + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    setCurrentDate(getLocalDateString(d));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setCurrentDate(e.target.value);
    }
  };

  const isToday = currentDate === getLocalDateString();

  return (
    <div className="home-dashboard">
      <header className="dashboard-header">
        <div className="date-navigation">
          <button className="date-nav-btn" onClick={handlePrevDay} aria-label="Previous day">
            <ChevronLeft size={24} />
          </button>

          <div className="date-picker-wrapper">
            <h1 className="header-title">{isToday ? 'Today' : new Date(currentDate + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long' })}</h1>
            <div className="date-input-container">
              <CalendarIcon size={14} className="date-icon" />
              <input
                type="date"
                value={currentDate}
                onChange={handleDateChange}
                max={getLocalDateString()}
                className="date-picker-input-native"
              />
              <span className="date-subtitle-text">
                {new Date(currentDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          <button
            className="date-nav-btn"
            onClick={handleNextDay}
            disabled={isToday}
            aria-label="Next day"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </header>

      <section className="progress-section">
        <div className="progress-card">
          <div className="progress-text">
            <h2>{completed} / {total}</h2>
            <p>Habits Completed</p>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </section>

      <section className="habits-list">
        {!habits || habits.length === 0 ? (
          <div className="empty-state">
            <p>No habits to track yet.</p>
            <p>Head over to Manage to add some!</p>
          </div>
        ) : (
          habits.map(habit => {
            const entry = dateEntries?.find((e: any) => e.habit_id === habit.id);
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                entry={entry}
                onToggleBoolean={toggleDateEntry}
                onSetValue={setDateEntryValue}
                onUnlog={removeDateEntry}
              />
            );
          })
        )}
      </section>
    </div>
  );
}
