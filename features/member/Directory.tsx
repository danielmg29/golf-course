"use client";

import { useState } from "react";
import { Search } from "@/components/ui/icons";
import { DemoNote } from "@/components/ui/primitives";
import { members, type Sector, sectors } from "@/features/member/data";
import { choice } from "@/lib/variants";
import { cn } from "@/lib/utils";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("");

/** The roadmap's member business directory, searchable by name, company or sector. */
export function Directory() {
  const [sector, setSector] = useState<Sector>("All");
  const [search, setSearch] = useState("");

  const needle = search.trim().toLowerCase();
  const shown = members.filter(
    (member) =>
      (sector === "All" || member.sector === sector) &&
      `${member.name} ${member.title} ${member.company}`.toLowerCase().includes(needle),
  );

  return (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Sector" className="flex flex-wrap gap-1.5">
          {sectors.map((candidate) => (
            <button
              key={candidate}
              type="button"
              aria-pressed={candidate === sector}
              onClick={() => setSector(candidate)}
              className={cn(choice({ selected: candidate === sector }), "type-label rounded-full border px-4 py-2.5")}
            >
              {candidate}
            </button>
          ))}
        </div>
        <label className="relative block lg:w-80">
          <span className="sr-only">Search members</span>
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gold" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or company"
            className="field pl-8"
          />
        </label>
      </div>

      {shown.length > 0 ? (
        <ul className="mt-10 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((member) => (
            <li key={member.name} className="flex gap-4 bg-charcoal p-5">
              <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/50 font-display text-lg text-gold">
                {initials(member.name)}
              </span>
              <span className="min-w-0">
                <span className="type-display block text-2xl leading-tight">{member.name}</span>
                <span className="mt-1 block text-sm text-alabaster/70">{member.title}, {member.company}</span>
                <span className="type-label mt-2 block text-gold">{member.sector}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="type-body mt-10">No members match that. Try another sector or a shorter search.</p>
      )}
      <DemoNote className="mt-4">Sample profiles of invented people. In the live version members opt in, and it sits behind sign-in.</DemoNote>
    </div>
  );
}
