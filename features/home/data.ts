import type { Hole } from "@/lib/generated/schema";
import { findModelPage } from "@/lib/server-queries";

/** The course's holes from the database, or none when it can't be read. */
export async function readHoles(): Promise<Hole[]> {
  const page = await findModelPage("hole", { pageSize: 18 });
  return page?.rows ?? [];
}

/** Holes, par and yards added up from the course's rows; null when the database is unavailable. */
export function courseTotals(holes: Hole[]) {
  if (holes.length === 0) return null;
  return {
    holes: holes.length,
    par: holes.reduce((total, hole) => total + hole.par, 0),
    yards: holes.reduce((total, hole) => total + hole.yards, 0),
  };
}
