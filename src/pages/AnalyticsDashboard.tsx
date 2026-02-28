import { useEffect, useState } from 'react';
import { useHabits, useTodayEntries } from '../hooks/useHabits';
import { db } from '../db/db';
import { HabitEntry } from '../types';
import { CheckCircle2, Target, TrendingUp, CalendarDays, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { exportDataAsCSV } from '../utils/exportCSV';
import './AnalyticsDashboard.css';

interface DailyCompletion {
  date: string;
  count: number;
}

interface EntryData {
  date: string;
  value: number;
}

interface WeeklyData {
  week: string;
  rate: number;
}

interface MonthlyData {
  month: string;
  rate: number;
}

interface HabitStats {
  habitId: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  unit?: string;
  currentStreak: number;
  longestStreak: number;
  completionRate7d: number;
  completionRate30d: number;
  totalCompletions: number;
  entryData: EntryData[];
}

function computeStreaks(entries: HabitEntry[]): { current: number; longest: number } {
  if (entries.length === 0) return { current: 0, longest: 0 };

  const completedDates = entries
    .filter(e => e.completed)
    .map(e => e.date)
    .sort();

  if (completedDates.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let temp = 1;

  for (let i = 1; i < completedDates.length; i++) {
    const prev = new Date(completedDates[i - 1]);
    const curr = new Date(completedDates[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      temp++;
    } else {
      temp = 1;
    }
    longest = Math.max(longest, temp);
  }

  // Check if current streak extends to today
  const today = new Date();
  const lastDate = new Date(completedDates[completedDates.length - 1]);
  const diffToToday = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  const current = diffToToday <= 1 ? temp : 0;

  return { current, longest };
}

// Compute weekly completion rates for last N weeks
function computeWeeklyRates(
  allEntries: HabitEntry[],
  habitCount: number,
  weeks: number = 12
): WeeklyData[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result: WeeklyData[] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() - w * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);

    const startStr = weekStart.toISOString().split('T')[0];
    const endStr = weekEnd.toISOString().split('T')[0];

    const completed = allEntries.filter(
      e => e.completed && e.date >= startStr && e.date <= endStr
    ).length;

    const possible = habitCount * 7;
    const rate = possible > 0 ? Math.round((completed / possible) * 100) : 0;

    const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    result.push({ week: label, rate });
  }

  return result;
}

// Compute monthly completion rates for last N months
function computeMonthlyRates(
  allEntries: HabitEntry[],
  habitCount: number,
  months: number = 12
): MonthlyData[] {
  const today = new Date();
  const result: MonthlyData[] = [];

  for (let m = months - 1; m >= 0; m--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - m, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    const completed = allEntries.filter(
      e => e.completed && e.date >= startStr && e.date <= endStr
    ).length;

    const possible = habitCount * daysInMonth;
    const rate = possible > 0 ? Math.round((completed / possible) * 100) : 0;

    const label = monthDate.toLocaleString('default', { month: 'short' });
    result.push({ month: label, rate });
  }

  return result;
}

export default function AnalyticsDashboard() {
  const { habits } = useHabits();
  const { todayEntries } = useTodayEntries();
  const [stats, setStats] = useState<HabitStats[]>([]);
  const [dailyCompletions, setDailyCompletions] = useState<DailyCompletion[]>([]);
  const [weeklyRates, setWeeklyRates] = useState<WeeklyData[]>([]);
  const [monthlyRates, setMonthlyRates] = useState<MonthlyData[]>([]);
  const [masterTimeline, setMasterTimeline] = useState<any[]>([]);

  useEffect(() => {
    if (!habits || habits.length === 0) return;

    const loadStats = async () => {
      const allStats: HabitStats[] = [];
      const today = new Date();
      const completionMap: Record<string, number> = {};
      const allEntries: HabitEntry[] = [];

      let globalMinDate = new Date(today);

      // Initialize last 30 days in completionMap
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        completionMap[d.toISOString().split('T')[0]] = 0;
      }

      for (const habit of habits) {
        const entries = await db.entries
          .where('habit_id')
          .equals(habit.id as string)
          .toArray();

        allEntries.push(...entries);
        const streaks = computeStreaks(entries);

        const last7 = entries.filter(e => {
          const d = new Date(e.date);
          return Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)) <= 7 && e.completed;
        }).length;

        const last30 = entries.filter(e => {
          const d = new Date(e.date);
          return Math.round((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)) <= 30 && e.completed;
        }).length;

        // Accumulate daily completions
        entries.filter(e => e.completed).forEach(e => {
          if (completionMap[e.date] !== undefined) {
            completionMap[e.date]++;
          }
        });

        // Generate timeline starting from the habit's creation date (or first entry)
        const creationDate = habit.created_at ? new Date(habit.created_at) : new Date(Math.min(...entries.map(e => new Date(e.date).getTime())));
        if (isNaN(creationDate.getTime())) creationDate.setTime(today.getTime()); // fallback
        creationDate.setHours(0, 0, 0, 0);

        if (creationDate < globalMinDate) {
          globalMinDate = new Date(creationDate);
        }

        const entryMap: Record<string, number> = {};
        entries.forEach(e => {
          if (habit.type === 'boolean') {
            entryMap[e.date] = e.completed ? 1 : 0;
          } else {
            entryMap[e.date] = e.value ?? 0;
          }
        });

        const entryData: EntryData[] = [];
        const iterDate = new Date(creationDate);
        while (iterDate <= today) {
          const dStr = iterDate.toISOString().split('T')[0];
          entryData.push({
            date: dStr,
            value: entryMap[dStr] || 0
          });
          iterDate.setDate(iterDate.getDate() + 1);
        }

        allStats.push({
          habitId: habit.id as string,
          name: habit.name,
          icon: habit.icon,
          color: habit.color,
          type: habit.type,
          unit: habit.unit,
          currentStreak: streaks.current,
          longestStreak: streaks.longest,
          completionRate7d: Math.round((last7 / 7) * 100),
          completionRate30d: Math.round((last30 / 30) * 100),
          totalCompletions: entries.filter(e => e.completed).length,
          entryData
        });
      }

      setStats(allStats);

      // Build unified Master Timeline
      const unifiedData: any[] = [];
      const iterGlobal = new Date(globalMinDate);
      while (iterGlobal <= today) {
        const dStr = iterGlobal.toISOString().split('T')[0];
        const dayRecord: any = { date: dStr };
        // Populate this day's record with each habit's value (or 0)
        for (const stat of allStats) {
          const entryForDay = stat.entryData.find(e => e.date === dStr);
          dayRecord[stat.habitId] = entryForDay ? entryForDay.value : 0;
        }
        unifiedData.push(dayRecord);
        iterGlobal.setDate(iterGlobal.getDate() + 1);
      }
      setMasterTimeline(unifiedData);

      // Build daily completions array for bar chart
      const dailyArr = Object.entries(completionMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date: date.slice(5), count })); // MM-DD format
      setDailyCompletions(dailyArr);

      // Compute weekly and monthly rates
      setWeeklyRates(computeWeeklyRates(allEntries, habits.length));
      setMonthlyRates(computeMonthlyRates(allEntries, habits.length));
    };

    loadStats();
  }, [habits, todayEntries]);

  const totalToday = habits?.length || 0;
  const completedToday = habits?.filter(h =>
    todayEntries?.some(e => e.habit_id === h.id && e.completed)
  ).length || 0;

  const chartTooltipStyle = {
    backgroundColor: 'var(--md-sys-color-surface, #fff)',
    border: '1px solid var(--md-sys-color-outline, #ccc)',
    borderRadius: '8px',
    fontSize: 12
  };

  return (
    <div className="analytics-dashboard">
      <header className="analytics-header">
        <div>
          <h1>Analytics</h1>
          <p className="date-subtitle">Your progress at a glance</p>
        </div>
        <button className="export-btn" onClick={exportDataAsCSV} title="Export all data as CSV">
          📥 Export CSV
        </button>
      </header>

      <section className="summary-cards">
        <div className="summary-card stat-today">
          <div className="summary-icon"><CheckCircle2 size={24} /></div>
          <div className="summary-data">
            <span className="summary-value">{completedToday}/{totalToday}</span>
            <span className="summary-label">Today's Progress</span>
          </div>
        </div>
        <div className="summary-card stat-total">
          <div className="summary-icon"><Target size={24} /></div>
          <div className="summary-data">
            <span className="summary-value">{stats.reduce((sum, s) => sum + s.totalCompletions, 0)}</span>
            <span className="summary-label">Total Check-ins</span>
          </div>
        </div>
        <div className="summary-card stat-consistency">
          <div className="summary-icon"><TrendingUp size={24} /></div>
          <div className="summary-data">
            <span className="summary-value">
              {stats.length > 0 ? Math.round(stats.reduce((sum, s) => sum + s.completionRate30d, 0) / stats.length) : 0}%
            </span>
            <span className="summary-label">30-Day Consistency</span>
          </div>
        </div>
      </section>

      {/* Master Timeline Chart */}
      {masterTimeline.length > 0 && (
        <section className="chart-section full-width">
          <div className="chart-header-row">
            <Activity size={16} className="chart-title-icon" />
            <h2>Master Habit Timeline</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={masterTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--md-sys-color-outline, #ccc)" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'var(--md-sys-color-on-surface-variant, #666)' }}
                  interval={Math.max(0, Math.floor(masterTimeline.length / 6))}
                  label={{ value: 'Date', position: 'insideBottom', offset: -5, fontSize: 11, fill: 'var(--md-sys-color-on-surface-variant, #666)' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--md-sys-color-on-surface-variant, #666)' }}
                  label={{ value: 'Value / Check', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'var(--md-sys-color-on-surface-variant, #666)' }}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                {stats.map(s => (
                  <Line
                    key={`line-${s.habitId}`}
                    type={s.type === 'boolean' ? 'stepAfter' : 'monotone'}
                    dataKey={s.habitId}
                    name={s.name}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={{ fill: s.color, r: 2 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* 30-Day Completion Trend Bar Chart */}
      {dailyCompletions.length > 0 && (
        <section className="chart-section full-width">
          <div className="chart-header-row">
            <Activity size={16} className="chart-title-icon" />
            <h2>30-Day Completion Trend</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyCompletions}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--md-sys-color-outline, #ccc)" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'var(--md-sys-color-on-surface-variant, #666)' }}
                  interval={4}
                  label={{ value: 'Date (MM-DD)', position: 'insideBottom', offset: -5, fontSize: 11, fill: 'var(--md-sys-color-on-surface-variant, #666)' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'var(--md-sys-color-on-surface-variant, #666)' }}
                  label={{ value: 'Completions', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'var(--md-sys-color-on-surface-variant, #666)' }}
                />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="count" fill="var(--md-sys-color-primary, #6750A4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <div className="charts-grid-2col">
        {/* Weekly Completion Rate Chart */}
        {weeklyRates.length > 0 && (
          <section className="chart-section">
            <div className="chart-header-row">
              <CalendarDays size={16} className="chart-title-icon" />
              <h2>Weekly Completion</h2>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyRates}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--md-sys-color-outline, #ccc)" opacity={0.3} />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 10, fill: 'var(--md-sys-color-on-surface-variant, #666)' }}
                    label={{ value: 'Week Of', position: 'insideBottom', offset: -5, fontSize: 11, fill: 'var(--md-sys-color-on-surface-variant, #666)' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: 'var(--md-sys-color-on-surface-variant, #666)' }}
                    tickFormatter={(v: number) => `${v}%`}
                    label={{ value: 'Completion %', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'var(--md-sys-color-on-surface-variant, #666)' }}
                  />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(value?: number) => [`${value ?? 0}%`, 'Rate']} />
                  <Bar dataKey="rate" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Monthly Completion Rate Chart */}
        {monthlyRates.length > 0 && (
          <section className="chart-section">
            <div className="chart-header-row">
              <CalendarDays size={16} className="chart-title-icon" />
              <h2>Monthly Completion</h2>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyRates}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--md-sys-color-outline, #ccc)" opacity={0.3} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: 'var(--md-sys-color-on-surface-variant, #666)' }}
                    label={{ value: 'Month', position: 'insideBottom', offset: -5, fontSize: 11, fill: 'var(--md-sys-color-on-surface-variant, #666)' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: 'var(--md-sys-color-on-surface-variant, #666)' }}
                    tickFormatter={(v: number) => `${v}%`}
                    label={{ value: 'Completion %', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'var(--md-sys-color-on-surface-variant, #666)' }}
                  />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(value?: number) => [`${value ?? 0}%`, 'Rate']} />
                  <Bar dataKey="rate" fill="var(--color-tertiary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}
      </div>

      <section className="habit-stats-list">
        <h2>Per-Habit Breakdown</h2>
        {stats.length === 0 ? (
          <div className="empty-state">No habit data yet. Start tracking!</div>
        ) : (
          stats.map(s => (
            <div key={s.habitId} className="stat-card">
              <div className="stat-header">
                <div className="stat-header-left">
                  <div className="stat-icon" style={{ backgroundColor: s.color + '20', color: s.color }}>
                    {s.icon}
                  </div>
                  <h3>{s.name}</h3>
                </div>
              </div>
              <div className="stat-grid">
                <div className="stat-item">
                  <span className="stat-number" style={{ color: s.color }}>{s.currentStreak}</span>
                  <span className="stat-label">Current Streak</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{s.longestStreak}</span>
                  <span className="stat-label">Best Streak</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{s.completionRate7d}%</span>
                  <span className="stat-label">7-Day Rate</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{s.completionRate30d}%</span>
                  <span className="stat-label">30-Day Rate</span>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
