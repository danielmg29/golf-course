import { describe, expect, test } from "vitest";
import { holePlans, MAP_DEPTH, MAP_WIDTH, pointOnHole, terrainHeight } from "@/features/hole/courseLayout";
import { holes } from "@/prisma/seed-data";

describe("course routing", () => {
  test("plans every hole in the seed data, once, in order", () => {
    expect(holePlans.map((plan) => plan.number)).toEqual(holes.map((hole) => hole.number));
  });

  test("marks exactly the par threes in the seed data", () => {
    const parThrees = holes.filter((hole) => hole.par === 3).map((hole) => hole.number);
    expect(holePlans.filter((plan) => plan.isParThree).map((plan) => plan.number)).toEqual(parThrees);
  });

  test("keeps all play on the map, inside the fade at its edges", () => {
    for (const plan of holePlans) {
      for (let step = 0; step <= 10; step += 1) {
        const [x, z] = pointOnHole(plan, step / 10);
        expect(Math.abs(x) / (MAP_WIDTH / 2)).toBeLessThan(0.9);
        expect(Math.abs(z) / (MAP_DEPTH / 2)).toBeLessThan(0.9);
      }
    }
  });

  test("a hole's line of play runs from its tee to its green", () => {
    const plan = holePlans[0];
    expect(pointOnHole(plan, 0)).toEqual([...plan.tee]);
    expect(pointOnHole(plan, 1)).toEqual([...plan.green]);
  });

  test("gives the same ground height every time", () => {
    expect(terrainHeight(3, -2)).toBe(terrainHeight(3, -2));
  });
});
