import { expect, test } from "vitest";
import {
  ACT_LABELS,
  ACT_WINDOWS,
  actAt,
  PLATE_START,
  PLATE_STEP,
  STORY_ACTS,
  STORY_SCREENS,
} from "@/features/story/acts";

test("acts follow each other in order, without overlapping, inside the story", () => {
  let previousEnd = -Infinity;
  for (const id of STORY_ACTS) {
    const [from, to] = ACT_WINDOWS[id];
    expect(from).toBeGreaterThan(previousEnd);
    expect(to).toBeGreaterThan(from);
    expect(to).toBeLessThanOrEqual(STORY_SCREENS);
    previousEnd = to;
  }
});

test("every act rests inside its own window, so a snap always lands on a live act", () => {
  for (const id of STORY_ACTS) {
    expect(actAt(ACT_LABELS[id])).toBe(id);
  }
});

test("between acts, only the world is on screen", () => {
  expect(actAt(1)).toBeNull();
  expect(actAt(4.4)).toBeNull();
});

test("on a phone the last plate comes to rest where the desktop bento does", () => {
  const lastRest = PLATE_START + 4 * PLATE_STEP + 0.22;
  expect(lastRest).toBeCloseTo(ACT_LABELS.club, 1);
  expect(lastRest).toBeLessThan(ACT_WINDOWS.club[1]);
});
