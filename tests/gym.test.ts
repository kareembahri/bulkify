import { describe, expect, it } from 'vitest';
import { bestSet, compareWeeks, topLifts } from '../lib/gym';
import type { Workout } from '../lib/types';

const W = (date: string, exercise_id: string, sets: [number, number][]): Workout => ({
  id: date + exercise_id, date, day_name: 'Push',
  exercises: [{ id: 'we' + date + exercise_id, exercise_id, note: '', position: 0, sets: sets.map(([kg, reps], i) => ({ set_number: i + 1, reps, weight_kg: kg })) }],
});

describe('gym', () => {
  it('best set is the heaviest, then most reps', () => {
    expect(bestSet([{ reps: 8, weight_kg: 60 }, { reps: 5, weight_kg: 70 }, { reps: 6, weight_kg: 70 }])).toEqual({ reps: 6, weight_kg: 70 });
    expect(bestSet([])).toBeNull();
  });

  it('compares this week with the week before, per exercise', () => {
    const ws = [
      W('2026-11-09', 'bench', [[60, 8]]), W('2026-11-10', 'squat', [[100, 5]]), W('2026-11-11', 'row', [[50, 10]]),
      W('2026-11-16', 'bench', [[65, 6]]), W('2026-11-17', 'squat', [[95, 5]]), W('2026-11-18', 'row', [[50, 10]]), W('2026-11-19', 'curl', [[20, 12]]),
    ];
    const rows = compareWeeks(ws, '2026-11-16', '2026-11-09', '2026-11-22');
    const v = Object.fromEntries(rows.map((r) => [r.exercise_id, r.verdict]));
    expect(v).toEqual({ bench: 'better', squat: 'worse', row: 'same', curl: 'new' });
  });

  it('lists the top 5 heaviest sets with their set number', () => {
    const ws = [W('2026-11-01', 'deadlift', [[100, 5], [110, 3], [120, 1]]), W('2026-11-02', 'squat', [[90, 5], [100, 5], [100, 3]])];
    const top = topLifts(ws);
    expect(top.length).toBe(5);
    expect(top[0]).toEqual({ date: '2026-11-01', exercise_id: 'deadlift', weight_kg: 120, reps: 1, set_number: 3 });
    expect(top.map((x) => x.weight_kg)).toEqual([120, 110, 100, 100, 100]);
    expect(top[2]).toMatchObject({ exercise_id: 'deadlift', reps: 5, set_number: 1 }); // same weight and reps: earlier date first
    expect(top[3]).toMatchObject({ exercise_id: 'squat', reps: 5, set_number: 2 });
  });
});
