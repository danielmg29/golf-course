import { DemoNote } from "@/components/ui/primitives";
import type { Hole } from "@/lib/generated/schema";

function Nine({ title, holes }: { title: string; holes: Hole[] }) {
  const par = holes.reduce((total, hole) => total + hole.par, 0);
  const yards = holes.reduce((total, hole) => total + hole.yards, 0);

  return (
    <div>
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{title} nine scorecard</caption>
        <thead>
          <tr className="type-label border-b border-gold/50 text-gold">
            <th scope="col" className="w-12 pb-3 font-medium">Hole</th>
            <th scope="col" className="pb-3 font-medium">{title}</th>
            <th scope="col" className="w-12 pb-3 text-right font-medium">Par</th>
            <th scope="col" className="w-16 pb-3 text-right font-medium">Yards</th>
            <th scope="col" className="hidden w-12 pb-3 text-right font-medium sm:table-cell">Index</th>
          </tr>
        </thead>
        <tbody>
          {holes.map((hole) => (
            <tr key={hole.id} data-hole={hole.number} className="border-b border-alabaster/15 transition-colors duration-200 hover:bg-gold/10">
              <td className="py-3 text-sm tabular-nums text-alabaster/75">{hole.number}</td>
              <th scope="row" className="py-3 font-display text-xl font-normal leading-tight">{hole.name}</th>
              <td className="py-3 text-right">{hole.par}</td>
              <td className="py-3 text-right tabular-nums">{hole.yards}</td>
              <td className="hidden py-3 text-right text-sm tabular-nums text-alabaster/75 sm:table-cell">{hole.strokeIndex}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="type-label text-alabaster">
            <td className="pt-4" />
            <th scope="row" className="pt-4 text-left font-medium">Total</th>
            <td className="pt-4 text-right">{par}</td>
            <td className="pt-4 text-right tabular-nums">{yards.toLocaleString("en-GB")}</td>
            <td className="hidden pt-4 sm:table-cell" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/** Both nines, side by side, or one above the other with `stacked` (beside the course plan). */
export function Scorecard({ holes, stacked }: { holes: Hole[]; stacked?: boolean }) {
  if (holes.length === 0) {
    return (
      <p className="type-body max-w-[52ch] border-l border-gold/50 pl-5">
        The scorecard isn&apos;t available right now. It reads from the course database, so please try again shortly.
      </p>
    );
  }

  return (
    <>
      <div className={stacked ? "grid gap-12" : "grid gap-14 lg:grid-cols-2 lg:gap-20"}>
        <Nine title="Front" holes={holes.filter((hole) => hole.number <= 9)} />
        <Nine title="Back" holes={holes.filter((hole) => hole.number > 9)} />
      </div>
      <DemoNote className="mt-6">Sample course data, read from the database.</DemoNote>
    </>
  );
}
