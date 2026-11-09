import { prisma } from "../backend/db";
import { holes, seed } from "./seed-data";

seed(prisma)
  .then(() => console.log(`Seeded ${holes.length} holes.`))
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
