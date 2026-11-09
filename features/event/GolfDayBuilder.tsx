"use client";

import { useState } from "react";
import { DemoNote, Stepper } from "@/components/ui/primitives";
import {
  buffetOptions,
  clinicOptions,
  type GolfDay,
  quoteGolfDay,
  roomOptions,
} from "@/features/event/data";
import { kes } from "@/lib/dates";
import { whatsappLink } from "@/lib/site";
import { button, choice } from "@/lib/variants";
import { cn } from "@/lib/utils";

const steps = ["Players", "Room", "Food", "Clinic", "Your quote"];

function Options<Id extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: readonly { id: Id; label: string; note: string }[];
  value: Id;
  onChange: (id: Id) => void;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid gap-1.5">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          role="radio"
          aria-checked={option.id === value}
          onClick={() => onChange(option.id)}
          className={cn(choice({ selected: option.id === value }), "border p-5 text-left")}
        >
          <span className="type-display block text-2xl leading-tight">{option.label}</span>
          <span className={cn("mt-1 block text-sm", option.id === value ? "text-reserve/80" : "text-alabaster/60")}>
            {option.note}
          </span>
        </button>
      ))}
    </div>
  );
}

/** The roadmap's corporate event builder: five steps and a running price, so HR can budget on the spot. */
export function GolfDayBuilder() {
  const [step, setStep] = useState(0);
  const [day, setDay] = useState<GolfDay>({ players: 24, room: "none", buffet: "nyama", clinic: "none" });
  const quote = quoteGolfDay(day);
  const isLast = step === steps.length - 1;

  const message = [
    "Hello, we'd like to plan a company golf day.",
    ...quote.lines.map((line) => `${line.label}: ${kes(line.amount)}`),
    `Estimate: ${kes(quote.total)}`,
  ].join("\n");

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
      <div>
        <ol className="flex gap-1.5">
          {steps.map((label, index) => (
            <li key={label} className="min-w-0 flex-1">
              <button
                type="button"
                aria-current={index === step ? "step" : undefined}
                onClick={() => setStep(index)}
                className="group w-full text-left"
              >
                <span className={cn("block h-px transition-colors duration-500 ease-fluid", index <= step ? "bg-gold" : "bg-alabaster/20")} />
                <span className={cn("type-label mt-2 hidden truncate transition-colors duration-500 sm:block", index === step ? "text-gold" : "text-alabaster/50 group-hover:text-alabaster")}>
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="mt-10 min-h-[22rem]">
          <p className="type-label text-alabaster/60 sm:hidden">Step {step + 1} of {steps.length}</p>
          {step === 0 ? (
            <>
              <h3 className="type-display text-title">How many players?</h3>
              <div className="mt-8 max-w-md">
                <Stepper label="Players" value={day.players} min={8} max={144} step={4} onChange={(players) => setDay({ ...day, players })} />
              </div>
              <p className="type-body mt-6 max-w-[46ch]">
                Up to 72 can play a shotgun start. Above that, we split the day into morning and afternoon fields.
              </p>
            </>
          ) : null}
          {step === 1 ? (
            <>
              <h3 className="type-display mb-6 text-title">Add a conference room?</h3>
              <Options name="Conference room" options={roomOptions} value={day.room} onChange={(room) => setDay({ ...day, room })} />
            </>
          ) : null}
          {step === 2 ? (
            <>
              <h3 className="type-display mb-6 text-title">What will you eat?</h3>
              <Options name="Catering" options={buffetOptions} value={day.buffet} onChange={(buffet) => setDay({ ...day, buffet })} />
            </>
          ) : null}
          {step === 3 ? (
            <>
              <h3 className="type-display mb-6 text-title">Finish with a clinic?</h3>
              <Options name="Evening clinic" options={clinicOptions} value={day.clinic} onChange={(clinic) => setDay({ ...day, clinic })} />
            </>
          ) : null}
          {step === 4 ? (
            <>
              <h3 className="type-display text-title">Your golf day, priced</h3>
              <p className="type-body mt-4 max-w-[46ch]">
                Send this to our events desk on WhatsApp and we&apos;ll come back with dates. In the live version, this
                step also emails a PDF quote to your company address.
              </p>
              <a
                href={whatsappLink(message)}
                target="_blank"
                rel="noreferrer"
                className={cn(button({ tone: "gold" }), "mt-8")}
              >
                Send to the events desk
              </a>
            </>
          ) : null}
        </div>

        <div className="mt-8 flex justify-between gap-3">
          <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)} className={button({ tone: "outline", size: "sm" })}>
            Back
          </button>
          {!isLast ? (
            <button type="button" onClick={() => setStep(step + 1)} className={button({ tone: "gold", size: "sm" })}>
              Next: {steps[step + 1]}
            </button>
          ) : null}
        </div>
      </div>

      <aside className="self-start bg-charcoal p-6 ring-1 ring-gold/25 md:p-8 lg:sticky lg:top-24" aria-live="polite">
        <p className="type-label text-gold">Your estimate</p>
        <ul className="mt-5 space-y-3">
          {quote.lines.map((line) => (
            <li key={line.label} className="flex items-baseline justify-between gap-4 text-sm">
              <span className="text-alabaster/70">{line.label}</span>
              <span className="shrink-0 tabular-nums">{line.amount.toLocaleString("en-GB")}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-gold/25 pt-4">
          <span className="type-display block text-[2.5rem] leading-none">{kes(quote.total)}</span>
          <span className="mt-2 block text-sm text-alabaster/60">About {kes(quote.perPlayer)} a player</span>
        </p>
        <DemoNote className="mt-4">Sample prices, before VAT.</DemoNote>
      </aside>
    </div>
  );
}
