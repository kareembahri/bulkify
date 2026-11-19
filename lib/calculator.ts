// Calories & macros calculator. Pure functions only (no React, no Supabase),
// so it can be unit-tested on its own: see tests/calculator.test.ts.

export type Sex = 'male' | 'female';
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
export type Goal = 'cut' | 'bulk' | 'maintain';
export type Aggressiveness = 'mild' | 'normal';

export const ACTIVITY: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};
export const ACTIVITIES = Object.keys(ACTIVITY) as Activity[];
export const GOALS: Goal[] = ['cut', 'maintain', 'bulk'];

/** Calorie multiplier per goal and aggressiveness. */
export const GOAL_FACTOR: Record<Goal, Record<Aggressiveness, number>> = {
  cut: { mild: 0.85, normal: 0.8 },
  bulk: { mild: 1.05, normal: 1.1 },
  maintain: { mild: 1, normal: 1 },
};
/** Grams per kg of body weight. */
export const PROTEIN_PER_KG: Record<Goal, number> = { cut: 2.2, bulk: 1.8, maintain: 1.8 };
export const FAT_PER_KG: Record<Goal, number> = { cut: 0.8, bulk: 1.0, maintain: 0.9 };

export const FLOOR: Record<Sex, number> = { female: 1200, male: 1500 };
export const MIN_CARBS = 50;
/** How far protein and fat may be lowered when carbs would drop under MIN_CARBS. */
const MIN_PROTEIN_PER_KG = 1.6;
const MIN_FAT_PER_KG = 0.6;

export const LIMITS = {
  age: { min: 14, max: 80 },
  weightKg: { min: 30, max: 250 },
  heightCm: { min: 120, max: 230 },
} as const;

export type CalcInput = {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: Activity;
  goal: Goal;
  aggressiveness?: Aggressiveness;
};

export type Warning =
  | 'floor'          // target was below the safety floor and was raised to it
  | 'lowCarbs'       // carbs came out under 50 g, protein/fat were lowered
  | 'raisedCalories' // lowering protein/fat was not enough, calories were raised
  | 'minorCut'       // under 18 and cutting: talk to a doctor
  | 'minor';         // under 18 (any goal)

export type CalcResult = {
  bmr: number;       // kcal/day, whole kcal (fraction dropped)
  tdee: number;      // kcal/day, whole kcal (fraction dropped)
  calories: number;  // target, rounded to 10
  protein: number;   // g, rounded to 1
  carbs: number;     // g
  fat: number;       // g
  pct: { protein: number; carbs: number; fat: number }; // share of calories, 0–100, rounded to 1
  floor: number;
  warnings: Warning[];
};

// ─── units ──────────────────────────────────────────────────────────────────
export const LB_TO_KG = 0.4536;
export const IN_TO_CM = 2.54;
export const lbToKg = (lb: number) => lb * LB_TO_KG;
export const kgToLb = (kg: number) => kg / LB_TO_KG;
export const ftInToCm = (ft: number, inch: number) => (ft * 12 + inch) * IN_TO_CM;
export const cmToFtIn = (cm: number) => {
  const total = Math.round(cm / IN_TO_CM);
  return { ft: Math.floor(total / 12), inch: total % 12 };
};

const round10 = (x: number) => Math.round(x / 10) * 10;

// ─── formulas ───────────────────────────────────────────────────────────────
/** Mifflin-St Jeor. */
export function bmrOf(sex: Sex, weightKg: number, heightCm: number, age: number) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calculate(input: CalcInput): CalcResult {
  const aggr = input.aggressiveness ?? 'normal';
  const warnings: Warning[] = [];
  const w = input.weightKg;

  const bmr = bmrOf(input.sex, w, input.heightCm, input.age);
  const tdee = bmr * ACTIVITY[input.activity];

  // 3 · target calories + safety floor
  const floor = FLOOR[input.sex];
  let target = tdee * GOAL_FACTOR[input.goal][aggr];
  if (target < floor) { target = floor; warnings.push('floor'); }
  let calories = round10(target);

  // 4 + 5 · protein and fat from body weight
  let protein = Math.round(PROTEIN_PER_KG[input.goal] * w);
  let fat = Math.round(FAT_PER_KG[input.goal] * w);

  // 6 · carbs fill the rest
  const carbsFor = (kcal: number, p: number, f: number) => Math.round((kcal - p * 4 - f * 9) / 4);
  let carbs = carbsFor(calories, protein, fat);

  if (carbs < MIN_CARBS) {
    warnings.push('lowCarbs');
    // First lower protein and fat (never below their minimums) just enough to reach 50 g carbs.
    const missingKcal = (MIN_CARBS - carbs) * 4;
    const minP = Math.round(MIN_PROTEIN_PER_KG * w);
    const minF = Math.round(MIN_FAT_PER_KG * w);
    const roomP = Math.max(protein - minP, 0) * 4;
    const roomF = Math.max(fat - minF, 0) * 9;
    const room = roomP + roomF;
    if (room > 0) {
      const share = Math.min(missingKcal / room, 1);
      protein -= Math.ceil((roomP * share) / 4);
      fat -= Math.ceil((roomF * share) / 9);
    }
    carbs = carbsFor(calories, protein, fat);
    // Still short: raise calories (to the nearest 10 above) so carbs reach 50 g.
    if (carbs < MIN_CARBS) {
      calories = Math.ceil((protein * 4 + fat * 9 + MIN_CARBS * 4) / 10) * 10;
      carbs = carbsFor(calories, protein, fat);
      warnings.push('raisedCalories');
    }
  }

  if (input.age < 18) warnings.push(input.goal === 'cut' ? 'minorCut' : 'minor');

  const pctOf = (kcal: number) => (calories > 0 ? Math.round((kcal / calories) * 1000) / 10 : 0);
  return {
    bmr: Math.floor(bmr),
    tdee: Math.floor(tdee),
    calories,
    protein,
    carbs,
    fat,
    pct: { protein: pctOf(protein * 4), carbs: pctOf(carbs * 4), fat: pctOf(fat * 9) },
    floor,
    warnings,
  };
}

