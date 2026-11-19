'use client';
import { motion } from 'framer-motion';
import { useId } from 'react';
import { RollingNumber } from './RollingNumber';

type Props = {
  value: number;
  goal: number;
  color: string;          // any CSS colour, e.g. from scoreColor()
  size?: number;
  stroke?: number;
  label: string;
  unit?: string;
  sub?: React.ReactNode;
  format?: (n: number) => string;
};

/** Animated progress ring. Its colour comes from the target rules (red → green). */
export function Ring({ value, goal, color, size = 168, stroke = 14, label, unit, sub, format }: Props) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');   // safe inside url(#…)
  const r = (size - stroke) / 2;
  const pct = goal > 0 ? value / goal : 0;
  const shown = Math.min(pct, 1);
  const spring = { type: 'spring' as const, stiffness: 60, damping: 18, delay: 0.1 };
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} role="img"
      aria-label={`${label}: ${Math.round(value)} / ${Math.round(goal)}${unit ? ' ' + unit : ''}`}>
      {/* soft breathing halo in the status colour */}
      <div className="absolute inset-[12%] opacity-25">
        <div className="h-full w-full animate-breathe rounded-full transition-[background] duration-700" style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />
      </div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative -rotate-90 rtl:scale-x-[-1]">
        <defs>
          <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--line) / 0.08)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          filter={`url(#glow-${id})`} style={{ stroke: color, transition: 'stroke .7s ease' }}
          initial={{ pathLength: 0 }} animate={{ pathLength: Math.max(shown, 0.0001) }} transition={spring}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="label mb-0.5">{label}</div>
          <RollingNumber value={value} format={format} className="block font-display text-[clamp(1.5rem,7vw,2.1rem)] font-semibold leading-none" />
          {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
        </div>
      </div>
    </div>
  );
}
