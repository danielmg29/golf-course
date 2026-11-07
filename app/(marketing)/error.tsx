"use client";

import { RouteError } from "@/components/feedback/RouteError";

// Inside the marketing layout, so the header and footer stay to find a way back.
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  return <RouteError error={error} retry={retry} inLayout />;
}
