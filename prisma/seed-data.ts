import type { PrismaClient } from "../backend/generated/prisma/client";
import { HoleSchema } from "../lib/generated/schema";

// Invented sample data. Replace it with the real course before launch.
export const holes = [
  { number: 1, name: "First Light", par: 4, yards: 405, strokeIndex: 7 },
  { number: 2, name: "Long Meadow", par: 5, yards: 530, strokeIndex: 11 },
  { number: 3, name: "Stillwater", par: 3, yards: 165, strokeIndex: 15 },
  { number: 4, name: "The Spine", par: 4, yards: 430, strokeIndex: 1 },
  { number: 5, name: "Old Oak", par: 4, yards: 385, strokeIndex: 9 },
  { number: 6, name: "Windgap", par: 3, yards: 190, strokeIndex: 17 },
  { number: 7, name: "Far Reach", par: 5, yards: 555, strokeIndex: 3 },
  { number: 8, name: "Hollow", par: 4, yards: 360, strokeIndex: 13 },
  { number: 9, name: "Homeward", par: 4, yards: 420, strokeIndex: 5 },
  { number: 10, name: "Ridgeline", par: 4, yards: 395, strokeIndex: 8 },
  { number: 11, name: "Little Bridge", par: 3, yards: 150, strokeIndex: 18 },
  { number: 12, name: "The Long Way", par: 5, yards: 545, strokeIndex: 2 },
  { number: 13, name: "Birch Row", par: 4, yards: 375, strokeIndex: 12 },
  { number: 14, name: "Crosswind", par: 4, yards: 445, strokeIndex: 4 },
  { number: 15, name: "Second Wind", par: 5, yards: 510, strokeIndex: 10 },
  { number: 16, name: "Island Green", par: 3, yards: 175, strokeIndex: 16 },
  { number: 17, name: "Narrows", par: 4, yards: 350, strokeIndex: 14 },
  { number: 18, name: "Clubhouse", par: 4, yards: 440, strokeIndex: 6 },
];

/** Checks rows against the contract, then upserts them so a re-run is safe. */
export async function seedRows(db: PrismaClient, rows: typeof holes) {
  const parsed = HoleSchema.omit({ id: true }).array().parse(rows);

  await db.$transaction(
    parsed.map((hole) =>
      db.hole.upsert({ where: { number: hole.number }, create: hole, update: hole }),
    ),
  );
}

export const seed = (db: PrismaClient) => seedRows(db, holes);
