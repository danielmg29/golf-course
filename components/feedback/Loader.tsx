"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { Wordmark } from "@/components/ui/primitives";
import { gsap, MOTION_OK } from "@/lib/motion";

/**
 * Runs in <head> before the first paint: with motion allowed, it marks <html data-loader="on">,
 * which shows the loading screen (globals.css) over every page as it first loads. With reduced
 * motion it does nothing, and no putt ever plays.
 */
export const loaderGate = `(function(){try{if(!matchMedia("(prefers-reduced-motion: no-preference)").matches)return;document.documentElement.dataset.loader="on";}catch(e){}})();`;

// One full putt, from the far end of the green into the cup.
const PUTT_MS = 2400;
// Where the ball waits, a little short of the cup, while a slow page is still coming.
const HOLD = 0.9;
// However slow the page, the ball drops after this much waiting.
const LONGEST_WAIT_MS = 8000;
// The first time, the 3D scene has to download; the putt waits this long for it at most.
const SCENE_WAIT_MS = 1500;
const COVER_S = 0.45;
const DROP_S = 0.35;
const LIFT_S = 0.7;

type Mode = "first" | "nav" | "back";

type Run = {
  mode: Mode;
  /** The page a link asked for, until the router has it. */
  target: string | null;
  pushed: boolean;
  /** The page is there to show. */
  ready: boolean;
  /** The putt is under way (after the cover, and once the scene can draw). */
  rolling: boolean;
  progress: number;
  started: number;
  finishing: boolean;
};

const pathOf = (href: string) => new URL(href, window.location.href).pathname;

/**
 * The loading screen: a putt rolling towards you through the grass, dropping into the cup,
 * before every page. It covers the first load of any page, every move between pages inside the
 * site (a link's click is held until the screen covers, then the page loads behind it), and back
 * and forward. The putt always plays out in full; if the page isn't ready by then, the ball waits
 * short of the cup and drops when it is. Skip or Escape lifts it at once. With reduced motion it
 * never shows. The 3D scene (puttScene.ts) loads once and is kept, so later putts start at once.
 */
