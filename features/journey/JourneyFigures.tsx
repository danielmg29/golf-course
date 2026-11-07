import { findModelPage } from "@/lib/server-queries";

/** Holes, par and yards from the course's rows in the database, set as a scorecard row. */
export async function JourneyFigures() {
  const page = await findModelPage("hole", { pageSize: 18 });
  if (!page || page.rows.length === 0) {
    return <p className="text-sm text-ink/75">The course figures aren&apos;t available right now.</p>;
  }

  const figures = [
    { label: "Holes", value: String(page.rows.length) },
    { label: "Par", value: String(page.rows.reduce((total, hole) => total + hole.par, 0)) },
    { label: "Yards", value: page.rows.reduce((total, hole) => total + hole.yards, 0).toLocaleString("en-GB") },
  ];

  return (
    <dl className="grid grid-cols-3 divide-x divide-ink/20 border-y border-ink/20 py-4">
      {figures.map((figure) => (
        <div key={figure.label} className="px-3 first:pl-0">
          <dt className="type-figure text-[10px] uppercase text-ink/80">{figure.label}</dt>
          <dd className="type-figure mt-1 text-xl tracking-[0.12em] text-ink md:text-2xl">{figure.value}</dd>
        </div>
      ))}
    </dl>
  );
}
