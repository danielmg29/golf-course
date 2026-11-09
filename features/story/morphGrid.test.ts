import { expect, test } from "vitest";
import { MAP_DEPTH, MAP_WIDTH, terrainHeight } from "@/features/hole/courseLayout";
import { buildMorphGrid } from "@/features/story/morphGrid";

test("every vertex is joined to its neighbours along both grid directions", () => {
  const columns = 5;
  const rows = 4;
  const index = buildMorphGrid(columns, rows).getIndex()!.array;

  const alongU = (columns - 1) * rows;
  const alongV = columns * (rows - 1);
  expect(index.length).toBe((alongU + alongV) * 2);
  expect(Math.max(...index)).toBe(columns * rows - 1);
});

test("the grid spans 0 to 1 and carries the real course's heights", () => {
  const geometry = buildMorphGrid(5, 4);
  const uv = geometry.getAttribute("aUV");
  const height = geometry.getAttribute("aHeight");
  const last = uv.count - 1;

  expect([uv.getX(0), uv.getY(0)]).toEqual([0, 0]);
  expect([uv.getX(last), uv.getY(last)]).toEqual([1, 1]);
  expect(height.getX(0)).toBeCloseTo(terrainHeight(-MAP_WIDTH / 2, -MAP_DEPTH / 2), 5);
  expect(height.getX(last)).toBeCloseTo(terrainHeight(MAP_WIDTH / 2, MAP_DEPTH / 2), 5);
});

test("the seeds are the same on every build", () => {
  const seeds = (geometry: ReturnType<typeof buildMorphGrid>) => Array.from(geometry.getAttribute("aSeed").array);
  const first = seeds(buildMorphGrid(6, 6));
  expect(seeds(buildMorphGrid(6, 6))).toEqual(first);
  expect(first.every((seed) => seed >= 0 && seed < 1)).toBe(true);
});
