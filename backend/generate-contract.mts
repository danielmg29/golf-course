// A custom Prisma generator, standing in for Django's `manage.py export_schema`
// (manual 3.1 and 6.4). It runs as part of `prisma generate` and turns the models in
// prisma/schema.prisma into the contract the UI reads.
//
// Output must stay deterministic: `npm run verify` diffs it against git.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import generatorHelper, { type DMMF } from "@prisma/generator-helper";

// The package is CommonJS and Node can't see its exports by name from an ES module.
const { generatorHandler } = generatorHelper;

type ModelOptions = {
  displayField: string;
  listFields?: string[];
  filterFields?: string[];
  ordering?: string[];
  label?: string;
  labelPlural?: string;
  immutable?: boolean;
};

type FieldOptions = {
  label?: string;
  widget?: string;
  min?: number;
  max?: number;
  derivesFrom?: string;
};

function humanise(name: string) {
  const words = name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function readAnnotation<T>(documentation: string | undefined, tag: string, owner: string) {
  const line = documentation
    ?.split("\n")
    .map((text) => text.trim())
    .find((text) => text.startsWith(`@${tag} `));
  if (!line) return undefined;

  try {
    return JSON.parse(line.slice(tag.length + 2)) as T;
  } catch {
    throw new Error(`${owner}: the @${tag} annotation is not valid JSON.`);
  }
}

const bounds = ({ min, max }: { min?: number; max?: number }) =>
  `${min === undefined ? "" : `.min(${min})`}${max === undefined ? "" : `.max(${max})`}`;

function varCharLength(field: DMMF.Field) {
  const [name, args] = field.nativeType ?? [];
  return name === "VarChar" && args?.[0] ? Number(args[0]) : undefined;
}

// Prisma scalar -> data type, widget and Zod type.
function compileScalar(field: DMMF.Field, options: FieldOptions, isForeignKey: boolean, owner: string) {
  switch (field.type) {
    case "String": {
      const widget = options.widget ?? (isForeignKey ? "relation" : "text");
      const range = bounds({ min: options.min, max: options.max ?? varCharLength(field) });
      if (widget === "email") return { type: "string", widget, zod: "z.email()" };
      if (widget === "url") return { type: "string", widget, zod: "z.url()" };
      if (widget === "slug") return { type: "string", widget, zod: `z.string().regex(/^[a-z0-9-]+$/)${range}` };
      return { type: "string", widget, zod: `z.string()${range}` };
    }
    case "Int":
      return {
        type: "integer",
        widget: options.widget ?? (isForeignKey ? "relation" : "number"),
        zod: `z.number().int()${bounds(options)}`,
      };
    case "Float":
      return { type: "decimal", widget: options.widget ?? "number", zod: `z.number()${bounds(options)}` };
    case "Decimal":
      return { type: "decimal", widget: options.widget ?? "currency", zod: `z.number()${bounds(options)}` };
    case "Boolean":
      return { type: "boolean", widget: options.widget ?? "switch", zod: "z.boolean()" };
    case "DateTime":
      return field.nativeType?.[0] === "Date"
        ? { type: "date", widget: options.widget ?? "date", zod: "z.iso.date()" }
        : { type: "datetime", widget: options.widget ?? "datetime", zod: "z.iso.datetime()" };
    default:
      throw new Error(`${owner}: the ${field.type} type isn't supported by the contract yet.`);
  }
}

function compileField(
  model: DMMF.Model,
  field: DMMF.Field,
  index: number,
  adaptive: ModelOptions,
  enums: readonly DMMF.DatamodelEnum[],
  foreignKeys: Set<string>,
) {
  const owner = `${model.name}.${field.name}`;
  if (field.isList) throw new Error(`${owner}: list fields aren't supported by the contract yet.`);

  const options = readAnnotation<FieldOptions>(field.documentation, "field", owner) ?? {};
  const enumDefinition =
    field.kind === "enum" ? enums.find((candidate) => candidate.name === field.type) : undefined;
  const choices = enumDefinition?.values.map(({ name }) => ({ value: name, label: humanise(name) }));

  const compiled = choices
    ? {
        type: "enum",
        widget: options.widget ?? "select",
        zod: `z.enum(${JSON.stringify(choices.map((choice) => choice.value))})`,
      }
    : compileScalar(field, options, foreignKeys.has(field.name), owner);

  // A default like autoincrement() or now() comes from the database, so nobody edits it.
  const hasGeneratedDefault = typeof field.default === "object" && field.default !== null;
  const hasLiteralDefault = field.hasDefaultValue && !hasGeneratedDefault;
  const readOnly = hasGeneratedDefault || Boolean(field.isUpdatedAt);

  let zod = compiled.zod;
  if (readOnly) zod += ".readonly()";
  if (!field.isRequired) zod += ".nullable()";
  if (hasLiteralDefault) {
    const value = compiled.type === "decimal" ? Number(field.default) : field.default;
    zod += `.default(${JSON.stringify(value)})`;
  }

  const meta = {
    name: field.name,
    type: compiled.type,
    widget: compiled.widget,
    label: options.label ?? humanise(field.name),
    required: field.isRequired && !readOnly && !hasLiteralDefault,
    readOnly,
    inList: adaptive.listFields?.includes(field.name) ?? false,
    inFilter: adaptive.filterFields?.includes(field.name) ?? false,
    weight: (index + 1) * 10,
    ...(options.derivesFrom ? { derivesFrom: options.derivesFrom } : {}),
    ...(choices ? { choices } : {}),
  };

  return { name: field.name, zod, meta };
}

function compileModel(model: DMMF.Model, enums: readonly DMMF.DatamodelEnum[]) {
  const adaptive = readAnnotation<ModelOptions>(model.documentation, "adaptive", model.name);
  if (!adaptive) throw new Error(`${model.name}: needs an @adaptive annotation.`);

  const primaryKey = model.fields.find((field) => field.isId)?.name;
  if (!primaryKey) throw new Error(`${model.name}: needs a single @id field.`);

  // Relation objects aren't columns. The foreign key beside them is what the contract sees.
  const columns = model.fields.filter((field) => field.kind !== "object");
  const foreignKeys = new Set(model.fields.flatMap((field) => field.relationFromFields ?? []));

  const known = new Set(columns.map((field) => field.name));
  const ordering = adaptive.ordering ?? [];
  const references = [
    adaptive.displayField,
    ...(adaptive.listFields ?? []),
    ...(adaptive.filterFields ?? []),
    ...ordering.map((key) => key.replace(/^-/, "")),
  ];
  for (const name of references) {
    if (!known.has(name)) throw new Error(`${model.name}: "${name}" is referenced but is not a field.`);
  }

  const fields = columns.map((field, index) =>
    compileField(model, field, index, adaptive, enums, foreignKeys),
  );

  const meta = {
    name: model.name,
    label: adaptive.label ?? humanise(model.name),
    labelPlural: adaptive.labelPlural ?? `${humanise(model.name)}s`,
    primaryKey,
    displayField: adaptive.displayField,
    tenantField: null,
    ordering,
    fields: fields.map((field) => field.meta),
    actions: adaptive.immutable ? [] : ["create", "update", "delete", "export"],
  };

  const source = [
    `export const ${model.name}Schema = z.object({`,
    ...fields.map((field) => `  ${field.name}: ${field.zod},`),
    "});",
    `export type ${model.name} = z.infer<typeof ${model.name}Schema>;`,
    "",
    `export const ${model.name}Meta = ${JSON.stringify(meta, null, 2)} as const satisfies ModelMeta;`,
    "",
  ].join("\n");

  // Matches the property name on the Prisma client: TeeBox -> prisma.teeBox.
  const key = model.name.charAt(0).toLowerCase() + model.name.slice(1);
  return { key, name: model.name, source };
}

generatorHandler({
  onManifest: () => ({
    prettyName: "Adaptive Convergence contract",
    defaultOutput: "../lib/generated/schema.ts",
  }),
  onGenerate: async ({ dmmf, generator }) => {
    const out = generator.output?.value;
    if (!out) throw new Error("The contract generator needs an output path.");

    const models = [...dmmf.datamodel.models]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((model) => compileModel(model, dmmf.datamodel.enums));

    const schema = [
      "// AUTO-GENERATED by `npm run schema` from prisma/schema.prisma.",
      "// DO NOT EDIT: changes are overwritten on every dev and build.",
      "",
      'import { z } from "zod";',
      'import type { ModelMeta } from "@/lib/contract";',
      "",
      'export type { FieldMeta, ModelMeta } from "@/lib/contract";',
      "",
      ...models.map((model) => model.source),
      "export const contract = {",
      ...models.map((model) => `  ${model.key}: { schema: ${model.name}Schema, meta: ${model.name}Meta },`),
      "} as const;",
      "",
      "export type ModelName = keyof typeof contract;",
      "",
    ].join("\n");

    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, schema);
  },
});
