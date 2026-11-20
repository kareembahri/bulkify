'use client';
import { must, sb } from './supabase';
import type { CardioEntry, DayNutrition, Exercise, Food, Meal, MealItem, MealKind, ProgramDay, SetRow, WeighIn, Workout } from './types';

// ─── helpers ────────────────────────────────────────────────────────────────
async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: unknown; error: { message: string } | null }>) {
  const out: T[] = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    const rows = must(await build(from, from + page - 1)) as T[];
    out.push(...rows);
    if (rows.length < page) return out;
  }
}
const num = (x: unknown) => (x == null ? 0 : Number(x));

// ─── catalog ────────────────────────────────────────────────────────────────
export const loadExercises = () =>
  fetchAll<Exercise>((a, b) => sb().from('bulkify_exercises')
    .select('id,owner_id,slug,name_en,name_ar,primary_muscle,secondary_muscles,equipment').order('name_en').range(a, b));

export const loadFoods = () =>
  fetchAll<Food>((a, b) => sb().from('bulkify_foods')
    .select('id,owner_id,category_no,category,name_en,name_ar,basis_amount,basis_unit,kcal,protein_g,carbs_g,fat_g,note')
    .order('category_no').order('name_en').range(a, b))
    .then((rows) => rows.map((f) => ({ ...f, basis_amount: num(f.basis_amount), kcal: num(f.kcal), protein_g: num(f.protein_g),
      carbs_g: num(f.carbs_g), fat_g: num(f.fat_g) })));

export async function addCustomExercise(userId: string, e: Pick<Exercise, 'name_en' | 'name_ar' | 'primary_muscle' | 'equipment'>) {
  return must(await sb().from('bulkify_exercises').insert({ ...e, owner_id: userId, secondary_muscles: [] })
    .select('id,owner_id,slug,name_en,name_ar,primary_muscle,secondary_muscles,equipment').single()) as Exercise;
}
export async function deleteCustomExercise(id: string) { must(await sb().from('bulkify_exercises').delete().eq('id', id)); }

export async function saveMyFood(userId: string, f: { name: string; amount: number; unit: 'g' | 'ml'; kcal: number; protein_g: number; carbs_g: number; fat_g: number }) {
  return must(await sb().from('bulkify_foods').insert({
    owner_id: userId, category_no: 0, category: 'My foods', name_en: f.name, name_ar: f.name,
    basis_amount: f.amount > 0 ? f.amount : 1, basis_unit: f.unit, kcal: f.kcal, protein_g: f.protein_g, carbs_g: f.carbs_g, fat_g: f.fat_g,
  }).select('id').single());
}
export async function deleteMyFood(id: string) { must(await sb().from('bulkify_foods').delete().eq('id', id)); }

// ─── cardio ─────────────────────────────────────────────────────────────────
const CARDIO_COLS = 'id,date,kind,intensity,minutes,distance_km,kcal';
const cardioRow = (r: CardioEntry): CardioEntry => ({ ...r, minutes: num(r.minutes), kcal: num(r.kcal), distance_km: r.distance_km == null ? null : num(r.distance_km) });
export async function loadCardio(from: string, to: string = from): Promise<CardioEntry[]> {
  const rows = must(await sb().from('bulkify_cardio').select(CARDIO_COLS).gte('date', from).lte('date', to)
    .order('date').order('created_at')) as CardioEntry[];
  return rows.map(cardioRow);
}
export async function addCardio(e: Omit<CardioEntry, 'id'>) {
  return cardioRow(must(await sb().from('bulkify_cardio').insert(e).select(CARDIO_COLS).single()) as CardioEntry);
}
export async function deleteCardio(id: string) { must(await sb().from('bulkify_cardio').delete().eq('id', id)); }

