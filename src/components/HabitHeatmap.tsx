import './HabitHeatmap.css';

interface HeatmapEntry {
  date: string;        // YYYY-MM-DD
  value: number;       // 0 = not completed, 1+ = completed/value
}

interface HabitHeatmapProps {
  entries: HeatmapEntry[];
  color: string;       // Habit's theme color (hex)
  weeks?: number;      // Number of weeks to show (default 52)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function getIntensityColor(value: number, maxValue: number, color: string): string {
  if (value === 0) return 'var(--md-sys-color-surface-variant)';
  const { r, g, b } = hexToRgb(color);
  const intensity = Math.min(value / Math.max(maxValue, 1), 1);
  // Map to 4 levels: 0.25, 0.5, 0.75, 1.0
  const level = intensity <= 0.25 ? 0.3
    : intensity <= 0.5 ? 0.5
      : intensity <= 0.75 ? 0.75
        : 1.0;
  return `rgba(${r}, ${g}, ${b}, ${level})`;
}

export default function HabitHeatmap({ entries, color, weeks = 52 }: HabitHeatmapProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build lookup map: date string -> value
  const entryMap = new Map<string, number>();
  let maxValue = 1;
  for (const e of entries) {
    entryMap.set(e.date, e.value);
    if (e.value > maxValue) maxValue = e.value;
  }

  // Build grid: weeks × 7 days, ending on today
  const totalDays = weeks * 7;
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - totalDays + 1);

  // Align to the start of the week (Sunday)
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const weekColumns: { date: Date; dateStr: string; value: number }[][] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= today || weekColumns.length === 0 || weekColumns[weekColumns.length - 1].length < 7) {
    const weekIndex = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    if (!weekColumns[weekIndex]) weekColumns[weekIndex] = [];

    const dateStr = currentDate.toISOString().split('T')[0];
    weekColumns[weekIndex].push({
      date: new Date(currentDate),
      dateStr,
      value: entryMap.get(dateStr) || 0
    });

    currentDate.setDate(currentDate.getDate() + 1);

    // Safety: don't go past today's week + a bit more
    if (weekColumns.length > weeks + 2) break;
  }

  // Month labels
  const months: { label: string; colSpan: number }[] = [];
  let lastMonth = -1;
  for (const week of weekColumns) {
    if (week.length === 0) continue;
    const firstDay = week[0].date;
    const month = firstDay.getMonth();
    if (month !== lastMonth) {
      months.push({
        label: firstDay.toLocaleString('default', { month: 'short' }),
        colSpan: 1
      });
      lastMonth = month;
    } else if (months.length > 0) {
      months[months.length - 1].colSpan++;
    }
  }

  const { r, g, b } = hexToRgb(color);

  return (
    <div className="heatmap-wrapper">
      <p className="heatmap-title">Activity (Last {weeks} weeks)</p>
      <div className="heatmap-container">
        {/* Month labels */}
        <div className="heatmap-months">
          {months.map((m, i) => (
            <span
              key={i}
              className="heatmap-month-label"
              style={{ width: m.colSpan * 12 }}
            >
              {m.colSpan >= 2 ? m.label : ''}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="heatmap-grid">
          {weekColumns.map((week, wi) => (
            <div key={wi} className="heatmap-week">
              {week.map((day, di) => (
                <div
                  key={di}
                  className="heatmap-cell"
                  style={{
                    backgroundColor: day.date > today
                      ? 'transparent'
                      : getIntensityColor(day.value, maxValue, color)
                  }}
                  data-tooltip={`${day.dateStr}: ${day.value > 0 ? day.value : 'none'}`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="heatmap-legend">
          <span className="heatmap-legend-label">Less</span>
          {[0, 0.3, 0.5, 0.75, 1.0].map((level, i) => (
            <div
              key={i}
              className="heatmap-legend-cell"
              style={{
                backgroundColor: level === 0
                  ? 'var(--md-sys-color-surface-variant)'
                  : `rgba(${r}, ${g}, ${b}, ${level})`
              }}
            />
          ))}
          <span className="heatmap-legend-label">More</span>
        </div>
      </div>
    </div>
  );
}
