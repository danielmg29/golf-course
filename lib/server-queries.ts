import { getRows } from "@/backend/repository";
import type { ListQuery } from "@/lib/contract";
import type { ModelName } from "@/lib/generated/schema";

// The only frontend file that knows the backend runs in-process. Replace this body
// with a fetch to a real API and nothing above it has to change.
export async function getModelPage<M extends ModelName>(model: M, query?: ListQuery) {
  const result = await getRows(model, query);
  if (result.kind === "err") throw new Error(`${model}: ${result.error.detail}`);
  return result.value;
}