// ─── weekly program ─────────────────────────────────────────────────────────
export async function loadProgram(): Promise<ProgramDay[]> {
  const rows = must(await sb().from('bulkify_program_days')
    .select('id,weekday,day_name,is_rest,bulkify_program_exercises(exercise_id,position)').order('weekday')) as any[];
  return rows.map((r) => ({
    id: r.id, weekday: r.weekday, day_name: r.day_name, is_rest: r.is_rest,
    exercise_ids: [...(r.bulkify_program_exercises ?? [])].sort((a: any, b: any) => a.position - b.position).map((x: any) => x.exercise_id),
  }));
}
export async function updateProgramDay(id: string, patch: Partial<Pick<ProgramDay, 'day_name' | 'is_rest'>>) {
  must(await sb().from('bulkify_program_days').update(patch).eq('id', id));
}
export async function setProgramExercises(dayId: string, ids: string[]) {
  must(await sb().from('bulkify_program_exercises').delete().eq('program_day_id', dayId));
  if (ids.length) must(await sb().from('bulkify_program_exercises').insert(ids.map((exercise_id, position) => ({ program_day_id: dayId, exercise_id, position }))));
}

// ─── workouts ───────────────────────────────────────────────────────────────
const WORKOUT_SELECT = 'id,date,day_name,bulkify_workout_exercises(id,exercise_id,note,position,bulkify_sets(set_number,reps,weight_kg))';
function mapWorkout(r: any): Workout {
  return {
    id: r.id, date: r.date, day_name: r.day_name,
    exercises: [...(r.bulkify_workout_exercises ?? [])].sort((a: any, b: any) => a.position - b.position).map((e: any) => ({
      id: e.id, exercise_id: e.exercise_id, note: e.note ?? '', position: e.position,
      sets: [...(e.bulkify_sets ?? [])].sort((a: any, b: any) => a.set_number - b.set_number)
        .map((s: any) => ({ set_number: s.set_number, reps: s.reps, weight_kg: num(s.weight_kg) })),
    })),
  };
}

export async function loadWorkout(date: string): Promise<Workout | null> {
  const r = must(await sb().from('bulkify_workouts').select(WORKOUT_SELECT).eq('date', date).maybeSingle());
  return r ? mapWorkout(r) : null;
}

export async function loadWorkoutsRange(from: string | null, to: string): Promise<Workout[]> {
  const rows = await fetchAll<any>((a, b) => {
    let q = sb().from('bulkify_workouts').select(WORKOUT_SELECT).lte('date', to);
    if (from) q = q.gte('date', from);
    return q.order('date').range(a, b);
  });
  return rows.map(mapWorkout);
}

export async function createWorkout(date: string, dayName: string, exerciseIds: string[]) {
  const w = must(await sb().from('bulkify_workouts').upsert({ date, day_name: dayName }, { onConflict: 'user_id,date', ignoreDuplicates: false })
    .select('id').single()) as { id: string };
  if (exerciseIds.length) await addWorkoutExercises(w.id, exerciseIds, 0);
  return w.id;
}
export async function addWorkoutExercises(workoutId: string, ids: string[], startPos: number) {
  return must(await sb().from('bulkify_workout_exercises')
    .insert(ids.map((exercise_id, i) => ({ workout_id: workoutId, exercise_id, position: startPos + i }))).select('id,exercise_id,position')) as { id: string; exercise_id: string; position: number }[];
}
export async function updateWorkout(id: string, patch: { day_name: string }) { must(await sb().from('bulkify_workouts').update(patch).eq('id', id)); }
export async function deleteWorkout(id: string) { must(await sb().from('bulkify_workouts').delete().eq('id', id)); }
export async function updateWorkoutExercise(id: string, patch: { note?: string; position?: number }) {
  must(await sb().from('bulkify_workout_exercises').update(patch).eq('id', id));
}
export async function deleteWorkoutExercise(id: string) { must(await sb().from('bulkify_workout_exercises').delete().eq('id', id)); }
export async function saveSets(workoutExerciseId: string, sets: Pick<SetRow, 'reps' | 'weight_kg'>[]) {
  must(await sb().rpc('bulkify_save_sets', { p_workout_exercise: workoutExerciseId, p_sets: sets }));
}

