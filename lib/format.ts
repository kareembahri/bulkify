'use client';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import { fromISO } from './dates';

/** Locale-aware formatting. Arabic UI keeps Latin digits so numbers stay readable. */
export function useFmt() {
  const locale = useLocale();
  return useMemo(() => {
    const ar = locale === 'ar';
    const tag = ar ? 'ar-LB-u-nu-latn' : 'en-GB';
    const nf0 = new Intl.NumberFormat(tag, { maximumFractionDigits: 0 });
    const nf1 = new Intl.NumberFormat(tag, { maximumFractionDigits: 1 });
    const date = (s: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(tag, o).format(fromISO(s));
    return {
      locale,
      ar,
      dir: (ar ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
      n0: (x: number) => nf0.format(Math.round(x)),
      n1: (x: number) => nf1.format(x),
      kg: (x: number) => `${nf1.format(x)} ${ar ? 'كغ' : 'kg'}`,
      g: (x: number) => `${nf0.format(Math.round(x))}${ar ? ' غ' : 'g'}`,
      unit: (u: 'g' | 'ml') => (ar ? (u === 'g' ? 'غ' : 'مل') : u),
      dayLong: (s: string) => date(s, { weekday: 'long', day: 'numeric', month: 'long' }),
      dayShort: (s: string) => date(s, { weekday: 'short', day: 'numeric', month: 'short' }),
      dayMonth: (s: string) => date(s, { day: 'numeric', month: 'short' }),
      dayMonthYear: (s: string) => date(s, { day: 'numeric', month: 'short', year: 'numeric' }),
      dayFull: (s: string) => date(s, { day: 'numeric', month: 'long', year: 'numeric' }),
      weekday: (s: string) => date(s, { weekday: 'long' }),
      weekdayShort: (s: string) => date(s, { weekday: 'short' }),
      month: (s: string) => date(s, { month: 'long', year: 'numeric' }),
      monthShort: (s: string) => date(s, { month: 'short' }),
      /** weekday name for 0 = Monday … 6 = Sunday */
      weekdayName: (i: number, style: 'long' | 'short' = 'long') => date(`2024-01-0${i + 1}`, { weekday: style }),
    };
  }, [locale]);
}
