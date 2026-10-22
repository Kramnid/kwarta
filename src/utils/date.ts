/**
 * Date and Time Utilities for Kwarta
 *
 * Designed to strictly avoid accidental UTC timezone shifting by always operating
 * on local calendar day components (YYYY-MM-DD).
 */

/**
 * Returns today's local date as an ISO calendar string (YYYY-MM-DD).
 */
export function getTodayLocalDate(): string {
  const now = new Date();
  return formatLocalDate(now);
}

/**
 * Formats a Date object into YYYY-MM-DD based on local device calendar.
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string into a Date object at local midnight.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day, 12, 0, 0); // Midday local to avoid midnight edge cases
  }
  return new Date(dateStr);
}

/**
 * Returns a friendly greeting based on the current local time of day.
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
 * - "Today"
 * - "Yesterday"
 * - "Oct 21, 2026"
 */
export function formatTransactionDate(dateStr: string): string {
  if (!dateStr) return '';
  const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const today = getTodayLocalDate();

  if (cleanStr === today) {
    return 'Today';
  }

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatLocalDate(yesterdayDate);

  if (cleanStr === yesterday) {
    return 'Yesterday';
  }

  const date = parseLocalDate(cleanStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats date for list section grouping header.
 * E.g. "Today", "Yesterday", or "Wednesday, Oct 21"
 */
export function formatGroupDate(dateStr: string): string {
  if (!dateStr) return '';
  const cleanStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const today = getTodayLocalDate();

  if (cleanStr === today) {
    return 'Today';
  }

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatLocalDate(yesterdayDate);

  if (cleanStr === yesterday) {
    return 'Yesterday';
  }

  const date = parseLocalDate(cleanStr);
  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });
}

/**
 * Checks if a given YYYY-MM-DD date falls within the current calendar week (Monday to Sunday).
 */
export function isDateInThisWeek(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = parseLocalDate(dateStr);
  const now = new Date();

  // Day of week (0 = Sunday, 1 = Monday, ...)
  const currentDay = now.getDay();
  const distanceToMonday = (currentDay + 6) % 7;

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - distanceToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return date >= startOfWeek && date <= endOfWeek;
}

/**
 * Checks if a given YYYY-MM-DD date falls within the current calendar month.
 */
export function isDateInThisMonth(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = parseLocalDate(dateStr);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
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
