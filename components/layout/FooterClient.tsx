"use client";

import { type FormEvent, useState } from "react";
import { ArrowRight } from "@/components/ui/icons";

/** The monthly club notes sign-up. A demo: nothing typed here leaves the page. */
export function ClubNotes() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <p role="status" className="mt-5 font-ui text-sm">
        You&apos;re on the list. (A demo: nothing was sent or kept.)
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-5">
      <label className="block">
        <span className="sr-only">Email</span>
        <span className="flex items-center gap-3 border-b border-paper/40 focus-within:border-antique">
          <input
            required
            type="email"
            name="email"
            autoComplete="off"
            placeholder="Your email"
            className="min-w-0 flex-1 bg-transparent py-3 font-ui text-base text-paper outline-none placeholder:text-paper/70"
          />
          <button type="submit" aria-label="Sign up for club notes" className="flex size-10 shrink-0 items-center justify-center text-antique transition-transform duration-200 ease-out hover:translate-x-1">
            <ArrowRight width={18} height={18} />
          </button>
        </span>
      </label>
      <p className="mt-2 font-ui text-xs text-paper/75">Demo: nothing you enter is sent or kept.</p>
    </form>
  );
}

/** Back to the top: the ball runs up the line it came down. */
export function BackToTee() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
      className="group inline-flex items-center gap-3 font-ui text-sm font-semibold"
    >
      <span className="relative flex h-6 w-3 justify-center">
        <span aria-hidden className="absolute inset-y-0 w-px bg-paper/40" />
        <span aria-hidden className="absolute bottom-0 size-2.5 rounded-full bg-paper transition-transform duration-500 ease-out group-hover:-translate-y-3.5" />
      </span>
      <span className="border-b border-antique pb-0.5">Back to the first tee</span>
    </button>
  );
}
