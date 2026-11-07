import { expect, test } from "vitest";
import {
  BASE_DISTANCE,
  BASE_FOV,
  dollyDistance,
  FLAT_FOV,
  fovFor,
  orbitOffset,
  worldRadiusFor,
} from "@/features/story/camera";

const tanHalf = (fov: number) => Math.tan((fov / 2) * (Math.PI / 180));

test("the dolly zoom keeps the subject the same size on screen", () => {
  expect(dollyDistance(BASE_FOV)).toBeCloseTo(BASE_DISTANCE);
  // The height the camera sees at its target is the same at every field of view.
  for (const flatten of [0, 0.25, 0.5, 1]) {
    const fov = fovFor(flatten);
    expect(2 * dollyDistance(fov) * tanHalf(fov)).toBeCloseTo(2 * BASE_DISTANCE * tanHalf(BASE_FOV));
  }
  expect(fovFor(1)).toBe(FLAT_FOV);
});

test("pitch and orbit place the camera on a sphere round its target", () => {
  const ahead = orbitOffset(0, 0, 9);
  expect(ahead[0]).toBeCloseTo(0);
  expect(ahead[1]).toBeCloseTo(0);
  expect(ahead[2]).toBeCloseTo(9);
  // Looking down means the camera is above the target.
  const [, height] = orbitOffset(-34, 0, 9);
  expect(height).toBeCloseTo(9 * Math.sin((34 * Math.PI) / 180));
  // Straight down: almost all height, almost no forward offset.
  const [x, y, z] = orbitOffset(-89.5, 0, 9);
  expect(Math.hypot(x, y, z)).toBeCloseTo(9);
  expect(y).toBeGreaterThan(8.99);
});

test("a ring sized from its DOM radius projects back onto that radius", () => {
  const viewportHeight = 900;
  const distance = dollyDistance(FLAT_FOV);
  const radius = worldRadiusFor(208, viewportHeight, distance, FLAT_FOV);
  // Project the world radius back to pixels with the camera's own maths.
  const projected = (radius / (distance * tanHalf(FLAT_FOV))) * (viewportHeight / 2);
  expect(projected).toBeCloseTo(208);
});
