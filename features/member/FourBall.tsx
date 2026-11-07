"use client";

import { useState } from "react";
import { Check } from "@/components/ui/icons";
import { DemoNote } from "@/components/ui/primitives";
import { type HandicapBand, handicapBands, openGames } from "@/features/member/data";
import { button, choice } from "@/lib/variants";
import { cn } from "@/lib/utils";

const PLACES = 4;

/** The roadmap's matchmaking tool: open games with a free place, filtered by handicap. */
export function FourBall() {
  const [band, setBand] = useState<HandicapBand>("Any");
  const [requested, setRequested] = useState<string[]>([]);

  const shown = openGames.filter((game) => band === "Any" || game.band === band);

  return (
    <div>
      <div role="group" aria-label="Handicap" className="flex flex-wrap items-center gap-1.5">
        <span className="type-label mr-3 text-alabaster/60">Your handicap</span>
        {handicapBands.map((candidate) => (
          <button
            key={candidate}
            type="button"
            aria-pressed={candidate === band}
            onClick={() => setBand(candidate)}
            className={cn(choice({ selected: candidate === band }), "type-label rounded-full border px-4 py-2.5")}
          >
            {candidate}
          </button>
        ))}
      </div>

      <ul className="mt-10">
        {shown.map((game) => {
          const isRequested = requested.includes(game.id);
          return (
            <li key={game.id} className="grid items-center gap-4 border-t border-gold/20 py-5 md:grid-cols-[9rem_1fr_auto_auto] md:gap-8">
              <p className="type-display text-3xl leading-none">{game.when}</p>
              <div>
                <p>{game.note}</p>
                <p className="mt-1 text-sm text-alabaster/60">
                  {game.players.join(", ")} &middot; Handicaps {game.band}
                </p>
              </div>
              <div className="flex items-center gap-1.5" aria-label={`${PLACES - game.players.length} of ${PLACES} places free`} role="img">
                {Array.from({ length: PLACES }, (_, place) => (
                  <span
                    key={place}
                    className={cn(
                      "size-3 rounded-full border",
                      place < game.players.length || (isRequested && place === game.players.length)
                        ? "border-gold bg-gold"
                        : "border-gold/50",
                    )}
                  />
                ))}
              </div>
              <button
                type="button"
                disabled={isRequested}
                onClick={() => setRequested([...requested, game.id])}
                className={cn(button({ tone: isRequested ? "glass" : "outline", size: "sm" }), "disabled:opacity-100")}
              >
                {isRequested ? (
                  <>
                    <Check width={14} height={14} className="text-gold" /> Requested
                  </>
                ) : (
                  "Ask to join"
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <DemoNote className="border-t border-gold/20 pt-4">Sample games. In the live version, the group gets an SMS when you ask to join.</DemoNote>
    </div>
  );
}
