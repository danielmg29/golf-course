"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import type { SceneSetup } from "@/lib/three";

type SceneCanvasProps = {
  /** Define at module level. A new function on each render would remount the scene. */
  load: () => Promise<{ default: SceneSetup }>;
  /** Describes the scene for screen readers. */
  label: string;
  /** Shown when WebGL is unavailable or the scene fails to load. */
  fallback?: ReactNode;
  className?: string;
};

export function SceneCanvas({ load, label, fallback, className }: SceneCanvasProps) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let unmount: (() => void) | undefined;
    const element = container.current;
    if (!element) return;

    const start = () =>
      Promise.all([import("@/lib/three"), load()])
        .then(([{ mountStage }, scene]) => {
          if (active && container.current) {
            unmount = mountStage(container.current, scene.default);
          }
        })
        .catch((error: unknown) => {
          console.error(error);
          if (active) setFailed(true);
        });

    // Three.js and the scene download only once the canvas is about a screen away, so a scene
    // far down a page costs nothing until the visitor heads towards it.
    const approach = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        approach.disconnect();
        void start();
      },
      { rootMargin: "100% 0px" },
    );
    approach.observe(element);

    return () => {
      active = false;
      approach.disconnect();
      unmount?.();
    };
  }, [load]);

  return (
    <div ref={container} role="img" aria-label={label} className={className}>
      {failed ? fallback : null}
    </div>
  );
}
