import type { ReactNode } from "react";
import { Photo } from "@/components/ui/primitives";
import type { PhotoName } from "@/lib/photos";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The top of every inner page, in the homepage's grammar: a full-bleed photograph under a
 * deep-green overlay, the page's name in the margin, the heading flush left across the grid, and
 * at the foot the fairway line, which starts here and runs on down the page.
 */
export function PageHero({
  pageName,
  title,
  intro,
  photo,
  position,
  compact,
  facts,
  children,
}: {
  /** The page's name: not shown here (the nav and the rail name the page), read by the rail. */
  pageName: string;
  title: ReactNode;
  intro: string;
  photo: PhotoName;
  position?: string;
  /** For pages whose tool should be close to the top, such as booking. */
  compact?: boolean;
  /** Short facts for the foot of the hero, beside the club's name. */
  facts?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section
      data-tone="dark"
      // The header already offers booking here; the floating buttons wait below the hero.
      data-floating="hide"
      className={cn(
        "relative isolate flex flex-col overflow-hidden bg-reserve text-alabaster",
        compact ? "min-h-[72svh]" : "min-h-svh",
      )}
    >
      <div data-zoom className="absolute inset-0 -z-20">
        <Photo name={photo} sizes="100vw" preload position={position} />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(16_47_37/0.55)_0%,rgb(16_47_37/0.62)_45%,rgb(16_47_37/0.96)_100%)]"
      />
      <div className="frame flex flex-1 flex-col justify-end pb-8 pt-36 md:pb-10">
        <div className="grid-swiss">
          <div className="col-span-full md:col-span-6 lg:col-span-9 lg:col-start-3">
            <h1 data-lines className="font-display text-display-xl font-light [text-wrap:balance] [&_em]:italic">
              {title}
            </h1>
            <p data-fade data-delay="0.3" className="mt-8 max-w-[40ch] font-ui text-lead text-alabaster/90">
              {intro}
            </p>
            {children ? (
              <div data-fade data-delay="0.45" className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                {children}
              </div>
            ) : null}
          </div>
        </div>

        {/* The fairway line begins, the club and the facts below it. */}
        <div className={compact ? "mt-12" : "mt-16 lg:mt-24"}>
          <span aria-hidden data-running-head={pageName} className="relative block h-px">
            <span className="absolute inset-0 bg-current opacity-20" />
            <span data-rule className="absolute -top-px left-0 h-[3px] w-[12%] origin-left bg-gold" />
          </span>
          <div className="grid-swiss type-meta mt-4 gap-y-2 opacity-90">
            <span className="col-span-2">{site.fullName}</span>
            <span className="col-span-2">{site.place}</span>
            {facts ? <span className="col-span-full md:col-span-6 lg:col-span-8 lg:text-right">{facts}</span> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