// ─── form validation ────────────────────────────────────────────────────────
export type WeightUnit = 'kg' | 'lb';
export type HeightUnit = 'cm' | 'ftin';

/** What the form holds while typing: raw strings, plus the chosen units. */
export type RawForm = {
  sex: Sex | '';
  age: string;
  weight: string;
  weightUnit: WeightUnit;
  height: string;      // cm when heightUnit = 'cm'
  heightFt: string;    // when heightUnit = 'ftin'
  heightIn: string;
  heightUnit: HeightUnit;
  activity: Activity | '';
  goal: Goal | '';
  aggressiveness: Aggressiveness;
};

export type FieldError = 'required' | 'notNumber' | 'negative' | 'range';
export type FormErrors = Partial<Record<'sex' | 'age' | 'weight' | 'height' | 'activity' | 'goal', FieldError>>;

const parse = (s: string): number | null => {
  const t = s.trim().replace(',', '.');
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
};

function checkNumber(raw: string, min: number, max: number, convert: (n: number) => number = (n) => n): { value?: number; error?: FieldError } {
  const n = parse(raw);
  if (n === null) return { error: 'required' };
  if (Number.isNaN(n)) return { error: 'notNumber' };
  if (n < 0) return { error: 'negative' };
  const v = convert(n);
  if (v < min || v > max) return { error: 'range' };
  return { value: v };
}

/** Validates the form. Returns either the clean input (kg / cm) or the errors per field. */
export function validate(f: RawForm): { input: CalcInput | null; errors: FormErrors } {
  const errors: FormErrors = {};
  if (!f.sex) errors.sex = 'required';
  if (!f.activity) errors.activity = 'required';
  if (!f.goal) errors.goal = 'required';

  const age = checkNumber(f.age, LIMITS.age.min, LIMITS.age.max);
  if (age.error) errors.age = age.error;
  else if (!Number.isInteger(age.value)) errors.age = 'notNumber';

  const weight = checkNumber(f.weight, LIMITS.weightKg.min, LIMITS.weightKg.max, f.weightUnit === 'lb' ? lbToKg : undefined);
  if (weight.error) errors.weight = weight.error;

  let heightCm: number | undefined;
  if (f.heightUnit === 'cm') {
    const h = checkNumber(f.height, LIMITS.heightCm.min, LIMITS.heightCm.max);
    if (h.error) errors.height = h.error; else heightCm = h.value;
  } else {
    const ft = parse(f.heightFt);
    const inch = f.heightIn.trim() === '' ? 0 : parse(f.heightIn);
    if (ft === null) errors.height = 'required';
    else if (Number.isNaN(ft) || inch === null || Number.isNaN(inch)) errors.height = 'notNumber';
    else if (ft < 0 || inch < 0) errors.height = 'negative';
    else if (inch >= 12) errors.height = 'range';
    else {
      const cm = ftInToCm(ft, inch);
      if (cm < LIMITS.heightCm.min || cm > LIMITS.heightCm.max) errors.height = 'range'; else heightCm = cm;
    }
  }

  if (Object.keys(errors).length) return { input: null, errors };
  return {
    input: {
      sex: f.sex as Sex,
      age: age.value!,
      weightKg: Math.round(weight.value! * 10) / 10,
      heightCm: Math.round(heightCm! * 10) / 10,
      activity: f.activity as Activity,
      goal: f.goal as Goal,
      aggressiveness: f.aggressiveness,
    },
    errors,
  };
}
