import type { Activity, Aggressiveness, Goal, Sex } from './calculator';

export type Muscle =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'forearms' | 'quads' | 'hamstrings'
  | 'glutes' | 'calves' | 'abs' | 'traps' | 'full_body' | 'cardio';
export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'smith' | 'kettlebell' | 'bodyweight' | 'bands' | 'other';

export const MUSCLES: Muscle[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'quads', 'hamstrings',
  'glutes', 'calves', 'abs', 'traps', 'full_body', 'cardio'];
export const EQUIPMENT: Equipment[] = ['barbell', 'dumbbell', 'machine', 'cable', 'smith', 'kettlebell', 'bodyweight', 'bands', 'other'];

/** Kept in the database for old logs, but no longer offered when picking exercises. */
export const HIDDEN_MUSCLES: Muscle[] = ['cardio'];
export const HIDDEN_EQUIPMENT: Equipment[] = ['kettlebell', 'bands'];
export const PICK_MUSCLES = MUSCLES.filter((m) => !HIDDEN_MUSCLES.includes(m));
export const PICK_EQUIPMENT = EQUIPMENT.filter((e) => !HIDDEN_EQUIPMENT.includes(e));
export const isPickable = (e: Pick<Exercise, 'primary_muscle' | 'equipment'>) =>
  !HIDDEN_MUSCLES.includes(e.primary_muscle) && !HIDDEN_EQUIPMENT.includes(e.equipment);

export type CardioEntry = {
  id: string; date: string; kind: import('./cardio').CardioKind; intensity: import('./cardio').Intensity | null;
  minutes: number; distance_km: number | null; kcal: number;
};

export const LIMITS = { maxCardio: 10, dayName: 20, dayNote: 250, exerciseNote: 300, mealName: 30, label: 60, maxSets: 5, maxExercises: 9, maxKg: 120, kgStep: 5 } as const;

export type Profile = {
  id: string;
  display_name: string;
  language: 'en' | 'ar';
  theme: 'dark' | 'light';
  kcal_goal: number;
  protein_goal: number;
  carbs_goal: number | null;
  fat_goal: number | null;
  created_at: string;
  // body data for the calculator (null until the first setup)
  sex: Sex | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity: Activity | null;
  goal: Goal | null;
  aggressiveness: Aggressiveness;
  gym_start_date: string | null;
  /** 6-digit ID friends use to add you (given by the database, never changes). */
  friend_code: string;
};

/** The app opens only after height, weight, goal (and the other calculator inputs) are set. */
export const setupComplete = (p: Profile) =>
  !!(p.sex && p.age && p.height_cm && p.weight_kg && p.activity && p.goal);

export type Exercise = {
  id: string;
  owner_id: string | null;
  slug: string | null;
  name_en: string;
  name_ar: string;
  primary_muscle: Muscle;
  secondary_muscles: Muscle[];
  equipment: Equipment;
};

export type Food = {
  id: string;
  owner_id: string | null;
  category_no: number;
  category: string;
  name_en: string;
  name_ar: string;
  basis_amount: number;
  basis_unit: 'g' | 'ml';
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  note: string;
};

export type SetRow = { set_number: number; reps: number; weight_kg: number };
export type WorkoutExercise = { id: string; exercise_id: string; note: string; position: number; sets: SetRow[] };
export type Workout = { id: string; date: string; day_name: string; exercises: WorkoutExercise[] };

export type ProgramDay = { id: string; weekday: number; day_name: string; is_rest: boolean; exercise_ids: string[] };

export type MealItem = {
  id: string;
  meal_id: string;
  food_id: string | null;
  amount: number | null;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  label: string;
};
export type MealKind = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'custom';
/** Breakfast, lunch and dinner: at most one of each per day. */
export const MAIN_MEALS: MealKind[] = ['breakfast', 'lunch', 'dinner'];
export type Meal = { id: string; date: string; name: string; kind: MealKind; position: number; items: MealItem[] };

export type Macros = { kcal: number; protein_g: number; carbs_g: number; fat_g: number };
export type DayNutrition = Macros & { date: string; items: number };
export type WeighIn = { date: string; weight_kg: number };
