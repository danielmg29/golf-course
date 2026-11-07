import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Minus, Plus } from "@/components/ui/icons";
import { type PhotoName, photos } from "@/lib/photos";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type PhotoProps = {
  name: PhotoName;
  /** How wide the photo renders, such as "50vw", so phones don't load desktop files. */
  sizes: string;
  /** For the photo at the top of a page. */
  preload?: boolean;
  /** CSS object-position, for keeping the subject in frame when cropped. */
  position?: string;
  /** For photos beside text that already says what they show. */
  decorative?: boolean;
  className?: string;
};

export function Photo({ name, sizes, preload, position, decorative, className }: PhotoProps) {
  const photo = photos[name];
  return (
    <Image
      src={photo.src}
      alt={decorative ? "" : photo.alt}
      fill
      sizes={sizes}
      preload={preload}
      style={position ? { objectPosition: position } : undefined}
      className={cn("object-cover", className)}
    />
  );
}

/**
 * The fairway line across the top of a section: a hairline with a short gold stretch that draws
 * in as it arrives (Page's data-rule). It shows no label. Its `name` is read by the flagstick
 * rail (SiteHeader), which sets it along the page's progress, so the page never carries a
 * kicker over its headings.
 */
export function SectionRule({ name, className }: { name: string; className?: string }) {
  return (
    <span aria-hidden data-running-head={name} className={cn("relative block h-px", className)}>
      <span className="absolute inset-0 bg-current opacity-20" />
      <span data-rule className="absolute -top-px left-0 h-[3px] w-[18%] origin-left bg-gold" />
    </span>
  );
}

export type Tone = "forest" | "deep" | "ivory" | "paper";

const tones: Record<Tone, string> = {
  forest: "bg-reserve text-alabaster",
  deep: "bg-charcoal text-alabaster",
  ivory: "band-light",
  paper: "band-paper",
};

/** One band of an inner page, on the Swiss frame. Dark bands carry the tools; light ones the reading. */
export function Section({
  children,
  id,
  tone = "forest",
  className,
}: {
  children: ReactNode;
  id?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <section
      id={id}
      data-tone={tone === "ivory" || tone === "paper" ? "light" : "dark"}
      className={cn("py-24 md:py-32", tones[tone], className)}
    >
      <div className="frame">{children}</div>
    </section>
  );
}

/** A text link underlined with the fairway line; its arrow steps forward on hover. */
export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-3 font-ui text-[15px] font-semibold", className)}>
      <span className="border-b border-gold pb-1">{children}</span>
      <ArrowRight width={16} height={16} className="text-gold transition-transform duration-200 ease-out group-hover:translate-x-1" />
    </Link>
  );
}

/** Figures in a row on a hairline, in light tabular numerals. */
export function Figures({
  items,
  className,
}: {
  items: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <dl className={cn("grid grid-flow-col auto-cols-fr gap-4 border-t border-current/20", className)}>
      {items.map((item) => (
        <div key={item.label} className="pt-3">
          <dt className="type-meta opacity-80">{item.label}</dt>
          <dd className="mt-1 font-ui text-h3 font-light tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Says plainly that a tool on the page is a demonstration. */
export function DemoNote({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("font-ui text-xs leading-relaxed text-alabaster/75", className)}>{children}</p>;
}

export function Stepper({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}) {
  const control =
    "flex size-11 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors duration-300 ease-fluid hover:border-gold hover:bg-gold/10 disabled:opacity-30";
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="type-label text-alabaster/70">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Fewer: ${label}`}
          className={control}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - step))}
        >
          <Minus width={14} height={14} />
        </button>
        <output className="type-display min-w-12 text-center text-2xl">
          {format ? format(value) : value}
        </output>
        <button
          type="button"
          aria-label={`More: ${label}`}
          className={control}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + step))}
        >
          <Plus width={14} height={14} />
        </button>
      </div>
    </div>
  );
}

/**
 * The club's mark: the ball's ring over its name, stacked; or, `inline`, the name on one line
 * for a bar where the ring already sits elsewhere. Not a link; Crest is the one that goes home.
 */
export function Wordmark({ className, inline }: { className?: string; inline?: boolean }) {
  const [first, ...rest] = site.name.split(" ");
  if (inline) {
    return (
      <span className={cn("flex items-baseline gap-1.5 leading-none", className)}>
        <span className="type-display text-2xl italic">{first}</span>
        <span className="type-display text-2xl">{rest.join(" ")}</span>
        <span className="ml-1.5 font-ui text-[9px] font-semibold uppercase tracking-[0.28em] opacity-75">Golf club</span>
      </span>
    );
  }
  return (
    <span className={cn("flex flex-col items-center leading-none", className)}>
      <span aria-hidden className="mb-1 size-2.5 rounded-full border border-gold/80" />
      <span className="type-display text-xl italic leading-[0.9] md:text-2xl md:leading-[0.9]">{first}</span>
      <span className="type-display text-xl leading-[0.95] md:text-2xl md:leading-[0.95]">{rest.join(" ")}</span>
      <span className="mt-1 font-ui text-[7px] font-semibold uppercase tracking-[0.28em] opacity-75">Golf club</span>
    </span>
  );
}

export function Crest({ className, inline }: { className?: string; inline?: boolean }) {
  return (
    <Link href="/" aria-label={`${site.fullName}, home`} className={cn("flex", className)}>
      <Wordmark inline={inline} className="text-inherit" />
    </Link>
  );
}

/**
 * The fairway line as progress: the steps on a hairline, gold as far as the one you're on.
 * `current` is the step in hand (0-based); `complete` marks the last one done too.
 */
export function ProgressLine({
  steps,
  current,
  complete,
  label,
  className,
}: {
  steps: string[];
  current: number;
  complete?: boolean;
  label: string;
  className?: string;
}) {
  const reach = steps.length > 1 ? current / (steps.length - 1) : 1;
  return (
    <div className={cn("font-ui", className)}>
      <p className="sr-only" aria-live="polite">
        {label}: {complete ? "done" : `step ${current + 1} of ${steps.length}, ${steps[current]}`}
      </p>
      <div aria-hidden className="relative mx-[5px] h-px">
        <span className="absolute inset-0 bg-current opacity-20" />
        <span
          className="absolute -top-px left-0 h-[3px] bg-gold transition-[width] duration-500 ease-out"
          style={{ width: `${reach * 100}%` }}
        />
      </div>
      <ol aria-hidden className="-mt-[6px] flex justify-between gap-2">
        {steps.map((step, index) => {
          const done = index < current || (complete && index === current);
          return (
            <li key={step} className="flex min-w-0 flex-col items-start text-xs font-semibold last:items-end [&:not(:first-child):not(:last-child)]:items-center">
              <span
                className={cn(
                  "size-[11px] rounded-full border-2 transition-colors duration-300",
                  done ? "border-gold bg-gold" : index === current ? "border-gold bg-reserve" : "border-current/30 bg-reserve",
                )}
              />
              <span className={cn("mt-2 truncate", index <= current ? "opacity-100" : "opacity-70")}>{step}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
