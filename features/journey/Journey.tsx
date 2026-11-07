import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight } from "@/components/ui/icons";
import { WorldAct } from "@/components/world/WorldAct";
import { members } from "@/features/member/data";
import { JourneyClient } from "@/features/journey/JourneyClient";
import { JourneyFigures } from "@/features/journey/JourneyFigures";
import { Folio, Plate, TippedPhoto } from "@/features/journey/Leather";
import { Ribbon } from "@/features/journey/Ribbon";
import type { PhotoName } from "@/lib/photos";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

// The sky from first light to dusk: the page's ground, running its whole length.
const sky = [
  "#0a1310 0%",
  "#12201a 7%",
  "#1d2e28 17%",
  "#283a32 28%",
  "#3e4c3c 42%",
  "#66603f 56%",
  "#a06f30 67%",
  "#c9862f 76%",
  "#a65a24 86%",
  "#62301a 94%",
  "#2a1610 100%",
].join(", ");

// Dawn mist: long, pale streaks of fractal noise that tile sideways.
const mist = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'%3E%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.0016 .0065' numOctaves='4' seed='7' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .8 0 0 0 0 .88 0 0 0 0 .84 0 0 0 1.5 -.62'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23m)'/%3E%3C/svg%3E")`;

const heading = "type-heritage text-[clamp(2.25rem,3.4vw,3.4rem)] leading-[1.02]";
const body = "mt-5 text-[15.5px] leading-relaxed text-ink";
const inkLink =
  "type-label group mt-8 inline-flex items-center gap-3 text-ink";
const goldButton =
  "brushed type-label inline-flex items-center justify-center rounded-full px-7 py-4 transition-[filter,transform] duration-300 ease-fluid hover:brightness-110 active:scale-[0.98]";

function InkLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className={inkLink}>
      <span className="border-b border-ink/40 pb-1 transition-colors duration-500 ease-fluid group-hover:border-ink">{children}</span>
      <span className="flex size-8 items-center justify-center rounded-full border border-ink/40 transition-transform duration-500 ease-fluid group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
        <ArrowUpRight width={14} height={14} />
      </span>
    </Link>
  );
}

function Chapter({
  id,
  time,
  name,
  children,
  className,
}: {
  id: string;
  time: string;
  name: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      data-chapter={id}
      data-time={time}
      data-name={name}
      aria-labelledby={`journey-${id}`}
      className={cn("flex min-h-[112svh] flex-col justify-center py-24", className)}
    >
      {children}
    </section>
  );
}

const fourBall = [members[4], members[1], members[2], members[5]];

const between: { photo: PhotoName; title: string; note: string; href: string }[] = [
  { photo: "bays", title: "Simulator bays", note: "Floodlit, by the hour", href: "/amenities#bays" },
  { photo: "poolDusk", title: "Pool, gym and tennis", note: "With a guest day pass", href: "/amenities#day-pass" },
  { photo: "terrace", title: "The terrace", note: "Lunch above the ninth", href: "/amenities" },
  { photo: "lodge", title: "Stay & play", note: "Rounds, rooms and a safari", href: "/stay-and-play" },
];

/**
 * The homepage: the Continuous Putt Journey. One putt, read in the club's green book from
 * first light to the cup, while the sky turns from misty dawn to amber dusk. The chapters
 * carry the story; the green beside them carries the ball. The copy is a draft awaiting
 * the owner's approval.
 */
