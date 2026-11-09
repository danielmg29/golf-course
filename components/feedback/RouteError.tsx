"use client";

import Link from "next/link";
import { useEffect } from "react";
import { WaterHazard } from "@/components/feedback/ErrorArt";
import { ErrorScene } from "@/components/feedback/ErrorScene";
import { button } from "@/lib/variants";

/** A page that broke while it rendered: in the water, with a drop to try again. */
export function RouteError({ error, retry, inLayout }: { error: unknown; retry: () => void; inLayout?: boolean }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  // The floating booking buttons would sit over the scene; they step aside while it shows.
  useEffect(() => {
    if (!inLayout) return;
    const html = document.documentElement;
    html.dataset.floatTone = "hide";
    return () => {
      delete html.dataset.floatTone;
    };
  }, [inLayout]);
  // Server errors carry a digest the club can match in its logs; nothing else is shown.
  const digest = error instanceof Error ? (error as Error & { digest?: string }).digest : undefined;

  return (
    <ErrorScene
      code="500"
      name="Something went wrong"
      art={<WaterHazard />}
      title={
        <>
          That one found <em>the water.</em>
        </>
      }
      body="Something went wrong on our side, not yours. Take a drop and we'll try that page again, or head back to the clubhouse."
      reference={digest}
      mark={!inLayout}
      actions={
        <>
          <button type="button" onClick={() => retry()} className={button({ tone: "gold" })}>
            Take a drop and try again
          </button>
          <Link href="/" className="inline-flex items-center font-ui text-[15px] font-semibold">
            <span className="border-b border-antique pb-1">Back to the clubhouse</span>
          </Link>
        </>
      }
    />
  );
}
