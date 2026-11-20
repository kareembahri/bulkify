/** Written, step-by-step exercise guides (English and Arabic) for every exercise. */
import { FULL } from './full';
import { LOWER } from './lower';
import { movementFor } from './match';
import { eqOf, type Guide, type G } from './text';
import { UPPER } from './upper';

export { movementFor } from './match';

export const GUIDES: Record<string, G> = { ...UPPER, ...LOWER, ...FULL };

type ExerciseLike = { slug?: string | null; name_en?: string | null; equipment: string; primary_muscle: string };
export type ExerciseGuide = { steps: string[]; tips: string[] };

/** The guide for an exercise in the given language. Always returns one (custom exercises match by name, then by muscle). */
export function guideFor(ex: ExerciseLike, locale: string): ExerciseGuide {
  const m = movementFor(ex);
  const one = m.hold === 'hand' || !!m.opts?.one;
  const g: Guide = (GUIDES[m.pattern] ?? GUIDES.squat)(m.opts ?? {}, eqOf(m.equip, one));
  const i = locale === 'ar' ? 1 : 0;
  return { steps: g.steps.map((l) => l[i]), tips: g.tips.map((l) => l[i]) };
}
