import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export type TimelineStop = {
  /** The big mark on the line: a year, a date, a day. */
  mark: string;
  /** Small words beside the mark, such as the month. */
  detail?: string;
  title: string;
  body: ReactNode;
  /** A short tag under the body, such as the kind of event. */
  meta?: string;
  /** Where the stop leads, for the last one especially. */
  link?: { href: string; label: string };
};

/**
 * The fairway line as a timeline, shared by About (the club's past to its present), Events
 * (the calendar) and Stay & Play (a week's journey). Across the grid on wide screens, where the
 * gold grows with the scroll and each stop sits on it; down the left on phones, stacked.
 */
export function Timeline({ stops, label, className }: { stops: TimelineStop[]; label: string; className?: string }) {
  return (
    <div data-draw-scope className={cn("relative", className)}>
      {/* The line: a hairline, and the gold that grows along it with the scroll. */}
      <div aria-hidden className="absolute bottom-2 left-[5px] top-2 w-px lg:inset-x-0 lg:bottom-auto lg:top-[7px] lg:h-px lg:w-auto">
        <span className="absolute inset-0 bg-current opacity-20" />
        <span data-grow="y" className="absolute inset-0 origin-top bg-gold lg:hidden" />
        <span data-grow="x" className="absolute -top-px left-0 hidden h-[3px] w-full origin-left bg-gold lg:block" />
      </div>
      <ol
        aria-label={label}
        style={{ "--stops": stops.length } as CSSProperties}
        className="relative grid gap-12 lg:grid-cols-[repeat(var(--stops),minmax(0,1fr))] lg:gap-6"
      >
        {stops.map((stop, index) => (
          <li key={`${stop.mark}-${stop.title}`} data-fade data-delay={index * 0.06} className="relative pl-9 lg:pl-0 lg:pt-12">
            <span aria-hidden className="absolute left-0 top-1.5 size-[11px] rounded-full border-2 border-gold bg-reserve lg:top-[2px]" />
            <p className="flex items-baseline gap-2">
              <span className="font-ui text-h2 font-extralight leading-none tabular-nums">{stop.mark}</span>
              {stop.detail ? <span className="type-meta opacity-85">{stop.detail}</span> : null}
            </p>
            <h3 className="mt-4 font-display text-h3 leading-snug">{stop.title}</h3>
            <div className="type-body mt-2 text-[0.9375rem]">{stop.body}</div>
            {stop.meta ? <p className="type-meta mt-3 text-gold">{stop.meta}</p> : null}
            {stop.link ? (
              <Link href={stop.link.href} className="group mt-4 inline-flex items-center gap-3 font-ui text-[15px] font-semibold">
                <span className="border-b border-gold pb-1">{stop.link.label}</span>
                <ArrowRight width={16} height={16} className="text-gold transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </Link>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
