-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "holes" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "par" INTEGER NOT NULL,
    "yards" INTEGER NOT NULL,
    "stroke_index" INTEGER NOT NULL,

    CONSTRAINT "holes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "holes_number_key" ON "holes"("number");

-- CreateIndex
CREATE UNIQUE INDEX "holes_stroke_index_key" ON "holes"("stroke_index");
