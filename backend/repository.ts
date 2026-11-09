import type { z } from "zod";
import type { BackendError, FieldMeta, ListQuery, ModelMeta, Page, Result } from "@/lib/contract";
import { contract, type ModelName } from "@/lib/generated/schema";
import { prisma } from "./db";

type Row = Record<string, unknown>;
export type RowOf<M extends ModelName> = z.infer<(typeof contract)[M]["schema"]>;

// The part of a Prisma model delegate this file uses. The contract already checks
// every model and field name before a query is built, so the handlers stay generic.
type Delegate = {
  findMany(args: {
    where: Row;
    orderBy: Record<string, "asc" | "desc">[];
    skip: number;
    take: number;
  }): Promise<Row[]>;
  count(args: { where: Row }): Promise<number>;
  findUnique(args: { where: Row }): Promise<Row | null>;
};

const delegateFor = (model: ModelName) => prisma[model] as unknown as Delegate;

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
// Postgres `integer`. Anything larger makes the query itself fail.
const MAX_INT = 2_147_483_647;

const ok = <T>(value: T): Result<T> => ({ kind: "ok", value });
const err = (code: BackendError["code"], detail: string): Result<never> => ({
  kind: "err",
  error: { code, detail },
});

const isModelName = (name: string): name is ModelName => Object.hasOwn(contract, name);

const modelNotFound = (model: string) => err("NOT_FOUND", `There is no model called "${model}".`);

function unavailable(error: unknown) {
  // The real error stays in the server logs. It can name hosts and table details.
  console.error(error);
  return err("UNAVAILABLE", "The data couldn't be loaded right now.");
}

/** Turns text from a URL into the value a column expects, or undefined if it can't be one. */
function parseValue(field: FieldMeta, text: string): unknown {
  switch (field.type) {
    case "integer": {
      const value = Number(text);
      return text !== "" && Number.isInteger(value) && Math.abs(value) <= MAX_INT ? value : undefined;
    }
    case "decimal": {
      const value = Number(text);
      return text !== "" && Number.isFinite(value) ? value : undefined;
    }
    case "boolean":
      return text === "true" ? true : text === "false" ? false : undefined;
    case "date":
    case "datetime": {
      const value = new Date(text);
      return Number.isNaN(value.getTime()) ? undefined : value;
    }
    case "enum":
      return field.choices?.some((choice) => choice.value === text) ? text : undefined;
    default:
      // Postgres text can't hold a NUL byte, so it could never match.
      return text.includes("\0") ? undefined : text;
  }
}

/** Prisma returns Date and Decimal objects. The contract promises plain JSON values. */
export function toContractRow(meta: ModelMeta, row: Row): Row {
  const result = { ...row };

  for (const field of meta.fields) {
    const value = row[field.name];
    if (value === null || value === undefined) continue;
    if (field.type === "datetime") result[field.name] = (value as Date).toISOString();
    if (field.type === "date") result[field.name] = (value as Date).toISOString().slice(0, 10);
    if (field.type === "decimal") result[field.name] = Number(value);
  }

  return result;
}

const toOrderBy = (key: string) =>
  key.startsWith("-") ? { [key.slice(1)]: "desc" as const } : { [key]: "asc" as const };

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

  const meta: ModelMeta = contract[model].meta;
  const { filters = {}, search, sort, page = 1, pageSize = DEFAULT_PAGE_SIZE } = query;

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    return err("INVALID_QUERY", `size must be a whole number from 1 to ${MAX_PAGE_SIZE}.`);
  }
  if (!Number.isInteger(page) || page < 1 || (page - 1) * pageSize > MAX_INT) {
    return err("INVALID_QUERY", "page must be a whole number of 1 or more.");
  }

  const fields = new Map(meta.fields.map((field) => [field.name, field]));
  const where: Row = {};

  for (const [name, text] of Object.entries(filters)) {
    const field = fields.get(name);
    if (!field?.inFilter) {
      return err("INVALID_QUERY", `${meta.labelPlural} can't be filtered by "${name}".`);
    }
    const value = parseValue(field, text);
    if (value === undefined) {
      return err("INVALID_QUERY", `"${text}" isn't a valid ${field.label.toLowerCase()}.`);
    }
    where[name] = value;
  }

  if (sort && !fields.has(sort.replace(/^-/, ""))) {
    return err("INVALID_QUERY", `${meta.labelPlural} can't be sorted by "${sort}".`);
  }

  if (search?.includes("\0")) {
    return err("INVALID_QUERY", "The search text contains an invalid character.");
  }
  if (search) {
    where.OR = meta.fields
      .filter((field) => field.type === "string")
      .map((field) => ({ [field.name]: { contains: search, mode: "insensitive" } }));
  }

  // The primary key comes last so rows with equal values keep a stable order across pages.
  const orderBy = [...(sort ? [sort] : meta.ordering), meta.primaryKey].map(toOrderBy);

  try {
    const delegate = delegateFor(model);
    const [rows, count] = await Promise.all([
      delegate.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
      delegate.count({ where }),
    ]);

    return ok({ rows: rows.map((row) => toContractRow(meta, row)), count, page, pageSize });
  } catch (error) {
    return unavailable(error);
  }
}

/** The dynamic detail handler. */
export async function getRow(model: string, id: string): Promise<Result<Row>> {
  if (!isModelName(model)) return modelNotFound(model);

  const meta: ModelMeta = contract[model].meta;
  const missing = err("NOT_FOUND", `${meta.label} ${id} does not exist.`);

  const primaryKey = meta.fields.find((field) => field.name === meta.primaryKey);
  const value = primaryKey && parseValue(primaryKey, id);
  if (value === undefined) return missing;

  try {
    const row = await delegateFor(model).findUnique({ where: { [meta.primaryKey]: value } });
    return row ? ok(toContractRow(meta, row)) : missing;
  } catch (error) {
    return unavailable(error);
  }
}
