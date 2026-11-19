import { describe, expect, it } from 'vitest';
import { bmrOf, calculate, cmToFtIn, ftInToCm, kgToLb, lbToKg, validate, type RawForm } from '../lib/calculator';

const near = (actual: number, expected: number, tol = 1) => expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tol);

describe('calculate', () => {
  it('matches the reference case: male, 25 y, 75 kg, 178 cm, moderate, cut, normal', () => {
    const r = calculate({ sex: 'male', age: 25, weightKg: 75, heightCm: 178, activity: 'moderate', goal: 'cut', aggressiveness: 'normal' });
    expect(r.bmr).toBe(1742);   // 1742.5
    expect(r.tdee).toBe(2700);  // 2700.875
    expect(r.calories).toBe(2160);
    expect(r.protein).toBe(165);
    expect(r.fat).toBe(60);
    expect(r.carbs).toBe(240);
    expect(r.warnings).toEqual([]);
    // shares of calories add up to ~100 %
    near(r.pct.protein + r.pct.carbs + r.pct.fat, 100, 0.5);
    near(r.pct.protein, 30.6, 0.1);
  });

  it('uses Mifflin-St Jeor for both sexes', () => {
    expect(bmrOf('male', 80, 180, 30)).toBe(800 + 1125 - 150 + 5);
    expect(bmrOf('female', 60, 165, 30)).toBe(600 + 1031.25 - 150 - 161);
  });

  it('defaults aggressiveness to normal and applies mild factors', () => {
    const base = { sex: 'male' as const, age: 30, weightKg: 80, heightCm: 180, activity: 'active' as const };
    const tdee = bmrOf('male', 80, 180, 30) * 1.725;
    expect(calculate({ ...base, goal: 'cut' }).calories).toBe(Math.round((tdee * 0.8) / 10) * 10);
    expect(calculate({ ...base, goal: 'cut', aggressiveness: 'mild' }).calories).toBe(Math.round((tdee * 0.85) / 10) * 10);
    expect(calculate({ ...base, goal: 'bulk' }).calories).toBe(Math.round((tdee * 1.1) / 10) * 10);
    expect(calculate({ ...base, goal: 'bulk', aggressiveness: 'mild' }).calories).toBe(Math.round((tdee * 1.05) / 10) * 10);
    expect(calculate({ ...base, goal: 'maintain' }).calories).toBe(Math.round(tdee / 10) * 10);
  });

  it('uses the goal-specific protein and fat per kg', () => {
    const base = { sex: 'male' as const, age: 30, weightKg: 80, heightCm: 180, activity: 'moderate' as const };
    expect(calculate({ ...base, goal: 'bulk' })).toMatchObject({ protein: 144, fat: 80 });
    expect(calculate({ ...base, goal: 'maintain' })).toMatchObject({ protein: 144, fat: 72 });
    expect(calculate({ ...base, goal: 'cut' })).toMatchObject({ protein: 176, fat: 64 });
  });

  it('rounds calories to 10 and grams to whole numbers', () => {
    const r = calculate({ sex: 'female', age: 41, weightKg: 63.4, heightCm: 167.5, activity: 'light', goal: 'maintain' });
    expect(r.calories % 10).toBe(0);
    for (const g of [r.protein, r.carbs, r.fat]) expect(Number.isInteger(g)).toBe(true);
  });

  it('raises a too-low target to the safety floor and warns', () => {
    const f = calculate({ sex: 'female', age: 70, weightKg: 42, heightCm: 145, activity: 'sedentary', goal: 'cut' });
    expect(f.calories).toBe(1200);
    expect(f.warnings).toContain('floor');
    const m = calculate({ sex: 'male', age: 75, weightKg: 45, heightCm: 150, activity: 'sedentary', goal: 'cut' });
    expect(m.calories).toBe(1500);
    expect(m.warnings).toContain('floor');
  });

  it('keeps carbs at 50 g or more, lowering protein/fat or raising calories, and warns', () => {
    const r = calculate({ sex: 'female', age: 80, weightKg: 250, heightCm: 120, activity: 'sedentary', goal: 'cut' });
    expect(r.warnings).toContain('lowCarbs');
    expect(r.carbs).toBeGreaterThanOrEqual(50);
    expect(r.protein).toBeLessThan(550);
    expect(r.protein).toBeGreaterThanOrEqual(400);
    expect(r.calories % 10).toBe(0);
    expect(r.protein * 4 + r.fat * 9 + r.carbs * 4).toBeLessThanOrEqual(r.calories + 4);
  });

  it('only lowers protein/fat when that is enough', () => {
    // borderline: heavy and short on a cut; lowering protein/fat covers the gap
    const r = calculate({ sex: 'male', age: 60, weightKg: 150, heightCm: 150, activity: 'sedentary', goal: 'cut' });
    expect(r.warnings).toContain('lowCarbs');
    expect(r.warnings).not.toContain('raisedCalories');
    expect(r.carbs).toBeGreaterThanOrEqual(50);
    expect(r.calories).toBe(Math.round((bmrOf('male', 150, 150, 60) * 1.2 * 0.8) / 10) * 10);
  });

  it('warns under-18s, with a doctor warning when cutting', () => {
    const base = { sex: 'male' as const, age: 16, weightKg: 65, heightCm: 172, activity: 'active' as const };
    expect(calculate({ ...base, goal: 'cut' }).warnings).toContain('minorCut');
    expect(calculate({ ...base, goal: 'bulk' }).warnings).toContain('minor');
    expect(calculate({ ...base, age: 18, goal: 'cut' }).warnings).not.toContain('minorCut');
  });
});

