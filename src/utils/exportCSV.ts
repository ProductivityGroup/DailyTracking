import { db } from '../db/db';

export async function exportDataAsCSV(): Promise<void> {
  const habits = await db.habits.toArray();
  const entries = await db.entries.toArray();

  // Build habit name lookup
  const habitNames = new Map<string, string>();
  for (const h of habits) {
    habitNames.set(h.id as string, h.name);
  }

  // CSV header
  const rows: string[] = [
    'habit_name,habit_type,date,completed,value,notes'
  ];

  // Sort entries by date
  const sorted = entries.sort((a, b) => a.date.localeCompare(b.date));

  for (const entry of sorted) {
    const name = habitNames.get(entry.habit_id) || 'Unknown';
    const habit = habits.find(h => h.id === entry.habit_id);
    const type = habit?.type || 'unknown';
    const notes = (entry.notes || '').replace(/"/g, '""');

    rows.push(
      `"${name}","${type}","${entry.date}",${entry.completed},${entry.value ?? ''},${notes ? `"${notes}"` : ''}`
    );
  }

  const csv = rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `dailytracking_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
