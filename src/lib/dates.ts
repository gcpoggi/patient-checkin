import type { TimeSlot } from "@/lib/types";

export const TIME_SLOTS: TimeSlot[] = [
  "07:00", "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

export function workdaysInMonth(month: string): string[] {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return [];

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return [];

  const dates: string[] = [];
  const cursor = new Date(Date.UTC(year, monthIndex, 1));
  while (cursor.getUTCMonth() === monthIndex) {
    const weekday = cursor.getUTCDay();
    if (weekday >= 1 && weekday <= 5) dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export function daysBetween(startIso: string, endIso: string): number {
  const s = new Date(`${startIso}T00:00:00Z`);
  const e = new Date(`${endIso}T00:00:00Z`);
  return Math.round((e.getTime() - s.getTime()) / 86400000);
}