describe('units', () => {
  it('converts lb and ft/in', () => {
    expect(lbToKg(100)).toBeCloseTo(45.36, 5);
    expect(kgToLb(45.36)).toBeCloseTo(100, 5);
    expect(ftInToCm(5, 10)).toBeCloseTo(177.8, 5);
    expect(cmToFtIn(177.8)).toEqual({ ft: 5, inch: 10 });
  });
});

describe('validate', () => {
  const ok: RawForm = { sex: 'male', age: '25', weight: '75', weightUnit: 'kg', height: '178', heightFt: '', heightIn: '', heightUnit: 'cm',
    activity: 'moderate', goal: 'cut', aggressiveness: 'normal' };

  it('accepts a complete form', () => {
    const v = validate(ok);
    expect(v.errors).toEqual({});
    expect(v.input).toEqual({ sex: 'male', age: 25, weightKg: 75, heightCm: 178, activity: 'moderate', goal: 'cut', aggressiveness: 'normal' });
  });

  it('flags empty, non-numeric, negative and out-of-range values', () => {
    expect(validate({ ...ok, sex: '', activity: '', goal: '' }).errors).toEqual({ sex: 'required', activity: 'required', goal: 'required' });
    expect(validate({ ...ok, age: '' }).errors.age).toBe('required');
    expect(validate({ ...ok, age: 'abc' }).errors.age).toBe('notNumber');
    expect(validate({ ...ok, age: '25.5' }).errors.age).toBe('notNumber');
    expect(validate({ ...ok, age: '-3' }).errors.age).toBe('negative');
    expect(validate({ ...ok, age: '13' }).errors.age).toBe('range');
    expect(validate({ ...ok, age: '81' }).errors.age).toBe('range');
    expect(validate({ ...ok, weight: '29' }).errors.weight).toBe('range');
    expect(validate({ ...ok, weight: '251' }).errors.weight).toBe('range');
    expect(validate({ ...ok, height: '119' }).errors.height).toBe('range');
    expect(validate({ ...ok, height: '231' }).errors.height).toBe('range');
    expect(validate({ ...ok, weight: '-70' }).errors.weight).toBe('negative');
    expect(validate({ ...ok, age: '' }).input).toBeNull();
  });

  it('converts lb and ft/in before checking ranges', () => {
    const v = validate({ ...ok, weight: '165', weightUnit: 'lb', heightUnit: 'ftin', heightFt: '5', heightIn: '10' });
    expect(v.input?.weightKg).toBeCloseTo(74.8, 1);
    expect(v.input?.heightCm).toBeCloseTo(177.8, 1);
    expect(validate({ ...ok, weight: '60', weightUnit: 'lb' }).errors.weight).toBe('range');      // 27 kg
    expect(validate({ ...ok, heightUnit: 'ftin', heightFt: '5', heightIn: '12' }).errors.height).toBe('range');
    expect(validate({ ...ok, heightUnit: 'ftin', heightFt: '', heightIn: '5' }).errors.height).toBe('required');
  });
});
