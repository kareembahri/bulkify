'use client';
import { exportEverything } from './data';
import type { Exercise, Food } from './types';

const csvCell = (v: unknown) => {
  const s = v == null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCSV = (rows: (string | number | boolean | null)[][]) => '﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n');

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const stamp = () => new Date().toISOString().slice(0, 10);

export async function exportJSON() {
  const data = await exportEverything();
  download(`bulkify-backup-${stamp()}.json`, JSON.stringify(data, null, 2), 'application/json');
}

/** One row per set. */
export async function exportWorkoutsCSV(exercises: Map<string, Exercise>) {
  const { workouts } = await exportEverything();
  const rows: (string | number | null)[][] = [['date', 'workout', 'exercise', 'exercise_ar', 'muscle', 'set', 'reps', 'weight_kg', 'note']];
  for (const w of workouts) for (const e of w.exercises) {
    const x = exercises.get(e.exercise_id);
    for (const s of e.sets) rows.push([w.date, w.day_name, x?.name_en ?? e.exercise_id, x?.name_ar ?? '', x?.primary_muscle ?? '', s.set_number, s.reps, s.weight_kg, e.note]);
  }
  download(`bulkify-workouts-${stamp()}.csv`, toCSV(rows), 'text/csv;charset=utf-8');
}

/** One row per food entry. */
export async function exportMealsCSV(foods: Map<string, Food>) {
  const { meals } = await exportEverything();
  const rows: (string | number | boolean | null)[][] = [['date', 'meal', 'food', 'food_ar', 'amount', 'kcal', 'protein_g', 'carbs_g', 'fat_g']];
  for (const m of meals) for (const i of m.bulkify_meal_items ?? []) {
    const fd = i.food_id ? foods.get(i.food_id) : undefined;
    rows.push([m.date, m.name, fd?.name_en ?? i.label ?? '', fd?.name_ar ?? '', i.amount, i.kcal, i.protein_g, i.carbs_g, i.fat_g]);
  }
  download(`bulkify-meals-${stamp()}.csv`, toCSV(rows), 'text/csv;charset=utf-8');
}
