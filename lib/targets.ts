// Colour rules for "how close am I to my target?". Pure functions, unit-tested
// in tests/targets.test.ts.
//
// The target is the middle of a range: the minimum is 90 % of it and the
// maximum 110 %. A value is red at 0 and green between the minimum and the
// maximum. Past the maximum:
//   cut, maintain: back to red, fully red again at 135 % (too much is not good)
//   bulk:          stays green (eating more than planned is fine when bulking)
import { addDays, daysBetween } from './dates';

export type Mode = 'bulk' | 'cut' | 'maintain';

export const GREEN_FROM = 0.9;
export const GREEN_TO = 1.1;
export const RED_AT = 1.35;

/** Minimum and maximum around a daily target (the target is the middle). */
export function rangeOf(target: number | null | undefined): { min: number; max: number } | null {
  if (!target || target <= 0) return null;
  return { min: Math.round(target * GREEN_FROM), max: Math.round(target * GREEN_TO) };
}

/** 0 = fully red … 1 = fully green. Without a mode, going over is treated like a cut. */
export function score(ratio: number, mode?: Mode): number {
  if (!Number.isFinite(ratio) || ratio <= 0) return 0;
  if (ratio < GREEN_FROM) return ratio / GREEN_FROM;
  if (ratio <= GREEN_TO || mode === 'bulk') return 1;
  if (ratio >= RED_AT) return 0;
  return 1 - (ratio - GREEN_TO) / (RED_AT - GREEN_TO);
}

/** Inside the green zone. */
export const onTarget = (ratio: number, mode: Mode) => score(ratio, mode) >= 1;

export const ratioOf = (value: number, goal: number | null | undefined) => (goal && goal > 0 ? value / goal : 0);

/** Hue from red (0) through amber to green (135). */
export const hueOf = (s: number) => Math.round(Math.max(0, Math.min(1, s)) * 135);

/** CSS colour for a score. Saturation and lightness come from the theme (--st-s / --st-l). */
export const scoreColor = (s: number) => `hsl(${hueOf(s)} var(--st-s) var(--st-l))`;
/** Binary version: green when on target, red otherwise. */
export const okColor = (ok: boolean) => scoreColor(ok ? 1 : 0);

export type Targets = { kcal: number; protein: number; carbs: number | null; fat: number | null };
export type DayTotals = { date: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number };

/** A day is "on target" when both calories and protein are in the green zone. */
export function dayOnTarget(d: Pick<DayTotals, 'kcal' | 'protein_g'>, t: Targets, mode: Mode) {
  return onTarget(ratioOf(d.kcal, t.kcal), mode) && onTarget(ratioOf(d.protein_g, t.protein), mode);
}

export type MonthStatus = 'good' | 'bad' | 'none';
export type MonthSummary = { status: MonthStatus; onTarget: number; counted: number; logged: number };

/**
 * A month is good when at least half of its counted days were on target.
 * Counted days: from the later of the month start and `trackingStart` up to
 * yesterday (today counts only once it is already on target). Days in the
 * future or before tracking started are not counted.
 */
export function monthSummary(month: string, days: DayTotals[], t: Targets, mode: Mode, trackingStart: string, today: string): MonthSummary {
  const first = `${month}-01`;
  const last = `${month}-${daysInMonth(month)}`;
  const from = first > trackingStart ? first : trackingStart;
  const inMonth = days.filter((d) => d.date.startsWith(month));
  const logged = inMonth.length;
  const hit = new Set(inMonth.filter((d) => dayOnTarget(d, t, mode)).map((d) => d.date));
  const yesterday = addDays(today, -1);
  const to = last < yesterday ? last : yesterday;
  let counted = from <= to ? daysBetween(from, to) + 1 : 0;
  let onT = [...hit].filter((d) => d >= from && d <= to).length;
  if (today >= from && today <= last && hit.has(today)) { counted += 1; onT += 1; }
  if (counted === 0) return { status: 'none', onTarget: onT, counted, logged };
  return { status: onT / counted >= 0.5 ? 'good' : 'bad', onTarget: onT, counted, logged };
}

export const daysInMonth = (month: string) => {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m, 0).getDate();
};

export type MacroKey = 'kcal' | 'protein' | 'carbs' | 'fat';
export type RangeRow = { key: MacroKey; consumed: number; needed: number; ratio: number; ok: boolean };

/** Totals over a date range against (daily target × number of days). */
export function rangeSummary(days: DayTotals[], from: string, to: string, t: Targets, mode: Mode): { days: number; rows: RangeRow[] } {
  const n = from <= to ? daysBetween(from, to) + 1 : 0;
  const inRange = days.filter((d) => d.date >= from && d.date <= to);
  const sum = (k: keyof Omit<DayTotals, 'date'>) => inRange.reduce((s, d) => s + d[k], 0);
  const make = (key: MacroKey, consumed: number, daily: number | null): RangeRow => {
    const needed = (daily ?? 0) * n;
    const ratio = needed > 0 ? consumed / needed : 0;
    return { key, consumed, needed, ratio, ok: needed > 0 && onTarget(ratio, mode) };
  };
  return {
    days: n,
    rows: [
      make('kcal', sum('kcal'), t.kcal),
      make('protein', sum('protein_g'), t.protein),
      make('carbs', sum('carbs_g'), t.carbs),
      make('fat', sum('fat_g'), t.fat),
    ],
  };
}
