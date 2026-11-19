'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Target, UtensilsCrossed } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { AddFoodSheet } from '@/components/features/AddFoodSheet';
import { MacroBars } from '@/components/features/MacroBars';
import { AddMealSheet, EditItemSheet, MealCard, RenameMealSheet } from '@/components/features/MealParts';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/components/ui/Confirm';
import { DateNav } from '@/components/ui/DateNav';
import { TextArea } from '@/components/ui/Field';
import { Panel, SectionTitle } from '@/components/ui/Panel';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { useProfile } from '@/lib/auth';
import { addItems, copyMeal, createMeal, deleteItem, deleteMeal, loadMeals, loadNote, renameMeal, saveNote, updateItem, type NewItem } from '@/lib/data';
import { addDays, isValidISO, today } from '@/lib/dates';
import { totals } from '@/lib/nutrition';
import { invalidate, setData, useQuery } from '@/lib/query';
import { LIMITS, MAIN_MEALS, type Meal, type MealItem, type MealKind } from '@/lib/types';

export default function FoodPage() {
  return <Suspense fallback={<PageSkeleton />}><FoodScreen /></Suspense>;
}

function FoodScreen() {
  const t = useTranslations();
  const toast = useToast();
  const confirm = useConfirm();
  const router = useRouter();
  const params = useSearchParams();
  const { profile, userId } = useProfile();
  const date = isValidISO(params.get('date')) ? params.get('date')! : today();
  const key = `meals:${date}`;
  const meals = useQuery(key, () => loadMeals(date));
  const yesterday = useQuery(`meals:${addDays(date, -1)}`, () => loadMeals(addDays(date, -1)));

  const [mealSheet, setMealSheet] = useState(false);
  const [addTo, setAddTo] = useState<Meal | null>(null);
  const [editing, setEditing] = useState<MealItem | null>(null);
  const [renaming, setRenaming] = useState<Meal | null>(null);

  useEffect(() => {
    if (params.get('add') === '1') { setMealSheet(true); router.replace(`/food?date=${date}`, { scroll: false }); }
  }, [params, router, date]);

  const changed = () => invalidate(key, 'home', 'cal', 'nut');
  const fail = (e?: unknown) => {
    const dup = String((e as { message?: string })?.message ?? '').includes('bulkify_meals_one_main_uq');
    toast.show(dup ? t('food.alreadyAdded') : t('common.saveFailed'), { tone: 'error' });
    invalidate(key);
  };
  const list = meals.data ?? [];
  const day = totals(list.flatMap((m) => m.items));

  async function onCreate(name: string, kind: MealKind) {
    if (MAIN_MEALS.includes(kind) && list.some((m) => m.kind === kind)) { toast.show(t('food.alreadyAdded'), { tone: 'error' }); return; }
    try {
      const m = await createMeal(date, name, kind, list.length);
      const meal: Meal = { id: m.id, date, name, kind, position: list.length, items: [] };
      setData<Meal[]>(key, (p) => [...(p ?? []), meal]);
      setAddTo(meal);
    } catch (e) { fail(e); }
  }
  async function onRepeat(m: Meal) {
    try { await copyMeal(m, date, list.length); await meals.refresh(); changed(); toast.show(t('food.repeated', { meal: m.name })); }
    catch (e) { fail(e); }
  }
  async function onConfirm(meal: Meal, items: NewItem[]) {
    try { await addItems(meal.id, items); await meals.refresh(); changed(); }
    catch (e) { fail(e); throw e; }
  }
  async function onDeleteMeal(m: Meal) {
    if (!(await confirm({ title: t('food.deleteMeal'), body: m.name, danger: true, confirmLabel: t('common.delete') }))) return;
    setData<Meal[]>(key, (p) => (p ?? []).filter((x) => x.id !== m.id));
    try { await deleteMeal(m.id); changed(); } catch (e) { fail(e); }
  }
  async function onSaveItem(item: MealItem, patch: Partial<NewItem>) {
    setData<Meal[]>(key, (p) => (p ?? []).map((m) => ({ ...m, items: m.items.map((i) => (i.id === item.id ? { ...i, ...patch } : i)) })));
    try { await updateItem(item.id, patch); changed(); } catch (e) { fail(e); }
  }
  async function onDeleteItem(item: MealItem) {
    setData<Meal[]>(key, (p) => (p ?? []).map((m) => ({ ...m, items: m.items.filter((i) => i.id !== item.id) })));
    try { await deleteItem(item.id); changed(); } catch (e) { fail(e); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{t('food.title')}</h1>
        <Button variant="primary" onClick={() => setMealSheet(true)}><Plus className="size-4" />{t('food.addMeal')}</Button>
      </div>
      <DateNav date={date} onChange={(d) => router.replace(`/food?date=${d}`, { scroll: false })} />

      {meals.error ? <ErrorState onRetry={meals.refresh} /> : meals.loading ? <PageSkeleton /> : (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
          <div className="space-y-4">
            <Panel edge>
              <SectionTitle action={
                <Link href="/settings/goals" className="press inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                  <Target className="size-3.5" />{t(`calc.goals.${profile.goal ?? 'maintain'}`)}
                </Link>
              }>{t('food.needed')}</SectionTitle>
              <MacroBars totals={day} profile={profile} />
              <p className="mt-4 text-xs text-muted">{t(`food.rule.${profile.goal === 'bulk' ? 'bulk' : 'cut'}`)}</p>
            </Panel>
            <DayNote date={date} userId={userId} />
          </div>

          <div className="space-y-3">
            {list.length === 0 ? (
              <Panel>
                <EmptyState icon={UtensilsCrossed} title={t('food.emptyDay')} hint={t('food.emptyDayHint')}
                  action={<Button variant="primary" size="lg" onClick={() => setMealSheet(true)}><Plus className="size-5" />{t('food.addMeal')}</Button>} />
              </Panel>
            ) : (
              <AnimatePresence initial={false}>
                {list.map((m, i) => (
                  <motion.div key={m.id} layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 60, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28, delay: Math.min(i, 6) * 0.04 }}>
                    <MealCard meal={m} onAdd={() => setAddTo(m)} onEditItem={setEditing} onRename={() => setRenaming(m)} onDelete={() => onDeleteMeal(m)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      )}

      <AddMealSheet open={mealSheet} onClose={() => setMealSheet(false)} onCreate={onCreate} today={list} yesterday={yesterday.data} onRepeat={onRepeat} />
      <AddFoodSheet open={!!addTo} onClose={() => setAddTo(null)} mealName={addTo?.name ?? ''} onConfirm={(items) => onConfirm(addTo!, items)} />
      <EditItemSheet item={editing} onClose={() => setEditing(null)}
        onSave={(p) => onSaveItem(editing!, p)} onDelete={() => onDeleteItem(editing!)} />
      <RenameMealSheet meal={renaming} onClose={() => setRenaming(null)} onSave={async (name) => {
        const m = renaming!;
        setData<Meal[]>(key, (p) => (p ?? []).map((x) => (x.id === m.id ? { ...x, name } : x)));
        try { await renameMeal(m.id, name); } catch (e) { fail(e); }
      }} />
    </div>
  );
}

function DayNote({ date, userId }: { date: string; userId: string }) {
  const t = useTranslations();
  const toast = useToast();
  const note = useQuery(`note:${date}`, () => loadNote(date));
  const [v, setV] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { if (note.data !== undefined) setV(note.data); }, [note.data, date]);
  const onChange = (x: string) => {
    setV(x); setState('idle');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setState('saving');
      try { await saveNote(userId, date, x); setData(`note:${date}`, () => x); setState('saved'); invalidate('cal'); }
      catch { setState('idle'); toast.show(t('common.saveFailed'), { tone: 'error' }); }
    }, 700);
  };
  return (
    <Panel>
      <TextArea label={t('food.dayNote')} value={v} onChange={onChange} max={LIMITS.dayNote} placeholder={t('food.dayNotePlaceholder')}
        hint={state === 'saving' ? t('common.saving') : state === 'saved' ? t('common.saved') : undefined} />
    </Panel>
  );
}
