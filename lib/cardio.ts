// Cardio: activities, their intensity (MET values from the Compendium of
// Physical Activities) and calories burned. Pure functions, unit-tested in
// tests/cardio.test.ts.
//
// Calories use the person's own resting burn instead of a generic one:
//   kcal = MET × (BMR ÷ 24) × hours
// BMR comes from Mifflin-St Jeor (sex, age, height, weight), so two people with
// the same weight but a different age, height or sex get different numbers.
// 1 MET is the resting burn, so this is the total burned during the activity.
import { bmrOf, type Sex } from './calculator';

export type Intensity = 'easy' | 'moderate' | 'hard';
export const INTENSITIES: Intensity[] = ['easy', 'moderate', 'hard'];

export type CardioKind = 'run_outside' | 'treadmill' | 'incline_walk' | 'bike' | 'jump_rope';

/** MET per intensity. `run_outside` uses distance and time instead (see runMet). */
export const CARDIO: Record<Exclude<CardioKind, 'run_outside'>, Record<Intensity, number>> = {
  treadmill:    { easy: 4.3, moderate: 8.3, hard: 11.0 },  // brisk walk · jog · fast run
  incline_walk: { easy: 4.5, moderate: 6.0, hard: 7.5 },   // walking uphill on a treadmill (estimate)
  bike:         { easy: 3.5, moderate: 6.8, hard: 8.8 },   // stationary bike
  jump_rope:    { easy: 8.8, moderate: 11.8, hard: 12.3 },
};

/** The sections shown when adding cardio, in order. */
export const CARDIO_GROUPS: { id: 'outdoor' | 'treadmill' | 'machines'; kinds: CardioKind[] }[] = [
  { id: 'outdoor', kinds: ['run_outside'] },
  { id: 'treadmill', kinds: ['treadmill', 'incline_walk'] },
  { id: 'machines', kinds: ['bike', 'jump_rope'] },
];
export const CARDIO_KINDS: CardioKind[] = CARDIO_GROUPS.flatMap((g) => g.kinds);

export const CARDIO_LIMITS = { minMinutes: 1, maxMinutes: 600, maxKm: 100, minKmh: 3, maxKmh: 25 } as const;

/** Running / walking MET by speed (km/h), linear between the points. */
const RUN_TABLE: [number, number][] = [
  [3.2, 2.8], [4.8, 3.5], [5.6, 4.3], [6.4, 6.0], [8.0, 8.3], [8.4, 9.0], [9.7, 9.8], [10.8, 10.5],
  [11.3, 11.0], [12.1, 11.5], [12.9, 11.8], [13.8, 12.3], [14.5, 12.8], [16.1, 14.5], [17.7, 16.0],
  [19.3, 19.0], [20.9, 19.8], [22.5, 23.0],
];

export function runMet(km: number, minutes: number): number {
  if (!(km > 0) || !(minutes > 0)) return 0;
  const kmh = km / (minutes / 60);
  if (kmh <= RUN_TABLE[0][0]) return RUN_TABLE[0][1];
  for (let i = 1; i < RUN_TABLE.length; i++) {
    const [x1, y1] = RUN_TABLE[i];
    if (kmh <= x1) {
      const [x0, y0] = RUN_TABLE[i - 1];
      return y0 + ((kmh - x0) / (x1 - x0)) * (y1 - y0);
    }
  }
  return RUN_TABLE[RUN_TABLE.length - 1][1];
}

export type Body = { sex: Sex; age: number; heightCm: number; weightKg: number };

/** kcal burned per hour at 1 MET for this person (their resting burn). */
export const restingPerHour = (b: Body) => Math.max(bmrOf(b.sex, b.weightKg, b.heightCm, b.age), 0) / 24;

export type CardioInput = { kind: CardioKind; minutes: number; intensity?: Intensity; km?: number | null };

export function metOf(i: CardioInput): number {
  if (i.kind === 'run_outside') return runMet(i.km ?? 0, i.minutes);
  return CARDIO[i.kind][i.intensity ?? 'moderate'];
}

/** Whole calories burned (0 when the input is not usable). */
export function caloriesBurned(i: CardioInput, b: Body): number {
  if (!(i.minutes > 0)) return 0;
  return Math.round(metOf(i) * restingPerHour(b) * (i.minutes / 60));
}

export type CardioError = 'minutes' | 'km' | 'speed';
/** Checks the form values; running outside also needs a believable pace. */
export function checkCardio(i: CardioInput): CardioError | null {
  if (!Number.isFinite(i.minutes) || i.minutes < CARDIO_LIMITS.minMinutes || i.minutes > CARDIO_LIMITS.maxMinutes) return 'minutes';
  if (i.kind === 'run_outside') {
    const km = i.km ?? 0;
    if (!Number.isFinite(km) || km <= 0 || km > CARDIO_LIMITS.maxKm) return 'km';
    const kmh = km / (i.minutes / 60);
    if (kmh < CARDIO_LIMITS.minKmh || kmh > CARDIO_LIMITS.maxKmh) return 'speed';
  }
  return null;
}

/** Pace as minutes per km, e.g. 5.5 → "5:30". */
export function pace(km: number, minutes: number): string | null {
  if (!(km > 0) || !(minutes > 0)) return null;
  const secs = Math.round((minutes * 60) / km);
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
}
