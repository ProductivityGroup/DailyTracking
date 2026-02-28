export async function sendNtfyNotification(topic: string, habitNames: string[]) {
  if (!topic || topic.trim() === '') {
    console.log(`[ntfy Mock] No topic set. Habits remaining: ${habitNames.join(', ')}`);
    return;
  }

  const sanitizedTopic = topic.trim();
  const count = habitNames.length;
  const list = habitNames.map(h => `  - ${h}`).join('\n');
  const body = `${count} habit${count !== 1 ? 's' : ''} left to complete today:\n${list}`;

  try {
    await fetch(`https://ntfy.sh/${sanitizedTopic}`, {
      method: 'POST',
      headers: {
        'Title': 'DailyTracking Reminder',
        'Priority': 'default',
        'Tags': 'white_check_mark',
        'Content-Type': 'text/plain'
      },
      body
    });
    console.log(`ntfy notification sent to topic: ${sanitizedTopic}`);
  } catch (error) {
    console.error(`Failed to send ntfy notification to topic "${sanitizedTopic}":`, error);
  }
}
