import { useHabits, useTodayEntries } from '../hooks/useHabits';
import HabitCard from '../components/HabitCard';
import './HomeDashboard.css';

export default function HomeDashboard() {
  const { habits } = useHabits();
  const { todayEntries, toggleTodayEntry, setTodayEntryValue } = useTodayEntries();

  // Basic progress calculation
  const total = habits?.length || 0;
  const completed = habits?.filter(h =>
    todayEntries?.some(e => e.habit_id === h.id && e.completed)
  ).length || 0;

  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="home-dashboard">
      <header className="dashboard-header">
        <h1>Today</h1>
        <p className="date-subtitle">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
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
            const entry = todayEntries?.find(e => e.habit_id === habit.id);
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                entry={entry}
                onToggleBoolean={toggleTodayEntry}
                onSetValue={setTodayEntryValue}
              />
            );
          })
        )}
      </section>
    </div>
  );
}
