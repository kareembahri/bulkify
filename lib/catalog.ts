'use client';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { loadExercises, loadFoods } from './data';
import { useQuery } from './query';
import { buildIndex } from './search';
import type { Exercise, Food } from './types';

/** Exercise library (built-in + your custom ones), cached for the session. */
export function useExercises() {
  const q = useQuery('catalog:exercises', loadExercises, 10 * 60_000);
  const locale = useLocale();
  const t = useTranslations();
  const list = useMemo(() => q.data ?? [], [q.data]);
  const byId = useMemo(() => new Map(list.map((e) => [e.id, e] as const)), [list]);
  const index = useMemo(() => buildIndex(list, (e) =>
    `${e.name_en} ${e.name_ar} ${t(`muscle.${e.primary_muscle}`)} ${e.primary_muscle.replace('_', ' ')} ${t(`equipment.${e.equipment}`)} ${e.equipment}`), [list, t]);
  const name = useCallback((e: Exercise | undefined | null) => (!e ? '…' : locale === 'ar' && e.name_ar ? e.name_ar : e.name_en), [locale]);
  return { ...q, list, byId, index, name };
}

/** Food catalog (CSV import + your My Foods), cached for the session. */
export function useFoods() {
  const q = useQuery('catalog:foods', loadFoods, 10 * 60_000);
  const locale = useLocale();
  const list = useMemo(() => q.data ?? [], [q.data]);
  const byId = useMemo(() => new Map(list.map((f) => [f.id, f] as const)), [list]);
  const index = useMemo(() => buildIndex(list, (f) => `${f.name_en} ${f.name_ar} ${f.category}`), [list]);
  const name = useCallback((f: Food | undefined | null) => (!f ? '' : locale === 'ar' && f.name_ar ? f.name_ar : f.name_en), [locale]);
  return { ...q, list, byId, index, name };
}
