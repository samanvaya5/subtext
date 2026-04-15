export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86_400_000);
}

export function toRFC3339(date: Date): string {
  return date.toISOString();
}

export function parseRelativeTime(text: string): Date | null {
  const now = Date.now();
  const match = text.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const ms: Record<string, number> = {
    second: 1000,
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
    week: 604_800_000,
    month: 2_592_000_000,
    year: 31_536_000_000,
  };
  return new Date(now - n * (ms[unit] ?? 0));
}
