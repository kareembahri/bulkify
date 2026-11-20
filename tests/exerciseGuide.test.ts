import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GUIDES, guideFor, movementFor } from '../lib/guides/index';

const seed = readFileSync(new URL('../supabase/migrations/010_seed_exercises.sql', import.meta.url), 'utf8');
const rows = [...seed.matchAll(/\('([a-z0-9-]+)','((?:[^']|'')*)','(?:[^']|'')*','([a-z_]+)',(?:array\[[^\]]*\]|'\{\}')::text\[\],'([a-z_]+)'\)/g)]
  .map((m) => ({ slug: m[1], name_en: m[2], primary_muscle: m[3], equipment: m[4] }));

describe('exercise guides', () => {
  it('reads all built-in exercises', () => {
    expect(rows.length).toBe(592);
  });

  it('matches every built-in exercise to a written guide', () => {
    for (const ex of rows) {
      const m = movementFor(ex);
      expect(m.matched).toBe(true);
      expect(typeof GUIDES[m.pattern]).toBe('function');
    }
  });

  it('gives clean step-by-step text in English and Arabic for every exercise', () => {
    for (const ex of rows) {
      for (const locale of ['en', 'ar']) {
        const g = guideFor(ex, locale);
        expect(g.steps.length).toBeGreaterThanOrEqual(3);
        for (const line of [...g.steps, ...g.tips]) {
          expect(line.trim().length).toBeGreaterThan(5);
          expect(/undefined|NaN|\$\{/.test(line)).toBe(false);
        }
      }
    }
  });

  it('writes the Arabic guide in Arabic', () => {
    const g = guideFor({ slug: 'barbell-back-squat', equipment: 'barbell', primary_muscle: 'quads' }, 'ar');
    expect(/[؀-ۿ]/.test(g.steps[0])).toBe(true);
    expect(/[a-z]{4,}/i.test(g.steps.join(' '))).toBe(false);
  });

  it('adapts the guide to the equipment and variation', () => {
    const incline = guideFor({ slug: 'incline-dumbbell-press', equipment: 'dumbbell', primary_muscle: 'chest' }, 'en');
    expect(incline.steps[0]).toContain('incline');
    expect(incline.steps.join(' ')).toContain('dumbbells');
    const oneArm = guideFor({ slug: 'single-arm-cable-lateral-raise', equipment: 'cable', primary_muscle: 'shoulders' }, 'en');
    expect(oneArm.steps.join(' ')).toContain('your arm out');
  });

  it('still finds a guide for exercises people add themselves', () => {
    expect(movementFor({ name_en: 'My Cable Lateral Raise', equipment: 'cable', primary_muscle: 'shoulders' }).pattern).toBe('lateralRaise');
    const unknown = guideFor({ name_en: 'Zzz thing', equipment: 'other', primary_muscle: 'biceps' }, 'en');
    expect(unknown.steps.length).toBeGreaterThanOrEqual(3);
  });
});
