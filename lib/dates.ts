import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
// The en-CA locale formats dates as YYYY-MM-DD, in the visitor's own time zone.
const todayKey = () => new Date().toLocaleDateString("en-CA");

/**
 * Today as YYYY-MM-DD, or null during server rendering. Pages are prerendered, so "today"
 * is only known in the browser. Show a placeholder while this is null.
 */
export function useToday() {
  return useSyncExternalStore(subscribe, todayKey, () => null);
}

export type Day = { key: string; weekday: string; date: string; isWeekend: boolean };

export function nextDays(today: string, count: number): Day[] {
  const start = new Date(`${today}T12:00:00Z`);
  return Array.from({ length: count }, (_, offset) => {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + offset);
    const weekdayIndex = day.getUTCDay();
    return {
      key: day.toISOString().slice(0, 10),
      weekday: day.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" }),
      date: day.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
      isWeekend: weekdayIndex === 0 || weekdayIndex === 6,
    };
  });
}

/** Same input, same number from 0 to 1. Gives demo availability that stays put between visits. */
export function sampleNoise(input: string) {
  let hash = 2166136261;
  for (const character of input) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

export const kes = (amount: number) => `KES ${amount.toLocaleString("en-GB")}`;
export const usd = (amount: number) => `US$${amount.toLocaleString("en-GB")}`;
