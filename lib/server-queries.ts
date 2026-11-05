import { cacheLife, cacheTag } from "next/cache";
import { getRows } from "@/backend/repository";
import type { ListQuery } from "@/lib/contract";
import type { ModelName } from "@/lib/generated/schema";

// How Server Components read data. Results are cached, so most page views never touch
// the database and Neon's compute can stay asleep. `next build` runs these queries to
// prerender pages, so it needs DATABASE_URL. To show a change straight away, call
// revalidateTag(`data:${model}`) from wherever the data is written.
export async function getModelPage<M extends ModelName>(model: M, query?: ListQuery) {
  "use cache";
  cacheLife("hours");
  cacheTag(`data:${model}`);

  const result = await getRows(model, query);
  if (result.kind === "err") throw new Error(`${model}: ${result.error.detail}`);
  return result.value;
}
