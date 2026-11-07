// The error pages' illustrations: SVG animated with SMIL, so they run with no script at all,
// which matters on a page that exists because something broke. Each draws its last frame twice:
// once animated, once still, and globals.css shows the still one under reduced motion.

const PAPER = "#f5f1e9";
const ANTIQUE = "#b89556";

/** A golf ball, shaded from the upper left, with a printed line that turns as it rolls. */
function Ball({ id, r = 13, spin }: { id: string; r?: number; spin?: { begin: string; dur: string; turns: number } }) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-shade`} cx="35%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#ece8dd" />
          <stop offset="100%" stopColor="#a9a596" />
        </radialGradient>
      </defs>
      <circle r={r} fill={`url(#${id}-shade)`} />
      <g>
        <path d={`M${-r * 0.8} 0 A ${r * 0.8} ${r * 0.3} 0 0 0 ${r * 0.8} 0`} fill="none" stroke={ANTIQUE} strokeWidth={1.4} />
        {spin ? (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to={String(360 * spin.turns)}
            begin={spin.begin}
            dur={spin.dur}
            fill="freeze"
            calcMode="spline"
            keyTimes="0;1"
            keySplines="0.2 0.6 0.35 1"
          />
        ) : null}
      </g>
    </g>
  );
}

/** 404: the putt runs at the cup, catches the lip, spins round it and stays out. */
export function LippedOut() {
  const roll =
    "M-60 282 C 100 286, 230 274, 300 252 C 330 242, 372 230, 404 236 C 434 242, 438 262, 404 266 C 368 270, 334 258, 346 246 C 362 230, 420 246, 476 266";
  // A beat at the start of the line before the ball sets off, held inside the motion itself so
  // the ball never waits anywhere else.
  const motion = {
    path: roll,
    dur: "3.9s",
    fill: "freeze",
    calcMode: "spline",
    keyTimes: "0;0.13;1",
    keyPoints: "0;0;1",
    keySplines: "0 0 1 1;0.15 0.55 0.3 1",
  } as const;
  return (
    <svg viewBox="0 0 720 320" role="img" aria-label="A putt rolls at the cup between two fours, lips out and stops beside it" className="block h-auto w-full">
      <text x={60} y={268} className="font-ui" fontSize={250} fontWeight={200} fill={PAPER}>
        4
      </text>
      <text x={520} y={268} className="font-ui" fontSize={250} fontWeight={200} fill={PAPER}>
        4
      </text>
      {/* The cup, seen low across the green: the zero. */}
      <ellipse cx={372} cy={248} rx={64} ry={20} fill="#06150f" />
      <path d="M308 248 A 64 20 0 0 1 436 248" fill="none" stroke="#e9e4d6" strokeWidth={5} />
      <ellipse cx={372} cy={250} rx={70} ry={24} fill="none" stroke={PAPER} strokeOpacity={0.18} />
      {/* The putt's line. */}
      <path d={roll} fill="none" stroke={ANTIQUE} strokeWidth={2} strokeDasharray="1 7" strokeLinecap="round" opacity={0.75} />

      <g data-art="moving">
        <g>
          <animateMotion {...motion} />
          <ellipse rx={15} ry={4} cx={4} cy={12} fill="#000" opacity={0.35} />
          <Ball id="lip" spin={{ begin: "0.5s", dur: "3.4s", turns: 9 }} />
        </g>
      </g>
      <g data-art="still" transform="translate(476 266)">
        <ellipse rx={15} ry={4} cx={4} cy={12} fill="#000" opacity={0.35} />
        <Ball id="lip-still" />
      </g>
    </svg>
  );
}

