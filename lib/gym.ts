import type { SetRow, Workout } from './types';

/** Heaviest set; on a tie, the one with more reps. */
export const bestSet = <T extends Pick<SetRow, 'reps' | 'weight_kg'>>(sets: T[]): T | null =>
  sets.reduce<T | null>((b, s) => (!b || +s.weight_kg > +b.weight_kg || (+s.weight_kg === +b.weight_kg && s.reps > b.reps) ? s : b), null);

/** 1 = a beats b, -1 = b beats a, 0 = equal (weight first, then reps). */
export function compareSets(a: Pick<SetRow, 'reps' | 'weight_kg'> | null, b: Pick<SetRow, 'reps' | 'weight_kg'> | null) {
  if (!a && !b) return 0;
  if (!b) return 1;
  if (!a) return -1;
  if (+a.weight_kg !== +b.weight_kg) return +a.weight_kg > +b.weight_kg ? 1 : -1;
  return a.reps === b.reps ? 0 : a.reps > b.reps ? 1 : -1;
}

export type Verdict = 'better' | 'worse' | 'same' | 'new';
export type WeekRow = { exercise_id: string; prev: SetRow | null; cur: SetRow; verdict: Verdict };

/**
 * For every exercise trained in the week starting `weekStart` (Monday), its best
 * set against its best set the week before.
 */
export function compareWeeks(workouts: Workout[], weekStart: string, prevWeekStart: string, weekEnd: string): WeekRow[] {
  const best = (from: string, to: string) => {
    const m = new Map<string, SetRow>();
    for (const w of workouts) {
      if (w.date < from || w.date > to) continue;
      for (const e of w.exercises) {
        const b = bestSet(e.sets);
        if (b && compareSets(b, m.get(e.exercise_id) ?? null) > 0) m.set(e.exercise_id, b);
      }
    }
    return m;
  };
  const prevEnd = weekStart <= prevWeekStart ? prevWeekStart : dayBefore(weekStart);
  const prev = best(prevWeekStart, prevEnd);
  const cur = best(weekStart, weekEnd);
  return [...cur.entries()].map(([exercise_id, c]) => {
    const p = prev.get(exercise_id) ?? null;
    const cmp = compareSets(c, p);
    return { exercise_id, prev: p, cur: c, verdict: (!p ? 'new' : cmp > 0 ? 'better' : cmp < 0 ? 'worse' : 'same') as Verdict };
  });
}

const dayBefore = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const x = new Date(y, m - 1, d - 1);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

export type Lift = { date: string; exercise_id: string; weight_kg: number; reps: number; set_number: number };

/** The heaviest sets ever lifted (weight, then reps, then earliest date). */
export function topLifts(workouts: Workout[], n = 5): Lift[] {
  const all: Lift[] = [];
  for (const w of workouts) for (const e of w.exercises) for (const s of e.sets) {
    if (+s.weight_kg > 0) all.push({ date: w.date, exercise_id: e.exercise_id, weight_kg: +s.weight_kg, reps: s.reps, set_number: s.set_number });
  }
  all.sort((a, b) => b.weight_kg - a.weight_kg || b.reps - a.reps || a.date.localeCompare(b.date));
  return all.slice(0, n);
}