export function Journey() {
  return (
    <WorldAct id="journey" layer="over">
      <div
        data-journey
        data-hero
        className="relative isolate overflow-clip"
        style={{ background: `linear-gradient(180deg, ${sky})` }}
      >
        {/* Weather: mist at dawn, a warm haze through the afternoon, a low sun at dusk. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[230svh] overflow-hidden [mask-image:linear-gradient(to_bottom,black_25%,transparent)]">
          <div
            className="absolute inset-y-0 left-0 w-[200%] opacity-60 motion-safe:animate-[mist-drift_140s_linear_infinite]"
            style={{ backgroundImage: mist, backgroundSize: "1600px 900px" }}
          />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[48%] -z-10 h-[30%] bg-[radial-gradient(70%_50%_at_30%_50%,rgb(220_170_90/0.16),transparent)]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-[10%] right-[-20%] -z-10 aspect-square w-[110vw] max-w-[1600px] bg-[radial-gradient(circle,rgb(255_222_160/0.9)_0,rgb(255_176_92/0.55)_6%,rgb(255_140_60/0.18)_22%,transparent_46%)]" />

        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[minmax(0,1fr)_3.75rem] gap-x-4 px-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)] md:gap-x-14 md:px-12 lg:gap-x-24">
          <div className="min-w-0">
            {/* 06:12 · First light */}
            <Chapter id="first-light" time="06:12" name="First light" className="min-h-svh pb-28 pt-32">
              <h1 id="journey-first-light" className="type-heritage max-w-[12ch] text-[clamp(3rem,6.2vw,6.75rem)] leading-[0.98] text-alabaster">
                Read the green. <span className="font-caslon italic">Then make your move.</span>
              </h1>
              <p className="type-body mt-8 max-w-[38ch] text-alabaster/85">
                Every good shot starts with reading the ground. So does every decision worth making.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
                <Link href="/membership#apply" className={goldButton}>
                  Apply for membership
                </Link>
                <Link
                  href="/book"
                  className="type-label border-b border-alabaster/40 pb-1 text-alabaster/85 transition-colors duration-500 ease-fluid hover:border-gold hover:text-alabaster"
                >
                  Book a tee time
                </Link>
              </div>
              <p className="type-figure mt-14 text-[11px] uppercase text-alabaster/55">
                {site.fullName} · {site.place}
              </p>
            </Chapter>

            {/* 07:40 · The read */}
            <Chapter id="the-read" time="07:40" name="The read">
              <Plate className="max-w-[36rem]">
                <h2 id="journey-the-read" className={heading}>
                  Eighteen holes, <span className="font-caslon italic">read before you play</span>
                </h2>
                <p className={body}>
                  Our 3D map takes you onto every tee and every green, with the line the pro would take on each.
                </p>
                <div className="mt-8">
                  <Suspense fallback={<div className="h-[78px]" />}>
                    <JourneyFigures />
                  </Suspense>
                </div>
                <TippedPhoto photo="aerialHills" caption="The course from above." sizes="(min-width: 768px) 36rem, 80vw" className="mt-8" />
                <InkLink href="/course">Fly the course</InkLink>
                <Folio time="07:40" page={2} />
              </Plate>
            </Chapter>

            {/* 09:30 · The four-ball */}
            <Chapter id="four-ball" time="09:30" name="The four-ball">
              <Plate className="max-w-[36rem]">
                <h2 id="journey-four-ball" className={heading}>
                  The four-ball <span className="font-caslon italic">is the meeting</span>
                </h2>
                <p className={body}>
                  Founders, bankers, engineers and surgeons share the same first tee. Members find a four in the directory and book the time together.
                </p>
                <div className="mt-8 rounded-[10px] border border-ink/25 bg-ink/[0.06] p-5">
                  <p className="flex items-baseline justify-between">
                    <span className="type-figure text-lg text-ink">07:10</span>
                    <span className="type-label text-[10px] text-ink/80">Tee one · Sample members</span>
                  </p>
                  <ul className="mt-4 divide-y divide-ink/15">
                    {fourBall.map((member) => (
                      <li key={member.name} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                        <span className="font-caslon text-[17px] text-ink">{member.name}</span>
                        <span className="text-xs text-ink/80 sm:text-right">
                          {member.title}, {member.company}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <TippedPhoto photo="longShadows" caption="Out early, as a four." sizes="(min-width: 768px) 36rem, 80vw" className="mt-8" />
                <InkLink href="/membership">Find a four</InkLink>
                <Folio time="09:30" page={3} />
              </Plate>
            </Chapter>

            {/* 13:15 · Between rounds */}
            <Chapter id="between-rounds" time="13:15" name="Between rounds">
              <Plate className="max-w-[40rem]">
                <h2 id="journey-between-rounds" className={heading}>
                  Between <span className="font-caslon italic">rounds</span>
                </h2>
                <p className={body}>
                  Lunch above the ninth, a swim, an hour in the floodlit bays. The club keeps the day going.
                </p>
                <ul className="mt-8 grid gap-5 sm:grid-cols-2">
                  {between.map((item) => (
                    <li key={item.title}>
                      <Link href={item.href} className="group block">
                        <TippedPhoto photo={item.photo} sizes="(min-width: 768px) 18rem, 80vw" />
                        <span className="mt-3 flex items-baseline justify-between gap-3">
                          <span className="font-caslon text-lg text-ink">{item.title}</span>
                          <ArrowUpRight width={14} height={14} className="shrink-0 text-ink/70 transition-transform duration-500 ease-fluid group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </span>
                        <span className="mt-0.5 block text-xs text-ink/80">{item.note}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Folio time="13:15" page={4} />
              </Plate>
            </Chapter>

            {/* 17:20 · Golden hour */}
            <Chapter id="golden-hour" time="17:20" name="Golden hour">
              <Plate className="max-w-[36rem]">
                <h2 id="journey-golden-hour" className={heading}>
                  Host the client <span className="font-caslon italic">at golden hour</span>
                </h2>
                <p className={body}>
                  Plan a corporate golf day in minutes: the format, the catering and the prizes, with a quote in shillings.
                </p>
                <TippedPhoto photo="toast" caption="The prize-giving, on the terrace." sizes="(min-width: 768px) 36rem, 80vw" className="mt-8" />
                <InkLink href="/events">Plan a golf day</InkLink>
                <Folio time="17:20" page={5} />
              </Plate>
            </Chapter>

            {/* 18:47 · The cup */}
            <Chapter id="the-cup" time="18:47" name="The cup" className="min-h-[100svh]">
              <Plate className="max-w-[36rem]">
                <h2 id="journey-the-cup" className={heading}>
                  The putt drops. <span className="font-caslon italic">Your move.</span>
                </h2>
                <p className={body}>Membership is by application, and the club reads every one.</p>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                  <Link href="/membership#apply" className={goldButton}>
                    Apply for membership
                  </Link>
                  <Link
                    href="/book"
                    className="type-label rounded-full border border-ink/40 px-6 py-3.5 text-ink transition-colors duration-500 ease-fluid hover:border-ink hover:bg-ink/5"
                  >
                    Book a tee time · M-Pesa
                  </Link>
                </div>
                <Folio time="18:47" page={6} />
              </Plate>
            </Chapter>
          </div>

          {/* The green, the full length of the journey. */}
          <div className="relative">
            <Ribbon>
              <JourneyClient />
            </Ribbon>
          </div>
        </div>
      </div>
    </WorldAct>
  );
}
