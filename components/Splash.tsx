'use client';
import { motion } from 'framer-motion';
import { Mark } from './ui/Brand';

/** Launch screen shown while the session and profile load. */
export function Splash() {
  return (
    <div className="fixed inset-0 grid place-items-center" aria-busy="true" aria-label="Bulkify">
      <motion.div className="flex flex-col items-center gap-5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <motion.div className="relative" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
          <div className="absolute inset-0 rounded-3xl bg-accent/30 blur-2xl" />
          <Mark className="relative size-20" />
        </motion.div>
        <span dir="ltr" className="font-display text-2xl font-semibold tracking-[-0.04em]">Bulk<span className="text-accent">ify</span></span>
        <div className="h-0.5 w-24 overflow-hidden rounded-full bg-[rgb(var(--line)/0.1)]">
          <motion.div className="h-full w-1/2 rounded-full bg-accent" animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
      </motion.div>
    </div>
  );
}
