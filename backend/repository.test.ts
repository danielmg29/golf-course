import { describe, expect, it } from "vitest";
import { getRow, getRows, parseListQuery } from "@/backend/repository";
import { tables } from "@/backend/tables.generated";
import { contract, type ModelName } from "@/lib/generated/schema";

const firstHole = tables.hole[0];

const value = <T>(result: { kind: "ok"; value: T } | { kind: "err" }) => {
  if (result.kind === "err") throw new Error("Expected an ok result.");
  return result.value;
};

describe("contract", () => {
  it.each(Object.keys(contract) as ModelName[])("%s rows satisfy the generated schema", (name) => {
    expect(contract[name].schema.array().safeParse(tables[name]).success).toBe(true);
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

    expect(rows[0].yards).toBe(Math.max(...tables.hole.map((hole) => hole.yards)));
  });

  it("filters on fields the contract marks as filterable", async () => {
    const { rows, count } = value(await getRows("hole", { filters: { par: "3" } }));

    expect(rows.every((hole) => hole.par === 3)).toBe(true);
    expect(count).toBe(tables.hole.filter((hole) => hole.par === 3).length);
  });

  it("searches text fields without regard to case", async () => {
    const { rows } = value(await getRows("hole", { search: firstHole.name.toUpperCase() }));

    expect(rows.map((hole) => hole.id)).toContain(firstHole.id);
  });

  it("pages rows and still reports the full count", async () => {
    const { rows, count } = value(await getRows("hole", { page: 2, pageSize: 5 }));

    expect(rows).toHaveLength(5);
    expect(rows[0].number).toBe(6);
    expect(count).toBe(tables.hole.length);
  });

  it.each([
    ["an unknown model", "nope", {}, "NOT_FOUND"],
    ["a field that isn't filterable", "hole", { filters: { yards: "400" } }, "INVALID_QUERY"],
    ["an unknown sort field", "hole", { sort: "-nope" }, "INVALID_QUERY"],
    ["a page that isn't a number", "hole", { page: Number("abc") }, "INVALID_QUERY"],
    ["a page size over the limit", "hole", { pageSize: 1000 }, "INVALID_QUERY"],
  ])("returns an error for %s", async (_case, model, query, code) => {
    const result = await getRows(model, query);

    expect(result).toMatchObject({ kind: "err", error: { code } });
  });
});

describe("getRow", () => {
  it("finds a row by primary key", async () => {
    expect(value(await getRow("hole", String(firstHole.id)))).toEqual(firstHole);
  });

  it("returns NOT_FOUND for a missing row", async () => {
    expect(await getRow("hole", "9999")).toMatchObject({
      kind: "err",
      error: { code: "NOT_FOUND" },
    });
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
