// Background: a calm dark canvas with a heart-rate line whose glowing pulse
// keeps travelling across the screen, and slow layered waves flowing along
// the bottom. Only transforms and one small SVG stroke animate, so it stays
// smooth on phones. Static when the device asks for reduced motion.

const W = 1440;   // one screen-width of wave
const H = 240;

/**
 * One continuous wave two screens wide (`n` periods per screen), filled down to
 * the bottom. Sliding it left by half its width loops with no seam.
 */
function wave(n: number, amp: number, y: number) {
  const p = W / n;
  let d = `M 0 ${H} L 0 ${y} Q ${p / 4} ${y - amp} ${p / 2} ${y} T ${p} ${y}`;
  for (let i = 2; i <= n * 2; i++) d += ` T ${p * i} ${y}`;
  return `${d} L ${W * 2} ${H} Z`;
}

/** Heart-rate trace: flat line with a beat every 360 px. */
const BEAT = (x: number) =>
  `L ${x + 120} 60 L ${x + 138} 48 L ${x + 152} 66 L ${x + 166} 14 L ${x + 182} 100 L ${x + 198} 52 L ${x + 212} 60`;
const ECG = `M 0 60 ${[0, 360, 720, 1080].map(BEAT).join(' ')} L 1440 60`;

const LAYERS = [
  { d: wave(2, 26, 120), color: 'var(--accent)', a: 0.1, dur: 38, rev: false, h: 'h-[34vh]' },
  { d: wave(3, 18, 150), color: 'var(--cyan)', a: 0.08, dur: 52, rev: true, h: 'h-[28vh]' },
  { d: wave(4, 12, 175), color: 'var(--accent)', a: 0.06, dur: 70, rev: false, h: 'h-[22vh]' },
];

export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      {/* soft light from the top and a cool glow at the bottom */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(120% 60% at 50% -10%, rgb(var(--accent) / calc(.10 * var(--aurora-o))), transparent 60%), radial-gradient(90% 50% at 50% 110%, rgb(var(--cyan) / calc(.10 * var(--aurora-o))), transparent 70%)',
      }} />

      {/* heart-rate line with a travelling pulse */}
      <svg className="absolute inset-x-0 top-[30%] h-[120px] w-full" viewBox={`0 0 ${W} 120`} preserveAspectRatio="xMidYMid slice">
        <path d={ECG} fill="none" strokeWidth="1.5" vectorEffect="non-scaling-stroke" style={{ stroke: 'rgb(var(--line) / 0.07)' }} />
        <path d={ECG} fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          vectorEffect="non-scaling-stroke" pathLength={1} className="bg-pulse"
          style={{ stroke: 'rgb(var(--accent))', filter: 'drop-shadow(0 0 6px rgb(var(--accent) / .8))', opacity: 'calc(.55 * var(--aurora-o) + .2)' }} />
      </svg>

      {/* flowing waves */}
      {LAYERS.map((l, i) => (
        <div key={i} className={`absolute inset-x-0 bottom-0 overflow-hidden ${l.h}`}>
          <svg className="bg-wave h-full w-[200%]" viewBox={`0 0 ${W * 2} ${H}`} preserveAspectRatio="none"
            style={{ animationDuration: `${l.dur}s`, animationDirection: l.rev ? 'reverse' : 'normal' }}>
            <defs>
              <linearGradient id={`wg${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: `rgb(${l.color})`, stopOpacity: l.a * 2.2 }} />
                <stop offset="1" style={{ stopColor: `rgb(${l.color})`, stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <path d={l.d} fill={`url(#wg${i})`} style={{ opacity: 'var(--aurora-o)' }} />
          </svg>
        </div>
      ))}
    </div>
  );
}
