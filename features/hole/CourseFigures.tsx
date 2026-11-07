import { Figures } from "@/components/ui/primitives";
import { findModelPage } from "@/lib/server-queries";

/** Holes, par and yards, added up from the course's rows in the database. */
export async function CourseFigures({ className }: { className?: string }) {
  const page = await findModelPage("hole", { pageSize: 18 });
  if (!page || page.rows.length === 0) return null;

  const par = page.rows.reduce((total, hole) => total + hole.par, 0);
  const yards = page.rows.reduce((total, hole) => total + hole.yards, 0);

  return (
    <Figures
      className={className}
      items={[
        { label: "Holes", value: String(page.rows.length) },
        { label: "Par", value: String(par) },
        { label: "Yards", value: yards.toLocaleString("en-GB") },
      ]}
    />
  );
}
