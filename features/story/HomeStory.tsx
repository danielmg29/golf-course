import Link from "next/link";
import { Suspense } from "react";
import { ArrowDown, ArrowUpRight } from "@/components/ui/icons";
import { Photo } from "@/components/ui/primitives";
import { WorldAct } from "@/components/world/WorldAct";
import { CourseFigures } from "@/features/hole/CourseFigures";
import { Story } from "@/features/story/Story";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { button } from "@/lib/variants";

// Each act is an ordinary full-height section, or, where the story scrubs, a layer of the
// sticky stage. Acts after the first wait invisible until the timeline brings them in.
const act = "relative isolate flex min-h-svh flex-col px-5 md:px-12 layered:absolute layered:inset-0 layered:min-h-0";
const waiting = "layered:pointer-events-none layered:opacity-0";

const plates = [
  { href: "/amenities#bays", label: "Simulator bays", title: "Floodlit bays, by the hour", side: "above", grow: "md:flex-[7]" },
  { href: "/book", label: "Tee sheet", title: "Tomorrow's tee times", side: "above", grow: "md:flex-[5]" },
  { href: "/events", label: "Corporate golf day", title: "Host a client day", side: "below", grow: "md:flex-[5]" },
  { href: "/stay-and-play", label: "Stay & play", title: "Nights and rounds together", side: "below", grow: "md:flex-[4]" },
  { href: "/amenities#day-pass", label: "Day pass", title: "Pool, gym and tennis", side: "below", grow: "md:flex-[3]" },
] as const;

function Plate({ plate }: { plate: (typeof plates)[number] }) {
  return (
    <Link
      href={plate.href}
      data-plate
      data-side={plate.side}
      className={cn(
        "group flex min-h-44 flex-col justify-between bg-charcoal p-6 text-left ring-1 ring-gold/25 transition-[box-shadow] duration-500 ease-fluid hover:ring-gold/60 md:min-h-[24svh] md:flex-1 md:p-7",
        plate.grow,
        // On a phone the plates take turns in one spot above the axis.
        "max-md:layered:absolute max-md:layered:inset-x-0 max-md:layered:bottom-[calc(50%+0.75rem)]",
      )}
    >
      <span className="type-label text-gold">{plate.label}</span>
      <span className="mt-8 flex items-end justify-between gap-6">
        <span className="type-display text-title">{plate.title}</span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold transition-transform duration-500 ease-fluid group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          <ArrowUpRight />
        </span>
      </span>
    </Link>
  );
}

/**
 * "The architecture of the next move": the homepage's four acts. The owner approved this
 * wording on 2026-11-06; check with them before changing it.
 */
