import { expect, test } from "vitest";
import {
  clockAt,
  contourLines,
  greenHeight,
  greenTileSvg,
  lengthAt,
  lineX,
  meander,
  toMinutes,
  traceLine,
} from "@/features/journey/green";

const cup = { t: 0.92, x: 0.5 };

test("the line stays on the green and finishes exactly in the cup", () => {
  for (let t = 0; t <= cup.t; t += 0.01) {
    const x = lineX(t, cup);
    expect(x).toBeGreaterThan(0.15);
    expect(x).toBeLessThan(0.85);
  }
  expect(lineX(cup.t, cup)).toBeCloseTo(cup.x, 6);
  // Well before the cup, the line is just the read.
  expect(lineX(0.3, cup)).toBeCloseTo(meander(0.3), 6);
});

test("the trace runs from the address to the cup, and rolled distance only grows", () => {
  const points = traceLine(0.08, cup, 600, 6000);
  expect(points[0].t).toBeCloseTo(0.08);
  expect(points.at(-1)?.t).toBeCloseTo(cup.t);
  expect(lengthAt(points, 0)).toBe(0);
  expect(lengthAt(points, 1)).toBe(points.at(-1)?.length);
  let previous = -1;
  for (let t = 0.08; t <= cup.t; t += 0.02) {
    const length = lengthAt(points, t);
    expect(length).toBeGreaterThanOrEqual(previous);
    previous = length;
  }
});

test("the clock reads the chapters' times, and runs between them", () => {
  const stamps = [
    { t: 0.1, minutes: toMinutes("06:12") },
    { t: 0.5, minutes: toMinutes("12:00") },
  ];
  expect(clockAt(stamps, 0)).toBe("06:12");
  expect(clockAt(stamps, 0.1)).toBe("06:12");
  expect(clockAt(stamps, 0.3)).toBe("09:06");
  expect(clockAt(stamps, 0.9)).toBe("12:00");
});

test("the green tile repeats seamlessly from its bottom edge to its top", () => {
  for (const u of [0, 0.25, 0.5, 0.9]) {
    expect(greenHeight(u, 1)).toBeCloseTo(greenHeight(u, 0), 9);
  }
});

test("contour lines lie on their level", () => {
  const lines = contourLines(greenHeight, 0.3, 24, 48);
  expect(lines.length).toBeGreaterThan(0);
  for (const line of lines.slice(0, 5)) {
    for (const [u, v] of line) expect(greenHeight(u, v)).toBeCloseTo(0.3, 1);
  }
});

test("the tile is a self-contained gold SVG", () => {
  const svg = greenTileSvg();
  expect(svg.startsWith("<svg")).toBe(true);
  expect(svg).toContain('stroke="#d4af37"');
  expect(svg.length).toBeLessThan(120_000);
});
