"use client";

import { type ReactNode, useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/motion";
import { ScrollTrigger } from "@/lib/motion-scroll";
import { duration } from "@/lib/motion-tokens";
import { useGroundTone } from "@/lib/use-ground-tone";

/**
 * The homepage's <main>, and every scroll motion on it, in the blueprint's GSAP roles:
 *   data-hero-image  the hero still settles from slightly large, then drifts as you scroll
 *   data-draw        an SVG path (pathLength="1", strokeDasharray="1") draws itself in
 *   data-rule        a chapter rule's gold segment, the fairway line, grows into place
 *   data-rise        a group whose children rise in, staggered
 *   data-mask        a photograph wipes open from the foot up, its image settling
 * Everything is visible without scripts, and reduced motion shows the final composition.
 * Don't put these attributes inside <Suspense>: streamed HTML must not change before it hydrates.
 */
export function HomeMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  // The header and floating buttons follow the ground they are over (lib/use-ground-tone.ts).
  useGroundTone();

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        const enter = (trigger: Element, start = "top 85%") => ({ trigger, start });

        const image = root.current?.querySelector<HTMLElement>("[data-hero-image]");
        if (image) {
          gsap.from(image, { scale: 1.06, duration: duration.scene, ease: "expo.out" });
          gsap.to(image, {
            yPercent: 8,
            ease: "none",
            scrollTrigger: { trigger: image.closest("section"), start: "top top", end: "bottom top", scrub: true },
          });
        }

        gsap.utils.toArray<SVGPathElement>("[data-draw]").forEach((path) => {
          const inHero = path.closest("[data-hero]") !== null;
          gsap.fromTo(
            path,
            { strokeDashoffset: 1 },
            {
              strokeDashoffset: 0,
              duration: inHero ? duration.scene : duration.dramatic,
              delay: inHero ? 0.4 : 0,
              ease: "power2.inOut",
              scrollTrigger: inHero ? undefined : enter(path.closest("figure, section") ?? path, "top 75%"),
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-rule]").forEach((rule) => {
          gsap.fromTo(
            rule,
            { scaleX: 0 },
            { scaleX: 1, duration: duration.dramatic, ease: "power3.inOut", scrollTrigger: enter(rule, "top 90%") },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-rise]").forEach((group) => {
          gsap.fromTo(
            group.children,
            { y: 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: duration.editorial, stagger: 0.08, ease: "expo.out", scrollTrigger: enter(group) },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-mask]").forEach((frame) => {
          const timeline = gsap.timeline({ scrollTrigger: enter(frame) });
          timeline.fromTo(
            frame,
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: duration.dramatic, ease: "expo.inOut" },
          );
          const picture = frame.querySelector("img");
          if (picture) timeline.fromTo(picture, { scale: 1.12 }, { scale: 1, duration: duration.scene, ease: "expo.out" }, 0);
        });
      });

      // Streamed sections, fonts and images change the page's height; triggers below them move.
      const refresh = gsap.delayedCall(0.2, () => ScrollTrigger.refresh()).pause();
      const observer = new ResizeObserver(() => refresh.restart(true));
      if (root.current) observer.observe(root.current);
      return () => observer.disconnect();
    },
    { scope: root },
  );

  return (
    <main ref={root} className="flex-1">
      {children}
    </main>
  );
}