/** Past sessions (newest first) for each exercise, strictly before `before`. */
export async function loadHistory(exerciseIds: string[], before: string) {
  const out = new Map<string, { date: string; sets: SetRow[] }[]>();
  if (!exerciseIds.length) return out;
  const rows = must(await sb().from('bulkify_workout_exercises')
    .select('exercise_id,bulkify_workouts!inner(date),bulkify_sets(set_number,reps,weight_kg)')
    .in('exercise_id', exerciseIds).lt('bulkify_workouts.date', before).limit(2000)) as any[];
  for (const r of rows) {
    const sets = [...(r.bulkify_sets ?? [])].sort((a: any, b: any) => a.set_number - b.set_number)
      .map((s: any) => ({ set_number: s.set_number, reps: s.reps, weight_kg: num(s.weight_kg) }));
    if (!sets.length) continue;
    const list = out.get(r.exercise_id) ?? [];
    list.push({ date: r.bulkify_workouts.date, sets });
    out.set(r.exercise_id, list);
  }
  out.forEach((l) => l.sort((a, b) => b.date.localeCompare(a.date)));
  return out;
}

/** Lightweight list for home/calendar: date, name, number of exercises. */
export async function loadWorkoutSummaries(from: string, to: string) {
  const rows = must(await sb().from('bulkify_workouts').select('id,date,day_name,bulkify_workout_exercises(count)')
    .gte('date', from).lte('date', to).order('date', { ascending: false })) as any[];
  return rows.map((r) => ({ id: r.id as string, date: r.date as string, day_name: r.day_name as string, count: Number(r.bulkify_workout_exercises?.[0]?.count ?? 0) }));
}
export async function loadLastWorkout(onOrBefore: string) {
  const rows = must(await sb().from('bulkify_workouts').select('id,date,day_name,bulkify_workout_exercises(count)')
    .lte('date', onOrBefore).order('date', { ascending: false }).limit(10)) as any[];
  const r = rows.map((x) => ({ id: x.id as string, date: x.date as string, day_name: x.day_name as string, count: Number(x.bulkify_workout_exercises?.[0]?.count ?? 0) }))
    .find((x) => x.count > 0);
  return r ?? null;
}

// ─── meals ──────────────────────────────────────────────────────────────────
const ITEM_COLS = 'id,meal_id,food_id,amount,kcal,protein_g,carbs_g,fat_g,label';
const mapItem = (i: any): MealItem => ({ id: i.id, meal_id: i.meal_id, food_id: i.food_id, label: i.label ?? '',
  amount: i.amount == null ? null : num(i.amount), kcal: num(i.kcal), protein_g: num(i.protein_g), carbs_g: num(i.carbs_g), fat_g: num(i.fat_g) });

export async function loadMeals(date: string): Promise<Meal[]> {
  const rows = must(await sb().from('bulkify_meals').select(`id,date,name,kind,position,created_at,bulkify_meal_items(${ITEM_COLS},created_at)`)
    .eq('date', date).order('position').order('created_at')) as any[];
  return rows.map((m) => ({ id: m.id, date: m.date, name: m.name, kind: (m.kind ?? 'custom') as MealKind, position: m.position,
    items: [...(m.bulkify_meal_items ?? [])].sort((a: any, b: any) => a.created_at.localeCompare(b.created_at)).map(mapItem) }));
}
export async function createMeal(date: string, name: string, kind: MealKind, position: number) {
  return must(await sb().from('bulkify_meals').insert({ date, name, kind, position }).select('id').single()) as { id: string };
}
export async function renameMeal(id: string, name: string) { must(await sb().from('bulkify_meals').update({ name }).eq('id', id)); }
export async function deleteMeal(id: string) { must(await sb().from('bulkify_meals').delete().eq('id', id)); }

