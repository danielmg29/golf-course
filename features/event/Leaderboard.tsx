"use client";

import { useEffect, useReducer, useRef } from "react";
import { DemoNote } from "@/components/ui/primitives";
import { leaderboardStart, type LeaderboardRow, sponsors } from "@/features/event/data";
import { cn } from "@/lib/utils";

const TICK_MS = 4500;
const STROKE_CHANGES = [0, 0, 0, -1, 1];

const formatScore = (score: number) =>
  score === 0 ? "E" : score > 0 ? `+${score}` : `−${Math.abs(score)}`;

type Board = { rows: LeaderboardRow[]; changed: string | null; tick: number };

/** One player finishes a hole. Who, and how it went, follow from the tick so it stays repeatable. */
function playNextHole({ rows, tick }: Board): Board {
  const nextTick = tick + 1;
  const index = (nextTick * 5) % rows.length;
  const change = STROKE_CHANGES[(nextTick * 3) % STROKE_CHANGES.length];
  const player = rows[index];
  const played =
    player.thru < 18 ? { ...player, thru: player.thru + 1, score: player.score + change } : player;
  const next = rows.map((row, position) => (position === index ? played : row));
  return {
    rows: next.toSorted((a, b) => a.score - b.score),
    changed: player.name,
    tick: nextTick,
  };
}

/** A pretend round that updates itself, with sponsors rotating in the header, as on event days. */
export function Leaderboard({ limit, className }: { limit?: number; className?: string }) {
  const [{ rows, changed, tick }, playHole] = useReducer(playNextHole, {
    rows: leaderboardStart,
    changed: null,
    tick: 0,
  });
  const board = useRef<HTMLDivElement>(null);

  // Only plays on while someone can see it.
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      if (entry.isIntersecting) timer = setInterval(playHole, TICK_MS);
    });
    if (board.current) observer.observe(board.current);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, []);

  const shown = limit ? rows.slice(0, limit) : rows;

  return (
    <div ref={board} className={cn("bg-charcoal p-6 md:p-8", className)}>
      <div className="flex items-center justify-between gap-4 border-b border-gold/25 pb-5">
        <p className="type-label flex items-center gap-3 text-gold">
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-gold motion-reduce:animate-none" />
            <span className="relative size-2 rounded-full bg-gold" />
          </span>
          Live
        </p>
        <p className="type-label text-right text-alabaster/55">{sponsors[tick % sponsors.length]}</p>
      </div>

      <table className="mt-2 w-full border-collapse text-left">
        <thead>
          <tr className="type-label text-alabaster/50">
            <th scope="col" className="w-10 py-3 font-medium">Pos</th>
            <th scope="col" className="py-3 font-medium">Player</th>
            <th scope="col" className="w-14 py-3 text-right font-medium">Thru</th>
            <th scope="col" className="w-16 py-3 text-right font-medium">Score</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((row, index) => (
            <tr
              key={row.name}
              className={cn(
                "border-t border-alabaster/10 transition-colors duration-700 ease-fluid",
                row.name === changed && "bg-gold/10",
              )}
            >
              <td className="py-3 text-sm text-alabaster/60">{index + 1}</td>
              <td className="py-3 font-display text-xl leading-tight">{row.name}</td>
              <td className="py-3 text-right text-sm text-alabaster/60">{row.thru}</td>
              <td className={cn("py-3 text-right font-display text-2xl leading-tight", row.score < 0 && "text-gold")}>
                {formatScore(row.score)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <DemoNote className="mt-4">Sample round. On event days this reads from the club&apos;s scoring software.</DemoNote>
    </div>
  );
}
