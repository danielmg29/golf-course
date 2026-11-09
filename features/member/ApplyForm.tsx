"use client";

import { type FormEvent, useState } from "react";
import { Check } from "@/components/ui/icons";
import { DemoNote, ProgressLine } from "@/components/ui/primitives";
import { button } from "@/lib/variants";

const STEPS = ["Your name", "Your email", "Membership", "Sent"];

/** Shows the application's shape only. Nothing typed here leaves the page. */
export function ApplyForm({ tiers }: { tiers: string[] }) {
  const [sent, setSent] = useState(false);
  const [filled, setFilled] = useState({ name: false, email: false });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  // The fairway line as the application's progress: a step for each thing the club needs.
  const completed = [filled.name, filled.email, true, sent];
  const open = completed.indexOf(false);
  const progress = (
    <ProgressLine
      steps={STEPS}
      current={open === -1 ? STEPS.length - 1 : open}
      complete={open === -1}
      label="Your application"
      className="mb-10"
    />
  );

  if (sent) {
    return (
      <>
        {progress}
        <div role="status" className="py-4">
          <p className="flex items-center gap-3 font-display text-h2 font-light">
            <Check className="text-gold" /> That&apos;s how it would go
          </p>
          <p className="type-body mt-3 max-w-[44ch]">
            This is a demo, so nothing was sent or kept. In the live version, the membership secretary would reply within a week.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      {progress}
      <form
        onSubmit={submit}
        onInput={(event) => {
          const form = event.currentTarget;
          const name = form.elements.namedItem("name") as HTMLInputElement;
          const email = form.elements.namedItem("email") as HTMLInputElement;
          setFilled({ name: name.value.trim().length > 1, email: email.validity.valid && email.value.length > 0 });
        }}
        className="grid gap-6 sm:grid-cols-2"
      >
        <label className="block">
          <span className="type-label text-alabaster/80">Full name</span>
          <input required name="name" autoComplete="off" className="field mt-1" />
        </label>
        <label className="block">
          <span className="type-label text-alabaster/80">Email</span>
          <input required name="email" type="email" autoComplete="off" className="field mt-1" />
        </label>
        <label className="block">
          <span className="type-label text-alabaster/80">Membership</span>
          <select name="tier" className="field mt-1 [&>option]:bg-charcoal">
            {tiers.map((tier) => (
              <option key={tier}>{tier}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="type-label text-alabaster/80">Handicap, if you have one</span>
          <input name="handicap" inputMode="numeric" autoComplete="off" className="field mt-1" />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className={button({ tone: "gold" })}>
            Send application
          </button>
          <DemoNote className="mt-3">Demo: nothing you enter here is sent or kept.</DemoNote>
        </div>
      </form>
    </>
  );
}
