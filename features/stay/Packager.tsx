"use client";

import { useState } from "react";
import { DemoNote, Stepper } from "@/components/ui/primitives";
import { usd } from "@/lib/dates";
import { whatsappLink } from "@/lib/site";
import { button, choice } from "@/lib/variants";
import { cn } from "@/lib/utils";

// Sample prices, per person, in US dollars because this is aimed at overseas visitors.
const ROUND = 65;
const TRANSFER = 45;

const rooms = [
  { id: "club", label: "Club rooms", note: "On the course, a walk from the first tee", perNight: 140 },
  { id: "lodge", label: "Partner lodge", note: "Ten minutes away, with a pool and spa", perNight: 260 },
];

const safaris = [
  { id: "none", label: "No safari", note: "Golf is plenty", price: 0 },
  { id: "park", label: "Nairobi National Park", note: "A half day, back for lunch", price: 120 },
  { id: "mara", label: "Maasai Mara", note: "Two nights, flying from Wilson Airport", price: 950 },
];

export function quoteStay({
  rounds,
  nights,
  roomRate,
  transfer,
  safari,
}: {
  rounds: number;
  nights: number;
  roomRate: number;
  transfer: boolean;
  safari: number;
}) {
  return rounds * ROUND + nights * roomRate + (transfer ? TRANSFER : 0) + safari;
}

/** The roadmap's Stay & Play packager: rounds, rooms, transfers and a safari in one price. */
export function Packager() {
  const [rounds, setRounds] = useState(3);
  const [nights, setNights] = useState(4);
  const [roomId, setRoomId] = useState("club");
  const [safariId, setSafariId] = useState("park");
  const [transfer, setTransfer] = useState(true);

  const room = rooms.find((option) => option.id === roomId) ?? rooms[0];
  const safari = safaris.find((option) => option.id === safariId) ?? safaris[0];
  const total = quoteStay({ rounds, nights, roomRate: room.perNight, transfer, safari: safari.price });

  const lines = [
    { label: `${rounds} ${rounds === 1 ? "round" : "rounds"} of golf`, amount: rounds * ROUND },
    { label: `${nights} ${nights === 1 ? "night" : "nights"}, ${room.label.toLowerCase()}`, amount: nights * room.perNight },
    ...(transfer ? [{ label: "Airport transfers", amount: TRANSFER }] : []),
    ...(safari.price > 0 ? [{ label: safari.label, amount: safari.price }] : []),
  ];

  const message = [
    "Hello, I'd like to plan a Stay & Play trip.",
    ...lines.map((line) => `${line.label}: ${usd(line.amount)}`),
    `Estimate per person: ${usd(total)}`,
  ].join("\n");

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
      <div className="space-y-10">
        <div className="space-y-5">
          <Stepper label="Rounds" value={rounds} min={1} max={7} onChange={setRounds} />
          <Stepper label="Nights" value={nights} min={1} max={14} onChange={setNights} />
        </div>

        <div>
          <p className="type-label mb-3 text-alabaster/70">Where you sleep</p>
          <div role="radiogroup" aria-label="Room" className="grid gap-1.5 sm:grid-cols-2">
            {rooms.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={option.id === roomId}
                onClick={() => setRoomId(option.id)}
                className={cn(choice({ selected: option.id === roomId }), "border p-5 text-left")}
              >
                <span className="type-display block text-2xl leading-tight">{option.label}</span>
                <span className={cn("mt-1 block text-sm", option.id === roomId ? "text-reserve/80" : "text-alabaster/60")}>
                  {option.note}, {usd(option.perNight)} a night
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="type-label mb-3 text-alabaster/70">A day off the course</p>
          <div role="radiogroup" aria-label="Safari" className="grid gap-1.5 sm:grid-cols-3">
            {safaris.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={option.id === safariId}
                onClick={() => setSafariId(option.id)}
                className={cn(choice({ selected: option.id === safariId }), "border p-5 text-left")}
              >
                <span className="type-display block text-2xl leading-tight">{option.label}</span>
                <span className={cn("mt-1 block text-sm", option.id === safariId ? "text-reserve/80" : "text-alabaster/60")}>
                  {option.note}
                </span>
              </button>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={transfer} onChange={(event) => setTransfer(event.target.checked)} className="size-4 accent-gold" />
          <span>Airport transfers from Jomo Kenyatta International</span>
        </label>
      </div>

      <aside className="self-start bg-charcoal p-6 ring-1 ring-gold/25 md:p-8 lg:sticky lg:top-24" aria-live="polite">
        <p className="type-label text-gold">Your trip, per person</p>
        <ul className="mt-5 space-y-3">
          {lines.map((line) => (
            <li key={line.label} className="flex items-baseline justify-between gap-4 text-sm">
              <span className="text-alabaster/70">{line.label}</span>
              <span className="shrink-0 tabular-nums">{usd(line.amount)}</span>
            </li>
          ))}
        </ul>
        <p className="type-display mt-5 border-t border-gold/25 pt-4 text-[2.75rem] leading-none">{usd(total)}</p>
        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noreferrer"
          className={cn(button({ tone: "gold" }), "mt-6 w-full")}
        >
          Send to the travel desk
        </a>
        <DemoNote className="mt-3">Sample prices. Rooms and safaris would come live from partner lodges.</DemoNote>
      </aside>
    </div>
  );
}
