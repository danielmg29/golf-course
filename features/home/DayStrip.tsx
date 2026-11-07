"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";
import { Photo } from "@/components/ui/primitives";
import type { ClubHour } from "@/features/club/DayAtTheClub";
import { gsap, MOTION_OK, useGSAP } from "@/lib/motion";
import type { ScrollTrigger } from "@/lib/motion-scroll";
import { duration } from "@/lib/motion-tokens";

const pad = (value: number) => String(value).padStart(2, "0");

/**
 * Chapter 04's one horizontal story: the club's day, hour by hour, threaded on the fairway
 * line. On desktop the strip pins and scroll carries it sideways; on phones, and with reduced
 * motion, it is a swipe rail that snaps card by card. Either way the arrows, the progress bar
 * and the keyboard all move it, and every card is a plain link.
 */
export function DayStrip({ hours }: { hours: ClubHour[] }) {
  const root = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const pinned = useRef<ScrollTrigger | null>(null);

  const show = (progress: number) => {
    const clamped = Math.min(1, Math.max(0, progress));
    if (bar.current) bar.current.style.transform = `scaleX(${Math.max(1 / hours.length, clamped)})`;
    if (counter.current) counter.current.textContent = `${pad(Math.round(clamped * (hours.length - 1)) + 1)} / ${pad(hours.length)}`;
  };

  useGSAP(
    () => {
      gsap.matchMedia().add(`(min-width: 1024px) and ${MOTION_OK}`, () => {
        const railElement = rail.current;
        const trackElement = track.current;
        if (!railElement || !trackElement) return;
        // How far the track travels: until its last card sits inside the rail's padded edge.
        const distance = () => {
          const padding = parseFloat(getComputedStyle(railElement).paddingLeft) || 0;
          return Math.max(0, trackElement.scrollWidth - (railElement.clientWidth - padding));
        };
        railElement.style.overflowX = "hidden";
        const tween = gsap.to(trackElement, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => show(self.progress),
          },
        });
        pinned.current = tween.scrollTrigger ?? null;
        return () => {
          pinned.current = null;
          railElement.style.overflowX = "";
        };
      });
    },
    { scope: root },
  );

  const cardStep = () => {
    const first = track.current?.children[0] as HTMLElement | undefined;
    const second = track.current?.children[1] as HTMLElement | undefined;
    return first && second ? second.offsetLeft - first.offsetLeft : 320;
  };

  const step = (direction: 1 | -1) => {
    const trigger = pinned.current;
    if (trigger) {
      const top = Math.min(trigger.end, Math.max(trigger.start, window.scrollY + direction * cardStep()));
      window.scrollTo({ top, behavior: "smooth" });
    } else {
      rail.current?.scrollBy({ left: direction * cardStep(), behavior: "smooth" });
    }
  };

  // In the pinned strip a focused card may sit off screen: scroll the page to bring it in.
  const reveal = (index: number) => {
    const trigger = pinned.current;
    const card = track.current?.children[index] as HTMLElement | undefined;
    if (!trigger || !card) return;
    window.scrollTo({ top: trigger.start + Math.min(card.offsetLeft, trigger.end - trigger.start) });
  };

  return (
    // The floating buttons step aside over the strip, so they never cover its cards (HomeMotion).
    <div ref={root} data-floating="hide" className="mt-12 flex flex-col justify-center lg:mt-0 lg:min-h-svh lg:pb-12 lg:pt-28">
      <div
        ref={rail}
        onScroll={(event) => {
          const element = event.currentTarget;
          if (!pinned.current) show(element.scrollLeft / Math.max(1, element.scrollWidth - element.clientWidth));
        }}
        className="frame-rail snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
      >
        <ol ref={track} aria-label="One day at the club" className="flex w-max gap-4 pr-5 md:gap-6 md:pr-8 lg:pr-12">
          {hours.map((hour, index) => (
            <li key={hour.time} className="w-[76vw] shrink-0 snap-start sm:w-[46vw] lg:w-[min(28vw,25rem)]">
              <Link href={hour.href} onFocus={() => reveal(index)} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-stone/20">
                  <Photo
                    name={hour.photo}
                    sizes="(min-width: 1024px) 28vw, 76vw"
                    decorative
                    className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                {/* The fairway line threads every moment of the day. */}
                <div className="relative mt-6 flex items-center">
                  {index < hours.length - 1 ? (
                    <span aria-hidden className="absolute left-0 right-[-1.5rem] top-1/2 h-px bg-antique" />
                  ) : null}
                  <span aria-hidden className="relative size-2.5 rounded-full bg-antique ring-[6px] ring-paper" />
                  {/* The paper behind the time hides the line, so it never reads as a minus sign. */}
                  <span className="relative bg-paper px-3 font-ui text-base font-semibold tabular-nums">{hour.time}</span>
                </div>
                <h3 className="mt-4 font-display text-h3 font-light">{hour.title}</h3>
                <p className="mt-1.5 flex items-center gap-2 font-ui text-sm text-coal/80">
                  {hour.note}
                  <ArrowRight width={14} height={14} className="text-antique transition-transform group-hover:translate-x-1" style={{ transitionDuration: `${duration.fast}s` }} />
                </p>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <div className="frame mt-10 flex items-center gap-6">
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous moment"
            onClick={() => step(-1)}
            className="flex size-11 items-center justify-center border border-coal/30 transition-colors duration-200 hover:border-coal hover:bg-coal hover:text-paper"
          >
            <ArrowLeft width={16} height={16} />
          </button>
          <button
            type="button"
            aria-label="Next moment"
            onClick={() => step(1)}
            className="flex size-11 items-center justify-center border border-coal/30 transition-colors duration-200 hover:border-coal hover:bg-coal hover:text-paper"
          >
            <ArrowRight width={16} height={16} />
          </button>
        </div>
        <div aria-hidden className="relative h-px flex-1 bg-coal/20">
          <span ref={bar} className="absolute -top-px left-0 h-[3px] w-full origin-left bg-antique" style={{ transform: `scaleX(${1 / hours.length})` }} />
        </div>
        <span ref={counter} aria-hidden className="type-meta">
          01 / {pad(hours.length)}
        </span>
      </div>
      <p className="frame type-meta mt-4 text-coal/80">A sample day at the club. Placeholder photographs.</p>
    </div>
  );
}
