// The fairway line as a network: from you, through the ways to join, out to the people and the
// benefits each one connects you with. Drawn once as you reach it; it says nothing a list doesn't,
// so it's hidden from screen readers and the tiers beside it carry the content.

const CENTRE = 50;
const INNER = 19;
const OUTER = 34;

const around = (count: number, radius: number, turn: number) =>
  Array.from({ length: count }, (_, index) => {
    const angle = turn + (index / count) * Math.PI * 2;
    return [CENTRE + Math.cos(angle) * radius, CENTRE + Math.sin(angle) * radius] as const;
  });

export function ConnectionNetwork({ tiers, links }: { tiers: string[]; links: string[] }) {
  const inner = around(tiers.length, INNER, -Math.PI / 2 + Math.PI / tiers.length);
  const outer = around(links.length, OUTER, -Math.PI / 2);
  // Each way to join reaches the two or three people and benefits nearest it.
  const reach = tiers.flatMap((_, index) => {
    const [x, y] = inner[index];
    return outer
      .map((point, target) => ({ target, distance: Math.hypot(point[0] - x, point[1] - y) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .map(({ target }) => [index, target] as const);
  });
  const curve = (from: readonly [number, number], to: readonly [number, number]) => {
    // Bow each line gently towards the centre, so the web reads as drawn, not plotted.
    const mx = (from[0] + to[0]) / 2;
    const my = (from[1] + to[1]) / 2;
    return `M${from[0].toFixed(2)} ${from[1].toFixed(2)} Q ${(mx + (CENTRE - mx) * 0.18).toFixed(2)} ${(my + (CENTRE - my) * 0.18).toFixed(2)}, ${to[0].toFixed(2)} ${to[1].toFixed(2)}`;
  };

  return (
    <figure aria-hidden data-draw-scope className="relative">
      <svg viewBox="0 0 100 100" className="block h-auto w-full overflow-visible">
        {reach.map(([tier, target], index) => (
          <path
            key={`${tier}-${target}`}
            data-draw
            data-delay={0.5 + index * 0.04}
            d={curve(inner[tier], outer[target])}
            fill="none"
            pathLength={1}
            strokeDasharray={1}
            className="stroke-current opacity-40 [stroke-width:0.25]"
          />
        ))}
        {inner.map((point, index) => (
          <path
            key={tiers[index]}
            data-draw
            data-delay={index * 0.08}
            d={`M${CENTRE} ${CENTRE} L ${point[0].toFixed(2)} ${point[1].toFixed(2)}`}
            fill="none"
            pathLength={1}
            strokeDasharray={1}
            className="stroke-gold [stroke-width:0.45]"
          />
        ))}
        {outer.map((point, index) => (
          <g key={links[index]}>
            <circle cx={point[0]} cy={point[1]} r={0.9} className="fill-current" />
            <text
              x={point[0] + (point[0] >= CENTRE ? 2 : -2)}
              y={point[1] + 0.9}
              textAnchor={point[0] >= CENTRE ? "start" : "end"}
              className="halo fill-current font-ui text-[3.6px] font-semibold md:text-[2.6px]"
            >
              {links[index]}
            </text>
          </g>
        ))}
        {inner.map((point, index) => (
          <g key={tiers[index]}>
            <circle cx={point[0]} cy={point[1]} r={1.5} className="fill-gold" />
            {/* Set just outside its node, away from the centre, so it clears the lines in. */}
            <text
              x={point[0] + (point[0] >= CENTRE ? 2.6 : -2.6)}
              y={point[1] + (point[1] >= CENTRE ? 5 : -2.8)}
              textAnchor={point[0] >= CENTRE ? "start" : "end"}
              className="halo fill-gold font-ui text-[3.8px] font-bold md:text-[2.9px]"
            >
              {tiers[index]}
            </text>
          </g>
        ))}
        <rect x={CENTRE - 2.2} y={CENTRE - 2.2} width={4.4} height={4.4} className="fill-gold" />
        <text x={CENTRE} y={CENTRE + 6.4} textAnchor="middle" className="halo fill-current font-ui text-[3.6px] font-semibold md:text-[2.6px]">
          You
        </text>
      </svg>
    </figure>
  );
}
