import { describe, expect, it } from 'vitest';
import { caloriesBurned, CARDIO, CARDIO_KINDS, checkCardio, pace, runMet } from '../lib/cardio';
import { bmrOf } from '../lib/calculator';

const man = { sex: 'male' as const, age: 25, heightCm: 180, weightKg: 80 };
const woman = { sex: 'female' as const, age: 25, heightCm: 165, weightKg: 60 };

describe('cardio calories', () => {
  it('uses the person\'s own resting burn: MET × BMR/24 × hours', () => {
    const bmr = bmrOf('male', 80, 180, 25);                      // 1805
    expect(caloriesBurned({ kind: 'bike', intensity: 'moderate', minutes: 60 }, man)).toBe(Math.round(6.8 * bmr / 24));
    expect(caloriesBurned({ kind: 'bike', intensity: 'moderate', minutes: 30 }, man)).toBe(Math.round(6.8 * bmr / 48));
  });
  it('differs by body: a lighter, smaller person burns less for the same session', () => {
    const a = caloriesBurned({ kind: 'jump_rope', intensity: 'hard', minutes: 20 }, man);
    const b = caloriesBurned({ kind: 'jump_rope', intensity: 'hard', minutes: 20 }, woman);
    expect(b).toBeLessThan(a);
    expect(caloriesBurned({ kind: 'jump_rope', intensity: 'hard', minutes: 20 }, { ...man, age: 60 })).toBeLessThan(a);
  });
  it('harder is more, and every kind has rising intensities', () => {
    for (const k of Object.values(CARDIO)) { expect(k.easy).toBeLessThanOrEqual(k.moderate); expect(k.moderate).toBeLessThanOrEqual(k.hard); }
    expect(CARDIO_KINDS).toEqual(['run_outside', 'treadmill', 'incline_walk', 'bike', 'jump_rope']);
  });
});

describe('running outside', () => {
  it('MET grows with speed', () => {
    expect(runMet(5, 30)).toBeGreaterThan(9.8);         // 10 km/h sits between 9.8 and 10.5
    expect(runMet(5, 30)).toBeLessThan(10.5);
    expect(runMet(5, 25)).toBeGreaterThan(runMet(5, 30));
    expect(runMet(5, 60)).toBeLessThan(5);               // 5 km/h is walking
  });
  it('a 5 km run in 30 minutes for an 80 kg man is roughly 350–450 kcal', () => {
    const k = caloriesBurned({ kind: 'run_outside', minutes: 30, km: 5 }, man);
    expect(k).toBeGreaterThan(350);
    expect(k).toBeLessThan(450);
  });
  it('checks minutes, distance and pace', () => {
    expect(checkCardio({ kind: 'run_outside', minutes: 30, km: 5 })).toBeNull();
    expect(checkCardio({ kind: 'run_outside', minutes: 0, km: 5 })).toBe('minutes');
    expect(checkCardio({ kind: 'run_outside', minutes: 30, km: 0 })).toBe('km');
    expect(checkCardio({ kind: 'run_outside', minutes: 10, km: 8 })).toBe('speed');   // 48 km/h
    expect(checkCardio({ kind: 'bike', minutes: 45, intensity: 'easy' })).toBeNull();
    expect(caloriesBurned({ kind: 'incline_walk', intensity: 'moderate', minutes: 30 }, man)).toBeGreaterThan(0);
    expect(checkCardio({ kind: 'bike', minutes: 700 })).toBe('minutes');
  });
  it('formats pace per km', () => {
    expect(pace(5, 27.5)).toBe('5:30');
    expect(pace(0, 10)).toBeNull();
  });
});
