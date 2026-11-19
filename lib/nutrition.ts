import type { Food, Macros, MealItem } from './types';

export const r1 = (x: number) => Math.round(x * 10) / 10;
export const EMPTY: Macros = { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };

/** value = nutrient × amount ÷ basis_amount */
export function scale(food: Food, amount: number): Macros {
  const f = amount > 0 ? amount / Number(food.basis_amount) : 0;
  return {
    kcal: r1(Number(food.kcal) * f),
    protein_g: r1(Number(food.protein_g) * f),
    carbs_g: r1(Number(food.carbs_g) * f),
    fat_g: r1(Number(food.fat_g) * f),
  };
}

/** Packaged items (a bar, a can, a pack) are logged in servings; everything else in g/ml. */
export const isPackaged = (food: Food) => Number(food.basis_amount) !== 100;

export type Totals = Macros & { count: number };

export function totals(items: Pick<MealItem, 'kcal' | 'protein_g' | 'carbs_g' | 'fat_g'>[]): Totals {
  const t: Totals = { ...EMPTY, count: items.length };
  for (const i of items) {
    t.kcal = r1(t.kcal + +i.kcal);
    t.protein_g = r1(t.protein_g + +i.protein_g);
    t.carbs_g = r1(t.carbs_g + +i.carbs_g);
    t.fat_g = r1(t.fat_g + +i.fat_g);
  }
  return t;
}