export type NewItem = Omit<MealItem, 'id' | 'meal_id'>;
export async function addItems(mealId: string, items: NewItem[]) {
  if (!items.length) return;
  must(await sb().from('bulkify_meal_items').insert(items.map((i) => ({ ...i, meal_id: mealId }))));
}
export async function updateItem(id: string, patch: Partial<NewItem>) { must(await sb().from('bulkify_meal_items').update(patch).eq('id', id)); }
export async function deleteItem(id: string) { must(await sb().from('bulkify_meal_items').delete().eq('id', id)); }

export async function copyMeal(meal: Meal, toDate: string, position: number) {
  const m = await createMeal(toDate, meal.name, meal.kind, position);
  await addItems(m.id, meal.items.map(({ id: _id, meal_id: _m, ...rest }) => rest));
}

export async function loadDaily(from: string, to: string): Promise<DayNutrition[]> {
  const rows = must(await sb().rpc('bulkify_daily_nutrition', { p_from: from, p_to: to })) as any[];
  return rows.map((r) => ({
    date: r.date, kcal: num(r.kcal), protein_g: num(r.protein_g), carbs_g: num(r.carbs_g), fat_g: num(r.fat_g), items: Number(r.items),
  }));
}

/** Earliest day with any meal logged (null if none). */
export async function loadFirstMealDate() {
  const r = must(await sb().from('bulkify_meals').select('date').order('date').limit(1).maybeSingle()) as { date: string } | null;
  return r?.date ?? null;
}

// ─── weight log ─────────────────────────────────────────────────────────────
export async function loadWeights(): Promise<WeighIn[]> {
  const rows = must(await sb().from('bulkify_weights').select('date,weight_kg').order('date')) as any[];
  return rows.map((r) => ({ date: r.date, weight_kg: num(r.weight_kg) }));
}
export async function logWeight(userId: string, date: string, weightKg: number) {
  must(await sb().from('bulkify_weights').upsert({ user_id: userId, date, weight_kg: weightKg }, { onConflict: 'user_id,date' }));
}

// ─── day notes ──────────────────────────────────────────────────────────────
export async function loadNote(date: string) {
  const r = must(await sb().from('bulkify_day_notes').select('note').eq('date', date).maybeSingle()) as { note: string } | null;
  return r?.note ?? '';
}
export async function loadNotes(from: string, to: string) {
  return must(await sb().from('bulkify_day_notes').select('date,note').gte('date', from).lte('date', to)) as { date: string; note: string }[];
}
export async function saveNote(userId: string, date: string, note: string) {
  if (!note.trim()) { must(await sb().from('bulkify_day_notes').delete().eq('date', date)); return; }
  must(await sb().from('bulkify_day_notes').upsert({ user_id: userId, date, note }, { onConflict: 'user_id,date' }));
}

// ─── export (free plan has no automatic backups) ───────────────────────────
export async function exportEverything() {
  const [profile, program, workouts, meals, notes, foods, exercises, weights, cardio] = await Promise.all([
    sb().from('bulkify_profiles').select('*').maybeSingle().then(must),
    loadProgram(),
    loadWorkoutsRange(null, '9999-12-31'),
    fetchAll<any>((a, b) => sb().from('bulkify_meals').select(`id,date,name,position,bulkify_meal_items(${ITEM_COLS})`).order('date').range(a, b)),
    fetchAll<any>((a, b) => sb().from('bulkify_day_notes').select('date,note').order('date').range(a, b)),
    fetchAll<any>((a, b) => sb().from('bulkify_foods').select('*').not('owner_id', 'is', null).range(a, b)),
    fetchAll<any>((a, b) => sb().from('bulkify_exercises').select('*').not('owner_id', 'is', null).range(a, b)),
    loadWeights(),
    loadCardio('0001-01-01', '9999-12-31'),
  ]);
  return { app: 'Bulkify', exported_at: new Date().toISOString(), profile, program, workouts, meals, notes, weights, cardio, my_foods: foods, custom_exercises: exercises };
}
