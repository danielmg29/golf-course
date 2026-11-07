"use client";

import { type FormEvent, type ReactNode, useEffect, useReducer } from "react";
import { DemoNote } from "@/components/ui/primitives";
import { button } from "@/lib/variants";

// 07XX or 01XX, with or without the 254 country code.
const KENYAN_MOBILE = /^(?:\+?254|0)(?:7|1)\d{8}$/;

type State =
  | { step: "ready"; error: string | null }
  | { step: "waiting" }
  | { step: "paid"; receipt: string };

type Action =
  | { type: "invalid" }
  | { type: "submit" }
  | { type: "confirmed"; receipt: string };

function reduce(state: State, action: Action): State {
  switch (action.type) {
    case "invalid":
      return { step: "ready", error: "Enter a Kenyan mobile number, such as 0712 345 678." };
    case "submit":
      return { step: "waiting" };
    case "confirmed":
      return { step: "paid", receipt: action.receipt };
  }
}

const PROMPT_SECONDS = 2.4;

/**
 * Shows how an M-Pesa STK push feels: number, prompt on the phone, instant receipt.
 * It's a stand-in for the Daraja API. Nothing is sent, charged or stored.
 */
export function MpesaCheckout({
  amount,
  reference,
  children,
}: {
  amount: string;
  reference: string;
  /** What to show once paid. Receives the sample receipt number. */
  children: (receipt: string) => ReactNode;
}) {
  const [state, dispatch] = useReducer(reduce, { step: "ready", error: null });

  useEffect(() => {
    if (state.step !== "waiting") return;
    const timer = setTimeout(() => {
      const code = reference.replace(/[^A-Z0-9]/gi, "").slice(-6).toUpperCase();
      dispatch({ type: "confirmed", receipt: `SAMPLE-${code}` });
    }, PROMPT_SECONDS * 1000);
    return () => clearTimeout(timer);
  }, [state.step, reference]);

  if (state.step === "paid") return <>{children(state.receipt)}</>;

  if (state.step === "waiting") {
    return (
      <div role="status" className="flex items-center gap-4 py-3">
        <span aria-hidden className="relative flex size-3">
          <span className="absolute inset-0 animate-ping rounded-full bg-gold motion-reduce:animate-none" />
          <span className="relative size-3 rounded-full bg-gold" />
        </span>
        <p className="type-body">Check your phone and enter your M-Pesa PIN.</p>
      </div>
    );
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const phone = String(new FormData(event.currentTarget).get("phone") ?? "").replace(/[\s-]/g, "");
    dispatch({ type: KENYAN_MOBILE.test(phone) ? "submit" : "invalid" });
  };

  return (
    <form onSubmit={submit} noValidate>
      <label className="block">
        <span className="type-label text-alabaster/70">M-Pesa number</span>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="off"
          placeholder="0712 345 678"
          aria-invalid={state.error ? true : undefined}
          className="field mt-1"
        />
      </label>
      {state.error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className={`${button({ tone: "gold" })} mt-6 w-full`}>
        Pay {amount}
      </button>
      <DemoNote className="mt-3">Demo: no prompt is sent, nothing is charged and your number isn&apos;t kept.</DemoNote>
    </form>
  );
}
