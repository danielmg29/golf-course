import type { ReactNode } from "react";
import { Crest } from "@/components/ui/primitives";

/**
 * Every error page, in the site's grammar: the club's mark, an illustration with some golf in
 * it, the code on the fairway line, and a heading that owns up and says what to do next.
 */
export function ErrorScene({
  code,
  name,
  title,
  body,
  art,
  actions,
  reference,
  mark = true,
}: {
  code: string;
  name: string;
  title: ReactNode;
  body: ReactNode;
  art: ReactNode;
  actions: ReactNode;
  /** An identifier the club can match to its logs, when there is one. */
  reference?: string;
  /** The club's mark at the top; off inside the site's layout, whose header already has it. */
  mark?: boolean;
}) {
  return (
    <main data-tone="dark" className="relative isolate flex min-h-svh flex-1 flex-col bg-forest text-paper">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_50%_100%,#1a4636_0%,#102f25_55%)]" />
      <div className={mark ? "frame flex flex-1 flex-col pb-10 pt-8" : "frame flex flex-1 flex-col pb-24 pt-28"}>
        {mark ? (
          <div className="flex justify-center">
            <Crest className="text-paper" />
          </div>
        ) : null}
        <div className="grid-swiss mt-10 flex-1 content-center gap-y-8 md:mt-14">
          <div className="col-span-full lg:col-span-8 lg:col-start-3">{art}</div>
          <div className="col-span-full lg:col-span-7 lg:col-start-3">
            <h1 className="font-display text-display-lg font-light [text-wrap:balance] [&_em]:italic">{title}</h1>
            <div className="mt-6 max-w-[48ch] font-ui text-lead text-paper/90">{body}</div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">{actions}</div>
          </div>
        </div>
        {/* The fairway line, and the code on it. */}
        <div className="mt-14">
          <span aria-hidden className="relative block h-px">
            <span className="absolute inset-0 bg-paper/25" />
            <span className="absolute -top-px left-0 h-[3px] w-[18%] bg-antique" />
          </span>
          <p className="type-meta mt-4 flex flex-wrap justify-between gap-x-8 gap-y-1 text-paper/85">
            <span>
              Error {code} · {name}
            </span>
            {reference ? <span>Reference {reference}</span> : null}
          </p>
        </div>
      </div>
    </main>
  );
}
