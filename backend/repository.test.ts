// @vitest-environment node

import { beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "@/backend/db";
import { getRow, getRows, parseListQuery, toContractRow } from "@/backend/repository";
import type { ModelMeta } from "@/lib/contract";
import { contract, type ModelName } from "@/lib/generated/schema";
import { holes, seed } from "../prisma/seed-data";

vi.mock("@/backend/db", async () => {
  const { createTestDatabase } = await import("@/backend/test-database");
  return { prisma: await createTestDatabase() };
});

const value = <T>(result: { kind: "ok"; value: T } | { kind: "err" }) => {
  if (result.kind === "err") throw new Error("Expected an ok result.");
  return result.value;
};

beforeAll(async () => {
  await seed(prisma);
});

describe("contract", () => {
  it.each(Object.keys(contract) as ModelName[])(
    "%s rows from the migrated database satisfy the generated schema",
    async (name) => {
      const { rows } = value(await getRows(name));

      expect(contract[name].schema.array().safeParse(rows).success).toBe(true);
    },
  );
});

describe("seed", () => {
  it("can run twice without duplicating rows", async () => {
    await seed(prisma);

    expect(await prisma.hole.count()).toBe(holes.length);
  });

  it("rejects rows that break the contract", async () => {
    vi.resetModules();
    const { seedRows } = await import("../prisma/seed-data");

    await expect(seedRows(prisma, [{ ...holes[0], par: 9 }])).rejects.toThrow();
  });
});

describe("getRows", () => {
  it("applies the model's default ordering", async () => {
    const { rows } = value(await getRows("hole"));
    const numbers = rows.map((hole) => hole.number);

    expect(numbers).toEqual(numbers.toSorted((a, b) => a - b));
  });

  it("sorts descending with a leading minus", async () => {
    const { rows } = value(await getRows("hole", { sort: "-yards" }));

    expect(rows[0].yards).toBe(Math.max(...holes.map((hole) => hole.yards)));
  });

  it("filters on fields the contract marks as filterable", async () => {
    const { rows, count } = value(await getRows("hole", { filters: { par: "3" } }));

    expect(rows.every((hole) => hole.par === 3)).toBe(true);
    expect(count).toBe(holes.filter((hole) => hole.par === 3).length);
  });

  it("searches text fields without regard to case", async () => {
    const { rows } = value(await getRows("hole", { search: holes[0].name.toUpperCase() }));

    expect(rows.map((hole) => hole.name)).toContain(holes[0].name);
  });

  it("pages rows and still reports the full count", async () => {
    const { rows, count } = value(await getRows("hole", { page: 2, pageSize: 5 }));

    expect(rows).toHaveLength(5);
    expect(rows[0].number).toBe(6);
    expect(count).toBe(holes.length);
  });

  it("keeps a stable order across pages when sort values tie", async () => {
    const first = value(await getRows("hole", { sort: "par", page: 1, pageSize: 9 }));
    const second = value(await getRows("hole", { sort: "par", page: 2, pageSize: 9 }));
    const ids = [...first.rows, ...second.rows].map((hole) => hole.id);

    expect(new Set(ids).size).toBe(holes.length);
  });

  it.each([
    ["an unknown model", "nope", {}, "NOT_FOUND"],
    ["a field that isn't filterable", "hole", { filters: { yards: "400" } }, "INVALID_QUERY"],
    ["a filter value of the wrong type", "hole", { filters: { par: "abc" } }, "INVALID_QUERY"],
    ["a filter value too big for the column", "hole", { filters: { par: "99999999999" } }, "INVALID_QUERY"],
    ["an empty number filter", "hole", { filters: { par: "" } }, "INVALID_QUERY"],
    ["an unknown sort field", "hole", { sort: "-nope" }, "INVALID_QUERY"],
    ["a page that isn't a number", "hole", { page: Number("abc") }, "INVALID_QUERY"],
    ["a page too far to query", "hole", { page: 1e15 }, "INVALID_QUERY"],
    ["a page size over the limit", "hole", { pageSize: 1000 }, "INVALID_QUERY"],
    ["search text with a NUL byte", "hole", { search: "a\0b" }, "INVALID_QUERY"],
  ])("returns an error for %s", async (_case, model, query, code) => {
    const result = await getRows(model, query);

    expect(result).toMatchObject({ kind: "err", error: { code } });
  });
});

describe("getRow", () => {
  it("finds a row by primary key", async () => {
    const [first] = value(await getRows("hole", { pageSize: 1 })).rows;

    expect(value(await getRow("hole", String(first.id)))).toEqual(first);
  });

  it.each([
    ["a missing row", "hole", "9999"],
    ["an id that isn't a number", "hole", "abc"],
    ["an id too big for the column", "hole", "99999999999"],
    ["an unknown model", "nope", "1"],
  ])("returns NOT_FOUND for %s", async (_case, model, id) => {
    expect(await getRow(model, id)).toMatchObject({ kind: "err", error: { code: "NOT_FOUND" } });
  });
});

describe("toContractRow", () => {
  const field = (name: string, type: ModelMeta["fields"][number]["type"]) =>
    ({ name, type, widget: "text", label: name, required: false, readOnly: false, inList: false, inFilter: false, weight: 0 }) as const;

  const meta = {
    name: "Example",
    label: "Example",
    labelPlural: "Examples",
    primaryKey: "id",
    displayField: "id",
    tenantField: null,
    ordering: [],
    actions: [],
    fields: [field("at", "datetime"), field("on", "date"), field("cost", "decimal"), field("gone", "datetime")],
  } satisfies ModelMeta;

  it("converts Prisma's objects to the plain values the contract promises", () => {
    const date = new Date("2026-11-05T10:30:00.000Z");

    expect(
      toContractRow(meta, { id: 1, at: date, on: date, cost: { toString: () => "12.50", valueOf: () => 12.5 }, gone: null }),
    ).toEqual({ id: 1, at: "2026-11-05T10:30:00.000Z", on: "2026-11-05", cost: 12.5, gone: null });
  });
});

describe("parseListQuery", () => {
  it("maps URL state to a query", () => {
    const params = new URLSearchParams("sort=-yards&q=oak&page=2&size=5&f.par=3");

    expect(parseListQuery(params)).toEqual({
      sort: "-yards",
      search: "oak",
      page: 2,
      pageSize: 5,
      filters: { par: "3" },
    });
  });
});
