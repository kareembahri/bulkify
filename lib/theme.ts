'use client';
import { useEffect, useState } from 'react';
import { hueOf } from './targets';

/**
 * Concrete colours read from the current theme's CSS variables. Chart libraries
 * draw SVG attributes, which can't use var(), so charts take colours from here.
 * Updates when the theme changes.
 */
export type ThemeColors = {
  ink: string; muted: string; mutedSoft: string; grid: string; surface: string;
  protein: string; carbs: string; fat: string;
  status: (score: number) => string;
  ok: (good: boolean) => string;
};

function read(): ThemeColors {
  // On the server there is no document: fall back to the dark theme values.
  const s = typeof document === 'undefined' ? null : getComputedStyle(document.documentElement);
  const v = (n: string) => (s ? s.getPropertyValue(`--${n}`).trim() : '');
  const FALLBACK: Record<string, string> = { ink: '236 241 234', muted: '138 149 163', line: '255 255 255', surface: '14 18 25' };
  const rgb = (n: string, a = 1) => `rgba(${(v(n) || FALLBACK[n] || '128 128 128').split(/\s+/).join(',')},${a})`;
  const sat = v('st-s') || '85%';
  const lum = v('st-l') || '55%';
  const status = (score: number) => `hsl(${hueOf(score)}, ${sat}, ${lum})`;
  return {
    ink: rgb('ink'), muted: rgb('muted'), mutedSoft: rgb('muted', 0.5), grid: rgb('line', 0.08), surface: rgb('surface'),
    protein: v('m-protein') || '#1FA3D1', carbs: v('m-carbs') || '#74A80F', fat: v('m-fat') || '#9676FF',
    status, ok: (good) => status(good ? 1 : 0),
  };
}

export function useThemeColors() {
  const [c, setC] = useState<ThemeColors>(() => read());
  useEffect(() => {
    setC(read());
    const mo = new MutationObserver(() => setC(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);
  return c;
}
