"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "@/components/ui/icons";
import { Photo } from "@/components/ui/primitives";
import type { PhotoName } from "@/lib/photos";
import { cn } from "@/lib/utils";

export type ClubHour = { time: string; title: string; note: string; href: string; photo: PhotoName };

/** One day at the club, hour by hour. The homepage's "club in motion" strip reads it too. */
export const clubDay: ClubHour[] = [
  { time: "06:30", title: "First tee", note: "Book a slot and pay with M-Pesa", href: "/book", photo: "mistFlag" },
  { time: "10:00", title: "The pool", note: "A day pass for non-members", href: "/amenities#day-pass", photo: "pool" },
  { time: "12:30", title: "The terrace", note: "Lunch above the ninth", href: "/amenities", photo: "terrace" },
  { time: "14:00", title: "Company golf days", note: "Price one up in five steps", href: "/events#golf-days", photo: "banquet" },
  { time: "16:30", title: "Find a four", note: "Join a group with an open slot", href: "/membership#four-ball", photo: "longShadows" },
  { time: "18:30", title: "Last putt", note: "Sundowners and the scoreboard", href: "/events#leaderboard", photo: "silhouette" },
  { time: "20:00", title: "Floodlit bays", note: "Toptracer by the hour", href: "/amenities#bays", photo: "bays" },
];

/** The club's day as a list of hours. Pointing at one swaps the photograph beside it. */
export function DayAtTheClub() {
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
      <ol>
        {clubDay.map((hour, index) => (
          <li key={hour.time} data-fade className="border-b border-gold/20 first:border-t">
            <Link
              href={hour.href}
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              className="group grid grid-cols-[4.25rem_1fr_auto] items-center gap-4 py-5 md:grid-cols-[6rem_1fr_auto] md:py-6"
            >
              <span className={cn("type-label transition-colors duration-500", index === active ? "text-gold" : "text-alabaster/55")}>
                {hour.time}
              </span>
              <span>
                <span className="type-display block text-[clamp(1.625rem,2.8vw,2.5rem)] leading-tight transition-transform duration-700 ease-fluid group-hover:translate-x-2">
                  {hour.title}
                </span>
                <span className="mt-1 block text-sm text-alabaster/60">{hour.note}</span>
              </span>
              <ArrowRight className="text-gold opacity-40 transition-[opacity,transform] duration-500 ease-fluid group-hover:translate-x-1 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ol>

      <div data-clip className="relative hidden aspect-[4/5] overflow-hidden lg:sticky lg:top-24 lg:block lg:self-start">
        {clubDay.map((hour, index) => (
          <div
            key={hour.time}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-fluid",
              index === active ? "opacity-100" : "opacity-0",
            )}
          >
            <Photo name={hour.photo} sizes="40vw" decorative />
          </div>
        ))}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-reserve/85 to-transparent" />
        <p className="type-display absolute bottom-5 left-6 text-[clamp(3rem,6vw,6rem)] font-light leading-none">
          {clubDay[active].time}
        </p>
      </div>
    </div>
  );
}
