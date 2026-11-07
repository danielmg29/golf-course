import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/** The homepage's eight chapters, from "01 — The invitation" to "08 — The day continues". */
export const CHAPTERS = 8;

export type Tone = "forest" | "ivory" | "paper" | "club";

// Dark scenes alternate with calm editorial ones, as the blueprint's pacing asks.
const tones: Record<Tone, string> = {
  forest: "bg-forest text-paper",
  ivory: "bg-ivory text-coal",
  paper: "bg-paper text-coal",
  club: "bg-club text-paper",
};

/** Square, solid: the one primary action in a chapter. Antique gold on dark, forest on light. */
export const primaryButton =
  "inline-flex h-12 items-center justify-center gap-3 px-6 font-ui text-[15px] font-semibold transition-colors duration-200 ease-out";
export const onDark = "bg-antique text-forest hover:bg-[#c9a86c]";
export const onLight = "bg-forest text-paper hover:bg-club";

/** A text link underlined with the fairway line; its arrow steps forward on hover. */
export function LineLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-3 font-ui text-[15px] font-semibold", className)}>
      <span className="border-b border-antique pb-1">{children}</span>
      <ArrowRight width={16} height={16} className="text-antique transition-transform duration-200 ease-out group-hover:translate-x-1" />
    </Link>
  );
}

/** The fairway line as a rule: a hairline, gold for the story so far (one eighth per chapter). */
export function Rule({ number, className }: { number: number; className?: string }) {
  return (
    <div aria-hidden className={cn("relative h-px", className)}>
      <span className="absolute inset-0 bg-current opacity-20" />
      <span
        data-rule
        className="absolute -top-px left-0 h-[3px] origin-left bg-antique"
        style={{ width: `${(number / CHAPTERS) * 100}%` }}
      />
    </div>
  );
}

function IndexLabel({ number, name }: { number: number; name: string }) {
  return (
    <>
      {String(number).padStart(2, "0")}
      <span aria-hidden> — </span>
      <span className="sr-only">: </span>
      {name}
    </>
  );
}

/**
 * The chapter index and its rule, which draws in as the chapter arrives. On desktop the rule
 * spans the grid and the index takes the first two columns, beside the heading; on smaller
 * screens the index sits on the rule itself rather than stacked over the heading.
 */
export function ChapterIndex({ number, name }: { number: number; name: string }) {
  return (
    <>
      <div className="col-span-full flex items-center gap-4 lg:hidden">
        <p data-running-head={`${String(number).padStart(2, "0")} / ${String(CHAPTERS).padStart(2, "0")}`} className="type-meta shrink-0">
          <IndexLabel number={number} name={name} />
        </p>
        <Rule number={number} className="flex-1" />
      </div>
      <Rule number={number} className="col-span-full hidden lg:block" />
      <p data-running-head={`${String(number).padStart(2, "0")} / ${String(CHAPTERS).padStart(2, "0")}`} className="type-meta col-span-2 mt-5 hidden lg:block">
        <IndexLabel number={number} name={name} />
      </p>
    </>
  );
}

/**
 * One chapter on the Swiss grid. Its children are grid items: place them with the column
 * classes (headings usually start at column 3 on desktop, beside the index).
 */
export function Chapter({
  id,
  number,
  name,
  tone,
  labelledBy,
  className,
  after,
  children,
}: {
  id: string;
  number: number;
  name: string;
  tone: Tone;
  labelledBy: string;
  className?: string;
  /** Full-bleed content after the grid, such as a strip that runs to the screen's edge. */
  after?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      // Tells the header and floating buttons which ground they are over (HomeMotion).
      data-tone={tone === "ivory" || tone === "paper" ? "light" : "dark"}
      // Phones get extra room at the top so the index and rule clear the header when it slides back.
      className={cn(tones[tone], "pb-16 pt-28 md:py-28 lg:py-32", className)}
    >
      <div className="frame">
        <div className="grid-swiss">
          <ChapterIndex number={number} name={name} />
          {children}
        </div>
      </div>
      {after}
    </section>
  );
}

/** A chapter heading set flush left beside the index. */
export function ChapterTitle({ id, children, size = "lg" }: { id: string; children: ReactNode; size?: "lg" | "h1" }) {
  return (
    <h2
      id={id}
      className={cn(
        "col-span-full mt-8 font-display font-light lg:col-span-8 lg:col-start-3 lg:mt-5",
        size === "lg" ? "text-display-lg" : "text-h1",
      )}
    >
      {children}
    </h2>
  );
}
