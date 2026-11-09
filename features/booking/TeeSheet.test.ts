import { expect, test } from "vitest";
import { calendarLink } from "@/features/booking/TeeSheet";
import type { Day } from "@/lib/dates";

const day: Day = { key: "2026-11-28", weekday: "Sat", date: "28 Nov", isWeekend: true };

const invite = (time: string) => decodeURIComponent(calendarLink(day, time));

test("a round ends four and a half hours after the tee time", () => {
  expect(invite("07:00")).toContain("DTSTART:20261128T070000");
  expect(invite("07:00")).toContain("DTEND:20261128T113000");
});

test("the finish time carries over the hour correctly", () => {
  expect(invite("08:45")).toContain("DTEND:20261128T131500");
});
