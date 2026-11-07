"use client";

import { useState } from "react";
import { Check } from "@/components/ui/icons";
import { MpesaCheckout } from "@/components/ui/MpesaCheckout";
import { DemoNote, ProgressLine, Stepper } from "@/components/ui/primitives";
import { type Day, kes, nextDays, sampleNoise, useToday } from "@/lib/dates";
import { button, choice } from "@/lib/variants";
import { cn } from "@/lib/utils";

const rates = {
  visitor: { label: "Visitor", peak: 6500, offPeak: 4200 },
  reciprocal: { label: "Reciprocal member", peak: 4500, offPeak: 3000 },
};
type Rate = keyof typeof rates;

type Slot = { time: string; open: number; isPeak: boolean };

const FIRST_TEE_MINUTES = 6 * 60 + 30;
const LAST_TEE_MINUTES = 16 * 60;
const INTERVAL_MINUTES = 15;
const ROUND_MINUTES = 4 * 60 + 30;

function slotsFor(day: Day): Slot[] {
  const slots: Slot[] = [];
  for (let minutes = FIRST_TEE_MINUTES; minutes <= LAST_TEE_MINUTES; minutes += INTERVAL_MINUTES) {
    const hours = Math.floor(minutes / 60);
    const time = `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
    slots.push({
      time,
      open: Math.floor(sampleNoise(`${day.key}-${time}`) * 5),
      isPeak: day.isWeekend || hours < 10,
    });
  }
  return slots;
}

/** A calendar file for the round. Times stay local to the club, without a time zone. */
export function calendarLink(day: Day, time: string) {
  const date = day.key.replaceAll("-", "");
  const [hours, minutes] = time.split(":").map(Number);
  const finish = hours * 60 + minutes + ROUND_MINUTES;
  const finishClock = `${String(Math.floor(finish / 60)).padStart(2, "0")}${String(finish % 60).padStart(2, "0")}`;
  const event = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${date}T${time.replace(":", "")}00`,
    `DTEND:${date}T${finishClock}00`,
    "SUMMARY:Tee time",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(event)}`;
}

const BOOKING_STEPS = ["Day and players", "Tee time", "Pay with M-Pesa"];

/**
 * The sheet's shape while it learns the visitor's date (it only exists in the browser): the
 * progress line, the row of days and the grid of times, waiting, so the page never shows a gap.
 */
function TeeSheetSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
      <ProgressLine steps={BOOKING_STEPS} current={0} label="Your booking" className="lg:col-span-2" />
      <div className="min-w-0">
        <div aria-hidden className="flex gap-2 overflow-hidden">
          {Array.from({ length: 7 }, (_, index) => (
            <span key={index} className="h-[4.5rem] w-20 shrink-0 border border-alabaster/15" />
          ))}
        </div>
        <div aria-hidden className="mt-8 h-12 max-w-md border-b border-alabaster/15" />
        <div aria-hidden className="mt-10 grid grid-cols-3 gap-1.5 sm:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 20 }, (_, index) => (
            <span key={index} className="h-[5.25rem] border border-alabaster/15 motion-safe:animate-pulse" />
          ))}
        </div>
        <p role="status" className="mt-4 font-ui text-sm text-alabaster/80">
          Opening the tee sheet…
        </p>
      </div>
      <aside className="self-start bg-charcoal p-6 ring-1 ring-gold/25 md:p-8">
        <p className="type-label text-gold">Your round</p>
        <p className="mt-3 font-display text-h3">Choose a time to see your total.</p>
      </aside>
    </div>
  );
}

/** The roadmap's tee time engine and M-Pesa checkout, working from sample availability. */
export function TeeSheet() {
  const today = useToday();
  const [dayIndex, setDayIndex] = useState(0);
  const [players, setPlayers] = useState(2);
  const [rate, setRate] = useState<Rate>("visitor");
  const [time, setTime] = useState<string | null>(null);

  if (!today) return <TeeSheetSkeleton />;

  // Starts tomorrow, so the sample sheet never offers a time that has already gone.
  const days = nextDays(today, 8).slice(1);
  const day = days[dayIndex];
  const slots = slotsFor(day);
  const slot = slots.find((candidate) => candidate.time === time);
  const pricePerPlayer = slot ? (slot.isPeak ? rates[rate].peak : rates[rate].offPeak) : 0;
  const total = pricePerPlayer * players;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
      {/* The fairway line as the booking's progress. No cinematic delay: it moves as you choose. */}
      <ProgressLine
        steps={BOOKING_STEPS}
        current={slot ? 2 : 1}
        label="Your booking"
        className="lg:col-span-2"
      />
      <div className="min-w-0">
        <div role="group" aria-label="Day" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:px-0">
          {days.map((candidate, index) => (
            <button
              key={candidate.key}
              type="button"
              aria-pressed={index === dayIndex}
              onClick={() => {
                setDayIndex(index);
                setTime(null);
              }}
              className={cn(choice({ selected: index === dayIndex }), "w-20 shrink-0 border py-3 text-center")}
            >
              <span className="type-label block">{candidate.weekday}</span>
              <span className="mt-0.5 block font-ui text-lg font-light leading-tight tabular-nums">{candidate.date}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Stepper label="Players" value={players} min={1} max={4} onChange={(value) => { setPlayers(value); setTime(null); }} />
          <div role="group" aria-label="Rate" className="flex gap-2">
            {(Object.keys(rates) as Rate[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={rate === key}
                onClick={() => setRate(key)}
                className={cn(choice({ selected: rate === key }), "type-label flex-1 border px-3 py-3")}
              >
                {rates[key].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-1.5 sm:grid-cols-4 xl:grid-cols-5">
          {slots.map((candidate) => {
            const full = candidate.open < players;
            const price = candidate.isPeak ? rates[rate].peak : rates[rate].offPeak;
            return (
              <button
                key={candidate.time}
                type="button"
                disabled={full}
                aria-pressed={candidate.time === time}
                onClick={() => setTime(candidate.time)}
                className={cn(choice({ selected: candidate.time === time }), "border p-3 text-left")}
              >
                <span className="block font-ui text-xl font-light leading-none tabular-nums">{candidate.time}</span>
                <span className={cn("mt-1.5 block text-xs", candidate.time === time ? "text-reserve/85" : "text-alabaster/75")}>
                  {full ? "Full" : `${candidate.open} open`}
                </span>
                <span className={cn("mt-0.5 block text-xs tabular-nums", candidate.time === time ? "text-reserve/85" : candidate.isPeak ? "text-gold" : "text-alabaster/75")}>
                  {price.toLocaleString("en-GB")}
                </span>
              </button>
            );
          })}
        </div>
        <DemoNote className="mt-4">
          Prices are KES per player. Gold marks peak times: before 10:00 and at weekends. Sample availability and prices.
        </DemoNote>
      </div>

      <aside className="self-start bg-charcoal p-6 ring-1 ring-gold/25 md:p-8 lg:sticky lg:top-24">
        <p className="type-label text-gold">Your round</p>
        {slot ? (
          <>
            <p className="mt-3 font-ui text-h1 font-extralight leading-none tabular-nums">{slot.time}</p>
            <p className="mt-2 text-alabaster/70">
              {day.weekday} {day.date}, {players} {players === 1 ? "player" : "players"}, {rates[rate].label.toLowerCase()} rate
            </p>
            <p className="mt-6 flex items-baseline justify-between border-t border-gold/25 pt-4">
              <span className="type-label text-alabaster/70">Total</span>
              <span className="font-ui text-h3 font-light tabular-nums">{kes(total)}</span>
            </p>
            <div className="mt-6">
              <MpesaCheckout key={`${day.key}-${slot.time}-${players}-${rate}`} amount={kes(total)} reference={`${day.key}${slot.time}${players}`}>
                {(receipt) => (
                  <div role="status">
                    <p className="flex items-center gap-3 font-display text-2xl">
                      <Check className="text-gold" /> You&apos;re on the tee sheet
                    </p>
                    <p className="mt-2 text-sm text-alabaster/70">Receipt {receipt}. The live version emails this with a calendar invite.</p>
                    <div className="mt-5 flex flex-col gap-2">
                      <a href={calendarLink(day, slot.time)} download="tee-time.ics" className={button({ tone: "outline", size: "sm" })}>
                        Add to calendar
                      </a>
                      <button type="button" onClick={() => setTime(null)} className={button({ tone: "outline", size: "sm" })}>
                        Book another
                      </button>
                    </div>
                  </div>
                )}
              </MpesaCheckout>
            </div>
          </>
        ) : (
          <p className="type-display mt-3 text-3xl leading-tight">Choose a time to see your total.</p>
        )}
      </aside>
    </div>
  );
}
