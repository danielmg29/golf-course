"use client";

import { type CSSProperties, type ReactNode, useRef } from "react";
import {
  ACT_LABELS,
  ACT_WINDOWS,
  actAt,
  PLATE_START,
  PLATE_STEP,
  STORY_ACTS,
  STORY_SCREENS,
  type StoryActId,
} from "@/features/story/acts";
import { gsap, useGSAP } from "@/lib/motion";
import { ScrollTrigger } from "@/lib/motion-scroll";
import { world } from "@/lib/world/store";

// Must match the `layered` variant in globals.css.
const LAYERED = "(scripting: enabled) and (prefers-reduced-motion: no-preference)";

/**
 * The homepage story: four acts on one sticky stage, driven by one scrubbed timeline whose
 * time unit is one screen of scroll. The acts are server-rendered children, each marked
 * `data-act`; the parts that move are marked `data-part`, Act III's plates `data-plate`
 * (with `data-side="above"` or `"below"` the axis), and Act IV's DOM ring `data-ring`.
 * The plan is section 4 of docs/next-move-roadmap.md.
 */
export function Story({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ wide: `${LAYERED} and (min-width: 768px)`, narrow: `${LAYERED} and (max-width: 767px)` }, (context) => {
        const { narrow } = context.conditions as { wide: boolean; narrow: boolean };
        const q = gsap.utils.selector(stage);
        const act = (id: StoryActId) => q(`[data-act="${id}"]`);
        const parts = (id: StoryActId) => q(`[data-act="${id}"] [data-part]`);
        const plates = q("[data-plate]");

        // The view tilts with scroll speed, not position, so it settles level when you stop.
        const tiltTo = gsap.quickTo(world, "tilt", { duration: 0.7, ease: "power3.out" });
        const settle = () => tiltTo(0);
        ScrollTrigger.addEventListener("scrollEnd", settle);

        // Only the act on screen takes clicks: the others are transparent layers on top of it.
        const enableActs = (time: number) => {
          const current = actAt(time);
          for (const id of STORY_ACTS) {
            for (const element of act(id)) element.style.pointerEvents = id === current ? "auto" : "none";
          }
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "clamp(top top)",
            end: "bottom bottom",
            scrub: 0.8,
            invalidateOnRefresh: true,
            snap: {
              snapTo: "labelsDirectional",
              // Without this a fast gesture (Page Up, a flick) projects past the next act and
              // snaps to the one beyond it. One gesture, one act.
              inertia: false,
              delay: 0.1,
              duration: { min: 0.3, max: 1 },
              ease: "power2.inOut",
            },
            onUpdate: (self) => {
              tiltTo(gsap.utils.clamp(-3, 3, self.getVelocity() / -350));
              enableActs(tl.time());
            },
            onRefresh: () => enableActs(tl.time()),
          },
        });

        /* Act I · the lie, then the drop (0 to 1.35) */
        tl.addLabel("lie", ACT_LABELS.lie)
          .to(parts("lie"), { y: -48, opacity: 0, stagger: 0.04, duration: 0.3, ease: "power2.in" }, 0.05)
          .to(act("lie"), { opacity: 0, duration: 0.2 }, 0.3)
          .to(world, { drop: 1, duration: 0.55, ease: "power3.in" }, 0.25)
          .to(world.camera, { pitch: -34, duration: 0.8, ease: "power2.inOut" }, 0.2)
          .to(world, { morph: 1, duration: 0.7, ease: "power1.inOut" }, 0.8)

          /* Act II · read the ground (1.35 to 4.05) */
          .fromTo(act("ground"), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 1.35)
          .fromTo(parts("ground"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.4, ease: "power3.out" }, 1.35)
          .addLabel("ground", ACT_LABELS.ground)
          .to(world.camera, { orbit: 18, duration: 2.2, ease: "sine.inOut" }, 1.6)
          .to(act("ground"), { opacity: 0, duration: 0.25 }, 3.8)

          /* II → III · the terrain flattens into one axis (4 to 4.8) */
          .to(world.camera, { pitch: 0, orbit: 0, flatten: 1, duration: 0.8, ease: "power2.inOut" }, 4)
          .to(world, { morph: 2, duration: 0.8, ease: "power1.inOut" }, 4)

          /* Act III · choose the club (4.75 to 7.15) */
          .fromTo(act("club"), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 4.75)
          .fromTo(parts("club"), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "power3.out" }, 4.75);

        if (narrow) {
          // One plate at a time on a phone, each with its own rest.
          plates.forEach((plate, i) => {
            const at = PLATE_START + i * PLATE_STEP;
            tl.fromTo(
              plate,
              { xPercent: 115, rotationY: -40, autoAlpha: 0 },
              { xPercent: 0, rotationY: 0, autoAlpha: 1, duration: 0.2, ease: "power3.out" },
              at,
            ).addLabel(i === plates.length - 1 ? "club" : `plate-${i}`, at + 0.22);
            if (i < plates.length - 1) {
              tl.to(plate, { xPercent: -115, rotationY: 40, autoAlpha: 0, duration: 0.2, ease: "power3.in" }, at + 0.32);
            }
          });
        } else {
          // The plates arrive along the axis, swinging in and unfolding off the line. Opacity,
          // not visibility, so they stay in the tab order; focusing one scrolls the story here.
          gsap.set(plates, {
            transformPerspective: 1400,
            transformOrigin: (_: number, element: HTMLElement) =>
              element.dataset.side === "above" ? "50% 100%" : "50% 0%",
          });
          tl.fromTo(
            plates,
            {
              x: () => window.innerWidth * 0.6,
              rotationY: -38,
              rotationX: (_: number, element: HTMLElement) => (element.dataset.side === "above" ? 70 : -70),
              z: -320,
              opacity: 0,
            },
            { x: 0, rotationY: 0, rotationX: 0, z: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.28 },
            PLATE_START,
          ).addLabel("club", ACT_LABELS.club);
        }

        /* III → IV · plates break away, the axis coils, then condenses into the cup (7.1 to 8) */
        tl.to(
          plates,
          { rotationX: -28, y: 140, z: -260, opacity: 0, duration: 0.3, ease: "power2.in", stagger: { each: 0.05, from: "center" } },
          7.1,
        )
          .to(act("club"), { opacity: 0, duration: 0.2 }, 7.2)
          .to(world, { morph: 3, duration: 0.4, ease: "power1.inOut" }, 7.2)
          .to(world.camera, { orbit: 24, duration: 0.4, ease: "sine.inOut" }, 7.2)
          .to(world, { morph: 4, duration: 0.35, ease: "power1.inOut" }, 7.6)
          // Looking down into the cup. Not -90, so the camera's up direction stays defined.
          .to(world.camera, { orbit: 0, pitch: -89.5, duration: 0.35, ease: "power2.inOut" }, 7.6)
          .fromTo(act("hole"), { opacity: 0 }, { opacity: 1, duration: 0.2 }, 7.7)
          .fromTo(parts("hole"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.03, duration: 0.15, ease: "power3.out" }, 7.7)
          .addLabel("hole", ACT_LABELS.hole)
          // Pads the timeline so one second is exactly one screen of scroll.
          .set({}, {}, STORY_SCREENS);

        // Anything that runs past the end stretches the timeline, and then every label lands
        // short of its scroll position and the snap aims at the wrong act.
        if (process.env.NODE_ENV !== "production" && tl.duration() > STORY_SCREENS) {
          console.warn(`Story: the timeline runs to ${tl.duration().toFixed(2)}, past its ${STORY_SCREENS} screens.`);
        }

        // Keyboard: focusing a link in an act that isn't on screen scrolls the story to it.
        const onFocus = (event: FocusEvent) => {
          const id = (event.target as HTMLElement).closest<HTMLElement>("[data-act]")?.dataset.act as StoryActId | undefined;
          const trigger = tl.scrollTrigger;
          if (!id || !trigger) return;
          const [from, to] = ACT_WINDOWS[id];
          if (tl.time() >= from && tl.time() <= to) return;
          window.scrollTo({ top: trigger.labelToScroll(id) });
        };
        const stageElement = stage.current;
        stageElement?.addEventListener("focusin", onFocus);

        return () => {
          ScrollTrigger.removeEventListener("scrollEnd", settle);
          stageElement?.removeEventListener("focusin", onFocus);
        };
      });

      // The WebGL ring is sized to the DOM ring, so the gold lands on its edge.
      const ring = stage.current?.querySelector<HTMLElement>("[data-ring]");
      if (!ring) return;
      const observer = new ResizeObserver(() => {
        world.anchors.ringRadius = ring.offsetWidth / 2;
      });
      observer.observe(ring);
      return () => observer.disconnect();
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      data-hero
      style={{ "--story-screens": STORY_SCREENS + 1 } as CSSProperties}
      className="layered:h-[calc(var(--story-screens)*100svh)]"
    >
      {/* Clip, not hidden: focusing a link that sits outside a hidden box scrolls the box to
          it, which would shift the whole stage sideways. A clipped box can't scroll. */}
      <div ref={stage} className="layered:sticky layered:top-0 layered:h-svh layered:overflow-clip">
        {children}
      </div>
    </div>
  );
}