/** 500: the shot comes down in the pond; a splash, rings spreading, and a drop zone beside it. */
export function WaterHazard() {
  const flight = "M40 40 Q 250 -60, 400 228";
  const ring = (delay: number) => (
    <ellipse key={delay} cx={400} cy={232} rx={4} ry={1.2} fill="none" stroke={PAPER} strokeWidth={1.6} opacity={0}>
      <animate attributeName="rx" from="4" to="150" begin={`${1.7 + delay}s`} dur="2.6s" fill="freeze" />
      <animate attributeName="ry" from="1.2" to="30" begin={`${1.7 + delay}s`} dur="2.6s" fill="freeze" />
      <animate attributeName="opacity" values="0;0.8;0" keyTimes="0;0.15;1" begin={`${1.7 + delay}s`} dur="2.6s" fill="freeze" />
    </ellipse>
  );
  const drops = [-38, -16, 6, 24, 44];
  return (
    <svg viewBox="0 0 720 320" role="img" aria-label="A golf ball drops into a pond with a splash, the rings spreading, beside a drop zone sign" className="block h-auto w-full">
      <defs>
        <linearGradient id="pond" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3f6a68" />
          <stop offset="100%" stopColor="#173a3c" />
        </linearGradient>
      </defs>
      <ellipse cx={400} cy={236} rx={270} ry={52} fill="#163327" />
      <ellipse cx={400} cy={234} rx={250} ry={44} fill="url(#pond)" />
      <path d="M190 226 C 260 214, 330 210, 420 212" fill="none" stroke={PAPER} strokeOpacity={0.25} strokeWidth={2} />

      <g data-art="moving">
        <g>
          <animateMotion path={flight} dur="1.7s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.3 0 0.85 0.6" />
          <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.97;1" dur="1.7s" fill="freeze" />
          <Ball id="water" r={11} spin={{ begin: "0s", dur: "1.7s", turns: -3 }} />
        </g>
        {drops.map((dx, index) => (
          <circle key={dx} cx={400} cy={226} r={3 + (index % 2)} fill={PAPER} opacity={0}>
            <animate attributeName="cx" from="400" to={String(400 + dx * 1.6)} begin="1.7s" dur="0.9s" fill="freeze" />
            <animate attributeName="cy" values={`226;${190 - Math.abs(dx) * 0.6};236`} keyTimes="0;0.45;1" begin="1.7s" dur="0.9s" fill="freeze" />
            <animate attributeName="opacity" values="0;0.95;0" keyTimes="0;0.1;1" begin="1.7s" dur="0.9s" fill="freeze" />
          </circle>
        ))}
        {[0, 0.5, 1.0].map(ring)}
      </g>
      <g data-art="still">
        <ellipse cx={400} cy={232} rx={110} ry={22} fill="none" stroke={PAPER} strokeOpacity={0.35} strokeWidth={1.6} />
        <ellipse cx={400} cy={232} rx={60} ry={12} fill="none" stroke={PAPER} strokeOpacity={0.5} strokeWidth={1.6} />
      </g>

      {/* The drop zone: where you play your next one from. */}
      <g transform="translate(626 150)">
        <rect x={-2} y={0} width={4} height={96} fill={PAPER} />
        <rect x={-46} y={-4} width={92} height={40} fill={PAPER} />
        <text x={0} y={22} textAnchor="middle" className="font-ui" fontSize={13} fontWeight={700} fill="#102f25" letterSpacing={1}>
          DROP ZONE
        </text>
      </g>
    </svg>
  );
}

/** Global failure: the horn has gone and play is suspended; the flag snaps in the wind. */
export function PlaySuspended() {
  const flagStill = "M362 70 C 392 62, 420 80, 452 72 L 452 112 C 420 120, 392 102, 362 110 Z";
  const flagWave = [
    flagStill,
    "M362 70 C 394 82, 420 60, 452 76 L 452 116 C 420 100, 394 122, 362 110 Z",
    "M362 70 C 390 58, 422 86, 452 68 L 452 108 C 422 126, 390 98, 362 110 Z",
    flagStill,
  ].join(";");
  return (
    <svg viewBox="0 0 720 320" role="img" aria-label="A flag snapping in the wind beside the sound of the course horn" className="block h-auto w-full">
      <ellipse cx={360} cy={292} rx={210} ry={18} fill="#0b241b" />
      <rect x={358} y={66} width={4} height={226} fill={PAPER} />
      <path d={flagStill} fill={ANTIQUE}>
        <animate attributeName="d" values={flagWave} dur="1.6s" repeatCount="indefinite" />
      </path>
      {/* The horn: three blasts, spreading. */}
      {[0, 1, 2].map((index) => (
        <path
          key={index}
          d={`M${250 - index * 26} ${140 - index * 22} Q ${222 - index * 34} 180, ${250 - index * 26} ${220 + index * 22}`}
          fill="none"
          stroke={PAPER}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.25 + index * 0.2}
        >
          <animate attributeName="opacity" values="0.1;0.9;0.1" dur="1.8s" begin={`${index * 0.3}s`} repeatCount="indefinite" />
        </path>
      ))}
    </svg>
  );
}