export function HomeStory() {
  return (
    <WorldAct id="story">
      <Story>
        {/* Act I · the lie. Visible from the first paint: it's what a slow phone shows first. */}
        <section data-act="lie" aria-labelledby="story-lie" className={cn(act, "items-center justify-center pb-28 pt-32 text-center")}>
          {/* The poster: shown until the world draws its first frame, and all that shows on the
              poster tier (data saver, low-memory phones). */}
          <div data-world-poster className="absolute inset-0 -z-10">
            <div data-zoom className="absolute inset-0 -z-20">
              <Photo name="sunriseGreen" sizes="100vw" preload position="50% 35%" />
            </div>
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgb(6_31_20/0.42)_0%,rgb(6_31_20/0.6)_42%,#061f14_88%)]"
            />
          </div>
          <h1 id="story-lie" data-part className="type-display max-w-[17ch] text-[clamp(3.25rem,7.4vw,7.5rem)] font-light leading-[0.98]">
            The architecture of the <em>next move</em>
          </h1>
          <p data-part className="type-body mt-8 max-w-[38ch] text-alabaster/90">
            Every good shot starts with reading the ground. So does every decision worth making.
          </p>
          <div data-part className="mt-9 flex flex-col items-center gap-5">
            <Link href="/membership#apply" className={button({ tone: "gold" })}>
              Apply for membership
            </Link>
            <p className="type-label text-alabaster/60">
              {site.fullName} · {site.place}
            </p>
          </div>
          <a
            href="#about"
            className="type-label group absolute bottom-4 left-4 flex items-center gap-3 text-alabaster/80 md:bottom-7 md:left-7"
          >
            <span className={button({ tone: "glass", size: "icon" })}>
              <ArrowDown />
            </span>
            Skip the story
          </a>
        </section>

        {/* Act II · read the ground */}
        <section
          data-act="ground"
          aria-labelledby="story-ground"
          className={cn(act, waiting, "justify-end pb-24 md:justify-center md:pb-0")}
        >
          {/* Keeps the copy readable over the line work. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#061f14_30%,transparent_75%)] md:bg-[linear-gradient(to_right,#061f14_18%,transparent_62%)]"
          />
          <div className="mx-auto w-full max-w-[1320px]">
            <h2 id="story-ground" data-part className="type-display text-section">
              Read the <em>ground</em>
            </h2>
            <p data-part className="type-body mt-6 max-w-[36ch]">
              Slope, grain, wind and water. Eighteen holes that reward the player who looks before they swing.
            </p>
            <div data-part className="mt-10 max-w-md">
              <Suspense fallback={<div className="h-20" />}>
                <CourseFigures />
              </Suspense>
            </div>
            <div data-part className="mt-10 flex">
              <Link href="/course" className="type-label border-b border-gold/50 pb-1 transition-colors duration-500 ease-fluid hover:border-gold">
                Fly the full course
              </Link>
            </div>
          </div>
        </section>

        {/* Act III · choose the club */}
        <section
          data-act="club"
          aria-labelledby="story-club"
          className={cn(act, waiting, "justify-center py-24 layered:py-0")}
        >
          <h2
            id="story-club"
            data-part
            className="type-display text-section layered:absolute layered:left-5 layered:top-24 md:layered:left-12 md:layered:top-28"
          >
            Choose your <em>club</em>
          </h2>
          {/* The axis, drawn by the world once it's live. */}
          <div data-world-poster aria-hidden className="absolute inset-x-0 top-1/2 hidden h-px bg-gold/60 layered:block" />
          <div className="mt-12 flex w-full flex-col gap-3 layered:absolute layered:inset-x-5 layered:inset-y-0 layered:mt-0 layered:w-auto md:layered:inset-x-12 md:layered:grid md:layered:grid-rows-2 md:layered:gap-0">
            <div className="flex flex-col gap-3 md:flex-row max-md:layered:contents md:layered:items-end md:layered:pb-3">
              {plates.filter((plate) => plate.side === "above").map((plate) => (
                <Plate key={plate.href} plate={plate} />
              ))}
            </div>
            <div className="flex flex-col gap-3 md:flex-row max-md:layered:contents md:layered:items-start md:layered:pt-3">
              {plates.filter((plate) => plate.side === "below").map((plate) => (
                <Plate key={plate.href} plate={plate} />
              ))}
            </div>
          </div>
        </section>

        {/* Act IV · hole out: the ring is the rim of the cup the ball finishes in. */}
        <section data-act="hole" aria-labelledby="story-hole" className={cn(act, waiting, "items-center justify-center")}>
          <div
            data-ring
            className="relative flex aspect-square w-[min(86vw,26rem)] flex-col items-center justify-center rounded-full px-10 text-center"
          >
            <span data-world-poster aria-hidden className="absolute inset-0 rounded-full ring-1 ring-gold/60" />
            <h2 id="story-hole" data-part className="type-display text-[clamp(2.5rem,5vw,3.5rem)] leading-none">
              Make your <em>move</em>
            </h2>
            <p data-part className="mt-4 max-w-[24ch] text-sm leading-relaxed text-alabaster/75">
              Pick a tee time and pay with M-Pesa.
            </p>
            <Link data-part href="/book" className={cn(button({ tone: "gold" }), "mt-6")}>
              Book a tee time
            </Link>
            <Link
              data-part
              href="/membership#apply"
              className="type-label mt-5 border-b border-alabaster/25 pb-0.5 text-alabaster/70 transition-colors duration-500 ease-fluid hover:border-gold hover:text-alabaster"
            >
              Or apply for membership
            </Link>
          </div>
        </section>
      </Story>
    </WorldAct>
  );
}
