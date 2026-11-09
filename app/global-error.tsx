"use client";

import { useEffect } from "react";
import { PlaySuspended } from "@/components/feedback/ErrorArt";
import { fontVariables } from "./fonts";
import "./globals.css";

/**
 * When even the root layout fails, this replaces it, so it brings its own document, styles and
 * fonts. The horn has sounded: play is suspended. A retry and a plain link home, nothing that
 * could itself depend on what broke.
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-forest text-paper">
        <title>Play suspended | The Reserve Golf Club</title>
        <main className="frame flex flex-1 flex-col justify-center py-16">
          <div className="grid-swiss gap-y-8">
            <div className="col-span-full lg:col-span-6 lg:col-start-4">
              <PlaySuspended />
            </div>
            <div className="col-span-full lg:col-span-7 lg:col-start-3">
              <h1 className="font-display text-display-lg font-light [text-wrap:balance]">
                Play is suspended. <em className="italic">We&apos;ll have you back out shortly.</em>
              </h1>
              <p className="mt-6 max-w-[48ch] font-ui text-lead text-paper/90">
                The whole site stumbled, which is on us. Try again in a moment; if it keeps happening, message the club on
                WhatsApp.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <button
                  type="button"
                  onClick={() => retry()}
                  className="inline-flex h-12 items-center bg-antique px-6 font-ui text-[15px] font-semibold text-forest transition-colors duration-200 hover:bg-[#c9a86c]"
                >
                  Try again
                </button>
                {/* A plain link, so the home page loads from scratch rather than through what broke. */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href="/" className="border-b border-antique pb-1 font-ui text-[15px] font-semibold">
                  Back to the first tee
                </a>
              </div>
            </div>
          </div>
          <p className="type-meta mt-16 text-paper/85">Error 500 · Play suspended</p>
        </main>
      </body>
    </html>
  );
}
