import { describe, expect, it } from 'vitest';
import { dayOnTarget, monthSummary, onTarget, rangeSummary, score } from '../lib/targets';

describe('score', () => {
  it('starts red at 0 and is green from 90 %', () => {
    expect(score(0, 'bulk')).toBe(0);
    expect(score(0.45, 'cut')).toBeCloseTo(0.5, 5);
    expect(score(0.9, 'maintain')).toBe(1);
    expect(score(1, 'cut')).toBe(1);
  });
  it('bulk stays green above the target', () => {
    expect(score(1.5, 'bulk')).toBe(1);
    expect(onTarget(2, 'bulk')).toBe(true);
  });
  it('cut and maintain turn red again when going over', () => {
    expect(score(1.1, 'cut')).toBe(1);
    expect(score(1.225, 'maintain')).toBeCloseTo(0.5, 5);
    expect(score(1.35, 'cut')).toBe(0);
    expect(score(2, 'maintain')).toBe(0);
    expect(onTarget(1.2, 'cut')).toBe(false);
  });
});

const T = { kcal: 2000, protein: 150, carbs: 200, fat: 60 };
const day = (date: string, kcal: number, protein_g: number) => ({ date, kcal, protein_g, carbs_g: 0, fat_g: 0 });

describe('days and months', () => {
  it('a day is on target when calories and protein are both green', () => {
    expect(dayOnTarget(day('2026-11-01', 2000, 150), T, 'cut')).toBe(true);
    expect(dayOnTarget(day('2026-11-01', 2000, 100), T, 'cut')).toBe(false);
    expect(dayOnTarget(day('2026-11-01', 2600, 150), T, 'cut')).toBe(false);
    expect(dayOnTarget(day('2026-11-01', 2600, 150), T, 'bulk')).toBe(true);
  });

  it('a month is good when at least half the counted days are on target', () => {
    const days = Array.from({ length: 15 }, (_, i) => day(`2026-10-${String(i + 1).padStart(2, '0')}`, 2000, 150));
    expect(monthSummary('2026-10', days, T, 'cut', '2026-01-01', '2026-11-19')).toMatchObject({ status: 'bad', onTarget: 15, counted: 31 });
    expect(monthSummary('2026-10', [...days, day('2026-10-16', 2000, 150)], T, 'cut', '2026-01-01', '2026-11-19').status).toBe('good');
  });

  it('only counts days since tracking started and up to yesterday', () => {
    const days = [day('2026-11-17', 2000, 150), day('2026-11-18', 2000, 150)];
    // tracking started on the 17th, today is the 19th → 2 counted days, both on target
    expect(monthSummary('2026-11', days, T, 'cut', '2026-11-17', '2026-11-19')).toMatchObject({ status: 'good', counted: 2, onTarget: 2 });
    // future month
    expect(monthSummary('2026-12', days, T, 'cut', '2026-11-17', '2026-11-19').status).toBe('none');
    // before tracking started
    expect(monthSummary('2026-09', days, T, 'cut', '2026-11-17', '2026-11-19').status).toBe('none');
  });
});

describe('rangeSummary', () => {
  it('compares totals to the daily target × days in the range', () => {
    const days = [day('2026-11-01', 2000, 150), day('2026-11-02', 1800, 140), day('2026-10-31', 9999, 999)];
    const r = rangeSummary(days, '2026-11-01', '2026-11-02', T, 'cut');
    expect(r.days).toBe(2);
    const kcal = r.rows.find((x) => x.key === 'kcal')!;
    expect(kcal.consumed).toBe(3800);
    expect(kcal.needed).toBe(4000);
    expect(kcal.ok).toBe(true);
    const carbs = r.rows.find((x) => x.key === 'carbs')!;
    expect(carbs.ok).toBe(false);
  });
});
