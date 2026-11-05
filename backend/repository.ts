import type { z } from "zod";
import type { BackendError, ListQuery, Page, Result } from "@/lib/contract";
import { contract, type ModelName } from "@/lib/generated/schema";
import { tables } from "./tables.generated";

type Row = Record<string, unknown>;
export type RowOf<M extends ModelName> = z.infer<(typeof contract)[M]["schema"]>;

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

const ok = <T>(value: T): Result<T> => ({ kind: "ok", value });
const err = (code: BackendError["code"], detail: string): Result<never> => ({
  kind: "err",
  error: { code, detail },
});

const isModelName = (name: string): name is ModelName => Object.hasOwn(contract, name);

const modelNotFound = (model: string) => err("NOT_FOUND", `There is no model called "${model}".`);

// Parsed once at load, so a fixture that breaks the contract fails the build
// the way a bad migration would.
const rowsByModel = new Map(
  (Object.keys(contract) as ModelName[]).map((name) => [
    name,
    contract[name].schema.array().parse(tables[name]) as Row[],
  ]),
);

function compareValues(a: unknown, b: unknown) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""));
}

function compareRows(sortKeys: readonly string[]) {
  return (a: Row, b: Row) => {
    for (const key of sortKeys) {
      const descending = key.startsWith("-");
      const name = descending ? key.slice(1) : key;
      const order = compareValues(a[name], b[name]);
      if (order !== 0) return descending ? -order : order;
    }
    return 0;
  };
}

/** Maps the manual's URL state (`sort`, `q`, `page`, `size`, `f.<field>`) to a query. */
export function parseListQuery(params: URLSearchParams): ListQuery {
  const filters = Object.fromEntries(
    [...params]
      .filter(([key]) => key.startsWith("f."))
      .map(([key, value]) => [key.slice(2), value]),
  );
  const page = params.get("page");
  const size = params.get("size");

  return {
    filters,
    sort: params.get("sort") ?? undefined,
    search: params.get("q") ?? undefined,
    page: page === null ? undefined : Number(page),
    pageSize: size === null ? undefined : Number(size),
  };
}

/** The dynamic list handler: one function serves every model. */
export function getRows<M extends ModelName>(
  model: M,
  query?: ListQuery,
): Promise<Result<Page<RowOf<M>>>>;
export function getRows(model: string, query?: ListQuery): Promise<Result<Page<Row>>>;
export async function getRows(model: string, query: ListQuery = {}): Promise<Result<Page<Row>>> {
  if (!isModelName(model)) return modelNotFound(model);

  const { meta } = contract[model];
  const { filters = {}, search, sort, page = 1, pageSize = DEFAULT_PAGE_SIZE } = query;

  if (!Number.isInteger(page) || page < 1) {
    return err("INVALID_QUERY", "page must be a whole number of 1 or more.");
  }
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    return err("INVALID_QUERY", `size must be a whole number from 1 to ${MAX_PAGE_SIZE}.`);
  }

  const fields = new Map<string, (typeof meta.fields)[number]>(
    meta.fields.map((field) => [field.name, field]),
  );

  for (const name of Object.keys(filters)) {
    if (!fields.get(name)?.inFilter) {
      return err("INVALID_QUERY", `${meta.labelPlural} can't be filtered by "${name}".`);
    }
  }
  if (sort && !fields.has(sort.replace(/^-/, ""))) {
    return err("INVALID_QUERY", `${meta.labelPlural} can't be sorted by "${sort}".`);
  }

  const needle = search?.toLowerCase();
  const searchable = meta.fields.filter((field) => field.type === "string").map((f) => f.name);

  const matches = (rowsByModel.get(model) ?? [])
    .filter((row) =>
      Object.entries(filters).every(([name, value]) => String(row[name]) === value),
    )
    .filter(
      (row) =>
        !needle || searchable.some((name) => String(row[name] ?? "").toLowerCase().includes(needle)),
    )
    .toSorted(compareRows(sort ? [sort] : meta.ordering));

  const start = (page - 1) * pageSize;
  return ok({ rows: matches.slice(start, start + pageSize), count: matches.length, page, pageSize });
}

/** The dynamic detail handler. */
export async function getRow(model: string, id: string): Promise<Result<Row>> {
  if (!isModelName(model)) return modelNotFound(model);

  const { primaryKey, label } = contract[model].meta;
  const row = rowsByModel.get(model)?.find((candidate) => String(candidate[primaryKey]) === id);

  return row ? ok(row) : err("NOT_FOUND", `${label} ${id} does not exist.`);
}
