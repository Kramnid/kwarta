/**
 * Date and Time Utilities for Kwarta
 */

/**
 * Returns a friendly greeting based on the current local time of day.
 * - < 12:00: "Good morning"
 * - 12:00 - 17:59: "Good afternoon"
 * - >= 18:00: "Good evening"
 */
export function formatGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

/**
 * Formats a transaction date into a human-readable string.
 * Examples:
 * - "Today" (if date matches current day)
 * - "Yesterday" (if date matches previous day)
 * - "Oct 21, 2026" (otherwise)
 */
export function formatTransactionDate(dateStr: string): string {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return dateStr;
  }

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return 'Today';
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Returns formatted month and year string (e.g. "October 2026").
 */
export function formatCurrentMonth(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}
