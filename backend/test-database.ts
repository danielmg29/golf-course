import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";
import { PrismaClient } from "./generated/prisma/client";

/**
 * A real Postgres in memory (PGlite), built by running the committed migrations, so
 * tests need no database server. A schema change with no migration fails against it.
 */
export async function createTestDatabase() {
  const database = new PGlite();
  const migrations = join(process.cwd(), "prisma", "migrations");

  const folders = readdirSync(migrations, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const folder of folders) {
    await database.exec(readFileSync(join(migrations, folder, "migration.sql"), "utf8"));
  }

  return new PrismaClient({ adapter: new PrismaPGlite(database) });
}
