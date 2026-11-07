"use client";

import { useState } from "react";
import { MpesaCheckout } from "@/components/ui/MpesaCheckout";
import { DemoNote, Stepper } from "@/components/ui/primitives";
import { kes, nextDays, sampleNoise, useToday } from "@/lib/dates";
import { choice } from "@/lib/variants";
import { cn } from "@/lib/utils";

const passes = [
  { id: "pool", label: "Pool", note: "Loungers and towels included", price: 1500 },
  { id: "gym", label: "Gym", note: "Open 05:30 to 21:00", price: 1000 },
  { id: "tennis", label: "Tennis", note: "One court for an hour", price: 1200 },
  { id: "all", label: "All three", note: "The whole day, one pass", price: 3000 },
];

const QR_SIZE = 25;

/**
 * Looks like the QR code the live version would generate, but it's patterned from the
 * receipt and doesn't scan. A real one comes with the e-ticket service.
 */
function SampleCode({ seed }: { seed: string }) {
  const inFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= QR_SIZE - 7 && y < 7) || (x < 7 && y >= QR_SIZE - 7);

  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < QR_SIZE; y += 1) {
    for (let x = 0; x < QR_SIZE; x += 1) {
      if (!inFinder(x, y) && sampleNoise(`${seed}-${x}-${y}`) > 0.52) cells.push({ x, y });
    }
  }

  return (
    <svg viewBox={`-2 -2 ${QR_SIZE + 4} ${QR_SIZE + 4}`} role="img" aria-label="Sample pass code" className="size-44 bg-alabaster">
      {[[0, 0], [QR_SIZE - 7, 0], [0, QR_SIZE - 7]].map(([x, y]) => (
        <g key={`${x}-${y}`} fill="#061f14">
          <path fillRule="evenodd" d={`M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5z`} />
          <rect x={x + 2} y={y + 2} width="3" height="3" />
        </g>
      ))}
      {cells.map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill="#061f14" />
      ))}
    </svg>
  );
}

/** The roadmap's guest day pass: choose, pay with M-Pesa, get a code for the gate. */
export function DayPass() {
  const today = useToday();
  const [passId, setPassId] = useState("pool");
  const [guests, setGuests] = useState(1);
  const [dayIndex, setDayIndex] = useState(0);

  const pass = passes.find((candidate) => candidate.id === passId) ?? passes[0];
  const total = pass.price * guests;
  const days = today ? nextDays(today, 5) : [];
  const day = days[dayIndex];

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
      <div>
        <div role="group" aria-label="Pass" className="grid gap-1.5 sm:grid-cols-2">
          {passes.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              aria-pressed={candidate.id === passId}
              onClick={() => setPassId(candidate.id)}
              className={cn(choice({ selected: candidate.id === passId }), "border p-5 text-left")}
            >
              <span className="flex items-baseline justify-between gap-4">
                <span className="type-display text-3xl leading-none">{candidate.label}</span>
                <span className="text-sm">{kes(candidate.price)}</span>
              </span>
              <span className={cn("mt-2 block text-sm", candidate.id === passId ? "text-reserve/80" : "text-alabaster/60")}>
                {candidate.note}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 sm:items-center">
          <Stepper label="Guests" value={guests} min={1} max={6} onChange={setGuests} />
          <div role="group" aria-label="Day" className="flex flex-wrap gap-1.5 sm:justify-end">
            {days.map((candidate, index) => (
              <button
                key={candidate.key}
                type="button"
                aria-pressed={index === dayIndex}
                onClick={() => setDayIndex(index)}
                className={cn(choice({ selected: index === dayIndex }), "type-label rounded-full border px-3.5 py-2")}
              >
                {candidate.weekday}
              </button>
            ))}
          </div>
        </div>
      </div>

      <aside className="self-start bg-charcoal p-6 ring-1 ring-gold/25 md:p-8">
        <p className="type-label text-gold">Your pass</p>
        <p className="mt-4 flex items-baseline justify-between">
          <span className="type-display text-3xl">{pass.label}</span>
          <span className="type-display text-3xl">{kes(total)}</span>
        </p>
        <p className="mt-1 text-sm text-alabaster/60">
          {guests} {guests === 1 ? "guest" : "guests"}{day ? `, ${day.weekday} ${day.date}` : ""}
        </p>
        <div className="mt-6 border-t border-gold/25 pt-5">
          <MpesaCheckout key={`${passId}-${guests}-${dayIndex}`} amount={kes(total)} reference={`${passId}${guests}${day?.key ?? ""}`}>
            {(receipt) => (
              <div role="status" className="flex flex-col items-center text-center">
                <SampleCode seed={receipt} />
                <p className="type-display mt-4 text-2xl">Show this at the gate</p>
                <p className="mt-1 text-sm text-alabaster/60">{receipt}</p>
                <DemoNote className="mt-3">Sample pass. It won&apos;t scan and isn&apos;t valid at the gate.</DemoNote>
              </div>
            )}
          </MpesaCheckout>
        </div>
      </aside>
    </div>
  );
}
