"use client";

import { useEffect, useRef } from "react";
import type { ActLoaders } from "@/lib/world/runtime";
import { subscribe, world } from "@/lib/world/store";
import { pickTier, readTierEnvironment } from "@/lib/world/tier";

// Each act is its own chunk, downloaded only once a page claims it.
const acts: ActLoaders = {
  story: () => import("@/features/story/storyAct"),
  journey: () => import("@/features/journey/ballAct"),
  flight: () => import("@/features/home/flightAct"),
};

const whenIdle = (callback: () => void) => {
  if (typeof requestIdleCallback === "function") {
    const id = requestIdleCallback(callback, { timeout: 2500 });
    return () => cancelIdleCallback(id);
  }
  const id = setTimeout(callback, 1200);
  return () => clearTimeout(id);
};

/**
 * The site's one WebGL canvas, fixed behind every page. It lives in the layout, so it
 * survives client navigation, and pages claim it with <WorldAct />. Three.js downloads only
 * once a page has claimed the world and the browser is idle, and never on the poster tier.
 */
export function World() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let scheduled: (() => void) | undefined;
    let stop: (() => void) | undefined;

    const fallBack = () => {
      world.tier = "poster";
      stop?.();
      stop = undefined;
    };

    // Runs once per visit. After this the runtime follows `world.act` by itself.
    const start = () => {
      if (scheduled || world.act === null) return;
      world.tier ??= pickTier(readTierEnvironment());
      const tier = world.tier;
      if (tier === "poster") return;

      scheduled = whenIdle(() => {
        import("@/lib/world/runtime")
          .then(({ startWorld }) => {
            if (active && container.current) stop = startWorld(container.current, acts, tier, fallBack);
          })
          .catch((error: unknown) => {
            // No WebGL, or the chunk failed to load: pages keep their posters.
            console.error(error);
            world.tier = "poster";
          });
      });
    };

    const unsubscribe = subscribe(start);
    start();
    return () => {
      active = false;
      unsubscribe();
      scheduled?.();
      stop?.();
    };
  }, []);

  return (
    <div
      ref={container}
      aria-hidden
      data-world-canvas
      // The large viewport height, so the canvas doesn't resize every time a phone's address bar slides.
      className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-lvh"
    />
  );
}
