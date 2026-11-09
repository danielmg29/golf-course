"use client";

import { type ReactNode, useLayoutEffect, useRef } from "react";
import { useGSAP } from "@/lib/motion";
import { ScrollTrigger } from "@/lib/motion-scroll";
import { type ActId, setAct, world } from "@/lib/world/store";

/**
 * Shows act `id` in the world while this page is on screen, and fades the world out as the
 * end of `children` scrolls away. Next keeps recently visited pages alive but hidden, and React
 * runs effect cleanups when it hides them, so a hidden page always releases the world.
 *
 * `layer="over"` lifts the canvas above the page's content (still under the header), for acts
 * that draw objects on the page itself. The canvas never takes clicks either way.
 */
export function WorldAct({ id, layer, children }: { id: ActId; layer?: "over"; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  // A layout effect, so the act is claimed before the world's own effect first looks for one.
  useLayoutEffect(() => {
    const html = document.documentElement;
    world.presence = 1;
    if (layer) html.dataset.worldLayer = layer;
    setAct(id);
    return () => {
      setAct(null);
      delete html.dataset.worldLayer;
    };
  }, [id, layer]);

  useGSAP(
    () => {
      const follow = (self: ScrollTrigger) => {
        world.presence = 1 - self.progress ** 1.5;
      };
      ScrollTrigger.create({
        trigger: root.current,
        // From the last screen of `children` being fully in view to it having left.
        start: "bottom bottom",
        end: "bottom top",
        onUpdate: follow,
        onRefresh: follow,
      });
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
