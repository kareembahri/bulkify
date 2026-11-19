'use client';
import { animate, useMotionValue, useReducedMotion, useTransform, motion } from 'framer-motion';
import { useEffect } from 'react';

/** A number that rolls to its new value with spring physics. */
export function RollingNumber({ value, format = (n) => String(Math.round(n)), className = '' }: {
  value: number; format?: (n: number) => string; className?: string;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => format(v));
  useEffect(() => {
    if (reduce) { mv.set(value); return; }
    const c = animate(mv, value, { type: 'spring', stiffness: 90, damping: 20, restDelta: 0.01 });
    return () => c.stop();
  }, [value, reduce, mv]);
  return <motion.span className={`num ${className}`} aria-label={format(value)}>{text}</motion.span>;
}
