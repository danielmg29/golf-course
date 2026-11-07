import { expect, test } from "vitest";
import { GOLF_PER_PLAYER, quoteGolfDay } from "@/features/event/data";

test("prices golf alone when nothing else is chosen", () => {
  const quote = quoteGolfDay({ players: 20, room: "none", buffet: "none", clinic: "none" });

  expect(quote.lines).toHaveLength(1);
  expect(quote.total).toBe(20 * GOLF_PER_PLAYER);
  expect(quote.perPlayer).toBe(GOLF_PER_PLAYER);
});

test("charges food per head and rooms and clinics per day", () => {
  const small = quoteGolfDay({ players: 8, room: "half", buffet: "plated", clinic: "clinic" });
  const large = quoteGolfDay({ players: 16, room: "half", buffet: "plated", clinic: "clinic" });

  const perExtraPlayer = (large.total - small.total) / 8;
  expect(perExtraPlayer).toBe(GOLF_PER_PLAYER + 4800);
});

test("the total is always the sum of the lines shown", () => {
  const quote = quoteGolfDay({ players: 36, room: "full", buffet: "buffet", clinic: "bays" });

  expect(quote.total).toBe(quote.lines.reduce((sum, line) => sum + line.amount, 0));
});
