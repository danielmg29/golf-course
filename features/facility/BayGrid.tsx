"use client";

import { useState } from "react";
import { Check } from "@/components/ui/icons";
import { DemoNote } from "@/components/ui/primitives";
import { kes, nextDays, sampleNoise, useToday } from "@/lib/dates";
import { button, choice } from "@/lib/variants";
import { cn } from "@/lib/utils";

const BAYS = [1, 2, 3, 4, 5, 6, 7, 8];
const HOURS = [16, 17, 18, 19, 20, 21, 22];
const BAY_PER_HOUR = 2500;

const catering = [
  { id: "wings", label: "Wings and fries", price: 1800 },
  { id: "choma", label: "Nyama choma platter", price: 3200 },
  { id: "drinks", label: "Bucket of six drinks", price: 2400 },
];

/**
 * The roadmap's bay booking grid. A taken cell can't be selected, which is how the live
 * version will stop two people booking the same bay at the same hour.
 */
export function BayGrid() {
  const today = useToday();
  const [dayIndex, setDayIndex] = useState(0);
  const [cells, setCells] = useState<string[]>([]);
  const [food, setFood] = useState<string[]>([]);
  const [reserved, setReserved] = useState(false);

  if (!today) return <div className="min-h-[30rem]" />;

  const days = nextDays(today, 5);
  const day = days[dayIndex];

  const toggle = <T,>(list: T[], item: T) =>
    list.includes(item) ? list.filter((entry) => entry !== item) : [...list, item];

  const foodTotal = catering
    .filter((item) => food.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);
  const total = cells.length * BAY_PER_HOUR + foodTotal;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
      <div className="min-w-0">
        <div role="group" aria-label="Day" className="flex flex-wrap gap-2">
          {days.map((candidate, index) => (
            <button
              key={candidate.key}
              type="button"
              aria-pressed={index === dayIndex}
              onClick={() => {
                setDayIndex(index);
                setCells([]);
                setReserved(false);
              }}
              className={cn(choice({ selected: index === dayIndex }), "type-label rounded-full border px-4 py-2.5")}
            >
              {candidate.weekday} {candidate.date}
            </button>
          ))}
        </div>

        <div className="-mx-5 mt-8 overflow-x-auto px-5 [scrollbar-width:thin] md:mx-0 md:px-0">
          <table className="w-full min-w-[34rem] border-separate border-spacing-1">
            <caption className="sr-only">Toptracer bays by hour. Pick the cells you want.</caption>
            <thead>
              <tr>
                <td />
                {HOURS.map((hour) => (
                  <th key={hour} scope="col" className="type-label pb-2 text-center font-medium text-alabaster/60">
                    {hour}:00
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BAYS.map((bay) => (
                <tr key={bay}>
                  <th scope="row" className="type-label whitespace-nowrap pr-3 text-left font-medium text-alabaster/60">
                    Bay {bay}
                  </th>
                  {HOURS.map((hour) => {
                    const id = `${bay}-${hour}`;
                    const taken = sampleNoise(`${day.key}-${id}`) > 0.68;
                    const picked = cells.includes(id);
                    return (
                      <td key={hour}>
                        <button
                          type="button"
                          disabled={taken}
                          aria-pressed={picked}
                          aria-label={`Bay ${bay} at ${hour}:00${taken ? ", taken" : ""}`}
                          onClick={() => {
                            setCells(toggle(cells, id));
                            setReserved(false);
                          }}
                          className={cn(
                            "flex h-10 w-full items-center justify-center border transition-colors duration-300 ease-fluid",
                            taken
                              ? "border-transparent bg-alabaster/12"
                              : picked
                                ? "border-gold bg-gold text-reserve"
                                : "border-alabaster/15 hover:border-gold",
                          )}
                        >
                          {picked ? <Check width={14} height={14} /> : null}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DemoNote className="mt-3">Shaded cells are taken. Sample availability and prices.</DemoNote>
      </div>

      <aside className="self-start bg-charcoal p-6 ring-1 ring-gold/25 md:p-8">
        <p className="type-label text-gold">Food to the bay</p>
        <ul className="mt-4 divide-y divide-gold/15">
          {catering.map((item) => (
            <li key={item.id}>
              <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={food.includes(item.id)}
                    onChange={() => setFood(toggle(food, item.id))}
                    className="size-4 accent-gold"
                  />
                  <span>{item.label}</span>
                </span>
                <span className="shrink-0 text-sm text-alabaster/60">{item.price.toLocaleString("en-GB")}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="mt-5 flex items-baseline justify-between border-t border-gold/25 pt-4">
          <span className="type-label text-alabaster/70">
            {cells.length} bay {cells.length === 1 ? "hour" : "hours"}
          </span>
          <span className="type-display text-3xl">{kes(total)}</span>
        </p>
        {reserved ? (
          <p role="status" className="mt-5 flex items-center gap-3 font-display text-2xl">
            <Check className="text-gold" /> Held for you
          </p>
        ) : (
          <button
            type="button"
            disabled={cells.length === 0}
            onClick={() => setReserved(true)}
            className={cn(button({ tone: "gold" }), "mt-5 w-full")}
          >
            Hold these bays
          </button>
        )}
        <DemoNote className="mt-3">Demo: nothing is booked. The live version sends this to the Toptracer terminal.</DemoNote>
      </aside>
    </div>
  );
}
