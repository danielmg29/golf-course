import { expect, test } from "vitest";
import { nextDays, sampleNoise } from "@/lib/dates";

test("lists consecutive days across a month end and flags weekends", () => {
  const days = nextDays("2026-11-28", 4);

  expect(days.map((day) => day.key)).toEqual(["2026-11-28", "2026-11-29", "2026-11-30", "2026-12-01"]);
  expect(days.map((day) => day.isWeekend)).toEqual([true, true, false, false]);
  expect(days[0].weekday).toBe("Sat");
});

test("sample availability stays put for the same input and stays in range", () => {
  expect(sampleNoise("2026-11-28-07:30")).toBe(sampleNoise("2026-11-28-07:30"));
  for (const input of ["a", "b", "2026-11-28-07:30", ""]) {
    expect(sampleNoise(input)).toBeGreaterThanOrEqual(0);
    expect(sampleNoise(input)).toBeLessThanOrEqual(1);
  }
});
