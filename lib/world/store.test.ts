import { afterEach, expect, test, vi } from "vitest";
import { setAct, subscribe, world } from "@/lib/world/store";

afterEach(() => setAct(null));

test("listeners hear when the act changes, and only then", () => {
  const listener = vi.fn();
  const stop = subscribe(listener);

  setAct("story");
  setAct("story");
  expect(world.act).toBe("story");
  expect(listener).toHaveBeenCalledTimes(1);

  setAct(null);
  expect(listener).toHaveBeenCalledTimes(2);

  stop();
  setAct("story");
  expect(listener).toHaveBeenCalledTimes(2);
});
