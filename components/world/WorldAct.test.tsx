import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { WorldAct } from "@/components/world/WorldAct";
import { setAct, world } from "@/lib/world/store";

// jsdom has no matchMedia, which ScrollTrigger needs when it registers. The scroll fade
// isn't what's tested here.
vi.mock("@/lib/motion-scroll", () => ({ ScrollTrigger: { create: vi.fn() } }));

afterEach(() => {
  cleanup();
  setAct(null);
});

test("a page holds its act while it's on screen and lets go when it leaves", () => {
  const { unmount } = render(
    <WorldAct id="story">
      <section>Hero</section>
    </WorldAct>,
  );
  expect(world.act).toBe("story");

  // Next hides pages on navigation by running the same effect cleanups as an unmount.
  unmount();
  expect(world.act).toBeNull();
});
