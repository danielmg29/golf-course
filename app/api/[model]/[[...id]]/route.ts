import type { NextRequest } from "next/server";
import { getRow, getRows, parseListQuery } from "@/backend/repository";

const STATUS = { NOT_FOUND: 404, INVALID_QUERY: 400, UNAVAILABLE: 503 } as const;

// One handler serves every model, like the manual's dynamic endpoint:
//   GET /api/hole?sort=-yards&f.par=3
//   GET /api/hole/7
export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/[model]/[[...id]]">,
) {
  const { model, id } = await params;
  const result = id
    ? await getRow(model, id.join("/"))
    : await getRows(model, parseListQuery(request.nextUrl.searchParams));

  return result.kind === "ok"
    ? Response.json(result.value)
    : Response.json(result.error, { status: STATUS[result.error.code] });
}