export function Loader() {
  const router = useRouter();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const run = useRef<Run | null>(null);
  const start = useRef<(mode: Mode, target: string | null) => void>(() => {});
  const finish = useRef<() => void>(() => {});
  // The page last seen, so only a real move to another page counts (development mounts twice).
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    const screen = root.current;
    if (!screen) return;
    let alive = true;
    let sceneState: "none" | "loading" | "ready" = "none";
    let stopScene: (() => void) | undefined;

    const setProgress = (value: number) => screen.style.setProperty("--progress", value.toFixed(4));

    const ensureScene = () => {
      if (sceneState !== "none" || !stage.current) return;
      sceneState = "loading";
      import("./puttScene")
        .then(({ mountPutt }) => {
          if (!alive || !stage.current) return;
          stopScene = mountPutt(
            stage.current,
            () => run.current?.progress ?? 0,
            () => run.current !== null,
          );
          sceneState = "ready";
        })
        .catch((error: unknown) => {
          console.error(error);
          // Without the scene the line at the foot still carries the putt.
          sceneState = "ready";
        });
    };

    const push = (current: Run) => {
      if (current.pushed || !current.target) return;
      current.pushed = true;
      router.push(current.target);
    };

    const lift = () => {
      const current = run.current;
      if (!current) return;
      current.finishing = true;
      if (current.mode === "nav") push(current);
      // The homepage's entrance played out under the screen: run it again as the screen lifts.
      document.querySelectorAll("[data-hero-rise] > *").forEach((element) =>
        element.getAnimations().forEach((animation) => {
          animation.currentTime = 0;
          animation.play();
        }),
      );
      gsap.killTweensOf(screen);
      gsap.to(screen, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: LIFT_S,
        ease: "expo.inOut",
        onComplete: () => {
          // A new putt may have started while this one lifted; leave that one alone.
          if (run.current !== current) return;
          run.current = null;
          delete html.dataset.loader;
          delete html.dataset.loaderMode;
          gsap.set(screen, { clearProps: "clipPath" });
          setProgress(0);
        },
      });
    };

    const begin = (mode: Mode, target: string | null) => {
      gsap.killTweensOf(screen);
      const current: Run = {
        mode,
        target,
        pushed: false,
        ready: mode === "back",
        rolling: mode !== "nav",
        progress: 0,
        started: performance.now(),
        finishing: false,
      };
      run.current = current;
      setProgress(0);
      ensureScene();
      html.dataset.loaderMode = mode;
      html.dataset.loader = "on";
      if (mode === "nav") {
        // The screen rises over the page you're leaving; only then does the next one load.
        gsap.fromTo(
          screen,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: COVER_S,
            ease: "expo.inOut",
            onComplete: () => {
              if (run.current !== current) return;
              current.rolling = true;
              current.started = performance.now();
              push(current);
            },
          },
        );
      } else {
        gsap.set(screen, { clipPath: "inset(0% 0% 0% 0%)" });
      }
    };

    // The putt: steady progress over PUTT_MS, held short of the cup until the page is ready.
    const tick = (_time: number, deltaMs: number) => {
      const current = run.current;
      if (!current || current.finishing || !current.rolling) return;
      const waited = performance.now() - current.started;
      // The first time, give the scene a moment to arrive, so the whole putt is seen.
      if (sceneState === "loading" && current.progress === 0 && waited < SCENE_WAIT_MS) return;
      if (current.mode === "first" && document.readyState === "complete") current.ready = true;
      if (waited > PUTT_MS + LONGEST_WAIT_MS) current.ready = true;
      const step = Math.min(deltaMs, 100) / PUTT_MS;
      current.progress = Math.min(current.ready ? 1 : HOLD, current.progress + step);
      setProgress(current.progress);
      if (current.progress >= 1) {
        current.finishing = true;
        // Let the ball drop before the screen lifts.
        gsap.delayedCall(DROP_S, () => {
          if (run.current === current) lift();
        });
      }
    };
    gsap.ticker.add(tick);

    // Every link inside the site waits for the screen to cover before it navigates.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!window.matchMedia(MOTION_OK).matches) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      // Other sites, and links within this page (anchors), go as they are.
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      event.preventDefault();
      begin("nav", url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick, true);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && run.current && !run.current.finishing) lift();
    };
    window.addEventListener("keydown", onKey);

    start.current = begin;
    finish.current = lift;

    // The first load: the gate in <head> has already put the screen up.
    if (html.dataset.loader === "on" && !run.current) begin("first", null);

    return () => {
      alive = false;
      gsap.ticker.remove(tick);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("keydown", onKey);
      stopScene?.();
      // The flag stays: in development React mounts this twice, and the second mount must still
      // find the screen up.
      run.current = null;
    };
  }, [router]);

  // Arriving at a new page: a link's putt learns its page is there; back and forward (which no
  // click announced) get a putt of their own, covering the page before it's painted.
  useLayoutEffect(() => {
    const previous = lastPath.current;
    lastPath.current = pathname;
    if (previous === null || previous === pathname) return;
    const current = run.current;
    if (current?.mode === "nav" && current.target && pathOf(current.target) === pathname) {
      current.ready = true;
      return;
    }
    if (!current && window.matchMedia(MOTION_OK).matches) start.current("back", null);
  }, [pathname]);

  return (
    <div
      ref={root}
      data-loader-screen
      role="status"
      aria-label="Loading the page"
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
              onClick={() => finish.current()}
              className="font-ui text-sm font-semibold text-paper/85 underline decoration-antique underline-offset-4 transition-colors duration-200 hover:text-paper"
            >
              Skip
            </button>
          </div>
          {/* The fairway line, filling as the ball runs to the cup. */}
          <div aria-hidden className="relative mt-4 h-px">
            <span className="absolute inset-0 bg-paper/25" />
            <span className="absolute -top-px left-0 h-[3px] w-full origin-left scale-x-[var(--progress,0)] bg-antique" />
          </div>
        </div>
      </div>
    </div>
  );
}
