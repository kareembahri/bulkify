'use client';
import { motion } from 'framer-motion';
import { useId } from 'react';
import { tick } from '@/lib/haptics';

/** Segmented control with a sliding pill (shared-layout animation). */
export function Segmented<T extends string>({ value, onChange, options, size = 'md', className = '', label }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[]; size?: 'sm' | 'md'; className?: string; label?: string;
}) {
  const id = useId();
  return (
    <div role="tablist" aria-label={label} className={`inline-flex rounded-2xl bg-[rgb(var(--line)/0.05)] p-1 border border-[rgb(var(--line)/0.08)] ${className}`}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => { tick(5); onChange(o.value); }}
            className={`relative flex-1 whitespace-nowrap rounded-xl font-medium transition-colors ${size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-10 px-4 text-sm'} ${active ? 'text-on-accent' : 'text-muted hover:text-ink'}`}
          >
            {active && <motion.span layoutId={`seg-${id}`} className="absolute inset-0 rounded-xl bg-accent" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
