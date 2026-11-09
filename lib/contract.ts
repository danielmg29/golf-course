// Hand-written on purpose. The generated contract is checked against these types
// with `satisfies`, so a malformed export fails the build (manual 6.4).

export type FieldType =
  | "string"
  | "integer"
  | "decimal"
  | "boolean"
  | "date"
  | "datetime"
  | "enum";

export type Widget =
  | "text"
  | "textarea"
  | "email"
  | "slug"
  | "url"
  | "number"
  | "currency"
  | "select"
  | "relation"
  | "switch"
  | "date"
  | "datetime";

export interface FieldMeta {
  readonly name: string;
  readonly type: FieldType;
  readonly widget: Widget;
  readonly label: string;
  readonly required: boolean;
  readonly readOnly: boolean;
  readonly inList: boolean;
  readonly inFilter: boolean;
  readonly weight: number;
  readonly derivesFrom?: string;
  readonly choices?: readonly { readonly value: string; readonly label: string }[];
}

export interface ModelMeta {
  readonly name: string;
  readonly label: string;
  readonly labelPlural: string;
  readonly primaryKey: string;
  readonly displayField: string;
  readonly tenantField: string | null;
  readonly ordering: readonly string[];
  readonly fields: readonly FieldMeta[];
  readonly actions: readonly ("create" | "update" | "delete" | "export")[];
}

export type ListQuery = {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  filters?: Record<string, string>;
};

export type Page<T> = {
  rows: T[];
  count: number;
  page: number;
  pageSize: number;
};

// Errors are values, as in the manual's Result type (section 3.2).
export type BackendError = {
  code: "NOT_FOUND" | "INVALID_QUERY" | "UNAVAILABLE";
  detail: string;
};

export type Result<T> =
  | { kind: "ok"; value: T }
  | { kind: "err"; error: BackendError };
