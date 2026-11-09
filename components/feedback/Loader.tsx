"use client";

import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/ui/primitives";
import { gsap } from "@/lib/motion";

/** Kept in sessionStorage once the putt has played, so it shows once a visit. */
export const LOADER_KEY = "reserve:putt";

/**
 * Runs in <head> before the first paint: on a visit's first page, with motion allowed, it marks
 * <html data-loader="on">, which is what shows the loading screen (globals.css). Nothing else
 * ever shows it, so returning visitors and reduced motion never see it at all.
 */
export const loaderGate = `(function(){try{if(sessionStorage.getItem("${LOADER_KEY}"))return;if(!matchMedia("(prefers-reduced-motion: no-preference)").matches)return;document.documentElement.dataset.loader="on";}catch(e){}})();`;

// Long enough for the putt to read; never longer than the cap, however slow the page.
const SHORTEST_MS = 1100;
const LONGEST_MS = 2300;

/**
 * The first-visit loading screen: a putt rolling towards you through the grass while the page
 * loads, dropping as it finishes (puttScene.ts). It lasts only as long as the page is loading,
 * capped near two seconds, and can be skipped with the button or Escape. Until Three.js arrives
 * the line at the foot carries the progress on its own; if scripts fail, CSS fades it anyway.
 */
export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const skip = useRef<() => void>(() => {});
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    // Not this visit's first page, or reduced motion: the screen stays hidden by CSS.
    if (html.dataset.loader !== "on") return;
    try {
      sessionStorage.setItem(LOADER_KEY, "1");
    } catch {}

    let alive = true;
    let loaded = document.readyState === "complete";
    let shown = 0;
    let leaving = false;
    let stopScene: (() => void) | undefined;
    const onLoad = () => (loaded = true);
    window.addEventListener("load", onLoad, { once: true });

    import("./puttScene")
      .then(({ mountPutt }) => {
        if (alive && stage.current) stopScene = mountPutt(stage.current, () => shown);
      })
      .catch((error: unknown) => console.error(error));

    const finish = () => {
      if (leaving) return;
      leaving = true;
      gsap.ticker.remove(tick);
      // The homepage's entrance played out under the screen: run it again as the screen lifts.
      document.querySelectorAll("[data-hero-rise] > *").forEach((element) =>
        element.getAnimations().forEach((animation) => {
          animation.currentTime = 0;
          animation.play();
        }),
      );
      gsap.to(root.current, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.8,
        ease: "expo.inOut",
        onComplete: () => {
          delete html.dataset.loader;
          stopScene?.();
          setGone(true);
        },
      });
    };

    // The progress the screen shows: it creeps towards nine tenths while the page loads, and runs
    // home once it has, after the shortest showing, or at the cap.
    const tick = (_time: number, deltaMs: number) => {
      const elapsed = performance.now();
      const ready = (loaded && elapsed > SHORTEST_MS) || elapsed > LONGEST_MS;
      const target = ready ? 1 : Math.min(0.9, 1 - Math.exp(-elapsed / 700));
      shown += (target - shown) * (1 - Math.exp(-deltaMs / (ready ? 160 : 260)));
      if (ready && shown > 0.995) shown = 1;
      root.current?.style.setProperty("--progress", shown.toFixed(4));
      if (shown >= 1) {
        // Let the ball drop before the screen lifts.
        gsap.ticker.remove(tick);
        gsap.delayedCall(0.35, finish);
      }
    };
    gsap.ticker.add(tick);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    skip.current = finish;

    return () => {
      alive = false;
      gsap.ticker.remove(tick);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("keydown", onKey);
      stopScene?.();
      // The flag stays: in development React mounts this twice, and the second mount must still
      // find the screen up. Only finishing takes it down (and CSS does, if nothing else runs).
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={root}
      data-loader-screen
      role="status"
      aria-label="Loading the club"
      className="fixed inset-0 z-[70] hidden flex-col overflow-hidden bg-forest text-paper"
    >
      <div ref={stage} aria-hidden className="absolute inset-0" />
      {/* A gentle shade at the foot, so the line and its words read over the grass. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(0deg,rgb(16_47_37/0.85),transparent)]" />
      <div className="frame relative flex h-full flex-col justify-between pb-8 pt-8 md:pb-10">
        <div className="flex justify-center">
          <Wordmark className="text-forest" />
        </div>
        <div>
          <div className="flex items-end justify-between gap-6">
            <p className="font-display text-h3 italic">Reading the green</p>
            <button
              type="button"
              onClick={() => skip.current()}
              className="font-ui text-sm font-semibold text-paper/85 underline decoration-antique underline-offset-4 transition-colors duration-200 hover:text-paper"
            >
              Skip
            </button>
          </div>
          {/* The fairway line, filling as the page loads. */}
          <div aria-hidden className="relative mt-4 h-px">
            <span className="absolute inset-0 bg-paper/25" />
            <span className="absolute -top-px left-0 h-[3px] w-full origin-left scale-x-[var(--progress,0)] bg-antique" />
          </div>
        </div>
      </div>
    </div>
  );
}
