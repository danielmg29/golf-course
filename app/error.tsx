"use client";

import { RouteError } from "@/components/feedback/RouteError";

// Error boundaries are client components; this one catches anything below the root layout.
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  return <RouteError error={error} retry={retry} />;
}
