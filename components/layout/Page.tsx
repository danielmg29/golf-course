"use client";

import { SplitText } from "gsap/SplitText";
import { type ReactNode, useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/motion";
import { ScrollTrigger } from "@/lib/motion-scroll";
import { useGroundTone } from "@/lib/use-ground-tone";

gsap.registerPlugin(SplitText);

const delayOf = (element: HTMLElement) => Number(element.dataset.delay ?? 0);

/**
 * The page's `<main>`, and the one place scroll motion is defined. Server components ask
 * for motion with data attributes, so they stay server components:
 *   data-lines     each line of a heading slides up out of a mask
 *   data-fade      fades and rises
 *   data-clip      a photo wipes open from the bottom while its image settles
 *   data-zoom      a photo settles from slightly enlarged, on load
 *   data-parallax  a photo drifts while it crosses the screen
 *   data-rule      a rule's gold stretch (the fairway line) grows into place
 *   data-draw      an SVG path (pathLength="1", strokeDasharray="1") draws itself in; with
 *                  data-scrub it draws with the scroll instead, across its section
 *   data-grow      a line grows with the scroll across its scope: "x" across, "y" down
 *   data-delay     seconds to wait, for staggering neighbours
 *
 * Don't use these inside <Suspense>. This runs when the page hydrates, and changing
 * streamed HTML that React hasn't hydrated yet causes a hydration mismatch.
 */
export function Page({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  // The header and floating buttons follow the ground they are over: dark or light bands.
  useGroundTone();

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        // Not `once: true`. That kills a trigger as soon as it has fired, and when a page
        // loads part-way down (an anchor link, or a restored scroll position) GSAP does it
        // while still walking its trigger list, and crashes. The default toggle actions
        // play once on entry and never reverse, which is all this needs.
        const onEnter = (trigger: Element) => ({ trigger, start: "top 90%" });

        gsap.utils.toArray<HTMLElement>("[data-lines]").forEach((element) => {
          SplitText.create(element, {
            type: "lines",
            mask: "lines",
            linesClass: "split-line",
            autoSplit: true,
            onSplit: (self) => {
              gsap.set(element, { visibility: "visible" });
              return gsap.from(self.lines, {
                yPercent: 112,
                duration: 1.4,
                ease: "expo.out",
                stagger: 0.12,
                delay: delayOf(element),
                scrollTrigger: onEnter(element),
              });
            },
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-fade]").forEach((element) => {
          gsap.fromTo(
            element,
            { autoAlpha: 0, y: 36 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.2,
              ease: "power3.out",
              delay: delayOf(element),
              scrollTrigger: onEnter(element),
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-clip]").forEach((element) => {
          gsap.set(element, { visibility: "visible" });
          const timeline = gsap.timeline({
            delay: delayOf(element),
            scrollTrigger: onEnter(element),
          });
          timeline.fromTo(
            element,
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" },
          );
          const image = element.querySelector("img");
          if (image) {
            timeline.fromTo(image, { scale: 1.2 }, { scale: 1, duration: 2, ease: "expo.out" }, 0);
          }
        });

        gsap.utils.toArray<HTMLElement>("[data-zoom] img").forEach((image) => {
          gsap.fromTo(image, { scale: 1.1 }, { scale: 1, duration: 2.6, ease: "expo.out" });
        });

        gsap.utils.toArray<HTMLElement>("[data-rule]").forEach((rule) => {
          gsap.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: "power3.inOut", scrollTrigger: { trigger: rule, start: "top 92%" } });
        });

        gsap.utils.toArray<SVGPathElement>("[data-draw]").forEach((path) => {
          const scope = path.closest("[data-draw-scope], figure, section") ?? path;
          if (path.hasAttribute("data-scrub")) {
            gsap.fromTo(
              path,
              { strokeDashoffset: 1 },
              { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: scope, start: "top 70%", end: "bottom 60%", scrub: 0.6 } },
            );
            return;
          }
          gsap.fromTo(
            path,
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", delay: delayOf(path as unknown as HTMLElement), scrollTrigger: { trigger: scope, start: "top 75%" } },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-grow]").forEach((line) => {
          const across = line.dataset.grow !== "y";
          const scope = line.closest("[data-draw-scope], section") ?? line;
          gsap.fromTo(
            line,
            across ? { scaleX: 0 } : { scaleY: 0 },
            {
              ...(across ? { scaleX: 1 } : { scaleY: 1 }),
              ease: "none",
              scrollTrigger: { trigger: scope, start: "top 72%", end: across ? "bottom 75%" : "bottom 60%", scrub: 0.6 },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
          gsap.fromTo(
            element,
            { yPercent: -7 },
            {
              yPercent: 7,
              ease: "none",
              scrollTrigger: {
                trigger: element.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });
      });

      // Sections that stream in late change the page's height, which moves every trigger below them.
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
