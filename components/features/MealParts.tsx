'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, Check, Coffee, Cookie, Moon, Pencil, Plus, Repeat, Sun, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { NumberField, TextField, parseNum } from '@/components/ui/Field';
import { Panel } from '@/components/ui/Panel';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { useProfile } from '@/lib/auth';
import { useFoods } from '@/lib/catalog';
import { saveMyFood, type NewItem } from '@/lib/data';
import { useFmt } from '@/lib/format';
import { r1, scale, totals } from '@/lib/nutrition';
import { invalidate } from '@/lib/query';
import { LIMITS, MAIN_MEALS, type Meal, type MealItem, type MealKind } from '@/lib/types';

export function useItemTitle() {
  const foods = useFoods();
  const t = useTranslations();
  return (i: MealItem) => (i.food_id ? foods.name(foods.byId.get(i.food_id)) : '') || i.label || t('food.manualDefault');
}

export const MEAL_ICON: Record<MealKind, React.ComponentType<{ className?: string }>> = {
  breakfast: Coffee, lunch: Sun, dinner: Moon, snack: Cookie, custom: Pencil,
};

export function MealCard({ meal, onAdd, onEditItem, onRename, onDelete }: {
  meal: Meal; onAdd: () => void; onEditItem: (i: MealItem) => void; onRename: () => void; onDelete: () => void;
}) {
  const t = useTranslations();
  const f = useFmt();
  const foods = useFoods();
  const title = useItemTitle();
  const tot = totals(meal.items);
  const Icon = MEAL_ICON[meal.kind];
  return (
    <Panel>
      <div className="flex items-center gap-2">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent/15 text-accent"><Icon className="size-5" /></span>
        <button onClick={onRename} className="group min-w-0 flex-1 text-start">
          <h3 className="flex items-center gap-2 truncate font-display text-lg font-semibold">
            {meal.name}<Pencil className="size-3.5 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
          </h3>
          <p className="num text-xs text-muted">
            {f.n0(tot.kcal)} {t('common.kcal')} · P {f.n0(tot.protein_g)} · C {f.n0(tot.carbs_g)} · F {f.n0(tot.fat_g)}
          </p>
        </button>
        <Button size="icon" variant="ghost" aria-label={t('food.deleteMeal')} onClick={onDelete}><Trash2 className="size-4 text-muted" /></Button>
        <Button size="sm" variant="primary" onClick={onAdd}><Plus className="size-4" /><span className="hidden min-[400px]:inline">{t('food.addFood')}</span></Button>
      </div>
      {meal.items.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{t('food.emptyMeal')}</p>
      ) : (
        <ul className="mt-3 divide-y divide-[rgb(var(--line)/0.06)]">
          <AnimatePresence initial={false}>
            {meal.items.map((i) => {
              const food = i.food_id ? foods.byId.get(i.food_id) : undefined;
              return (
                <motion.li key={i.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}>
                  <button onClick={() => onEditItem(i)} className="press flex w-full items-center gap-3 py-2.5 text-start">
                    <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px]">{title(i)}</span>
                      <span className="num block text-xs text-muted">
                        {i.amount != null && <>{f.n1(i.amount)} {f.unit(food?.basis_unit ?? 'g')} · </>}
                        P {f.n1(i.protein_g)} · C {f.n1(i.carbs_g)} · F {f.n1(i.fat_g)}
                      </span>
                    </span>
                    <span className="num text-sm font-semibold">{f.n0(i.kcal)}</span>
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </Panel>
  );
}

/** Edit / delete one entry. Food entries recompute from the amount; manual entries edit the numbers. */
export function EditItemSheet({ item, onClose, onSave, onDelete }: {
  item: MealItem | null; onClose: () => void; onSave: (patch: Partial<NewItem>) => Promise<void>; onDelete: () => Promise<void>;
}) {
  const t = useTranslations();
  const f = useFmt();
  const toast = useToast();
  const { userId } = useProfile();
  const foods = useFoods();
  const title = useItemTitle();
  const food = item?.food_id ? foods.byId.get(item.food_id) : undefined;
  const [amount, setAmount] = useState('');
  const [v, setV] = useState({ kcal: '', protein: '', carbs: '', fat: '' });
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;
    setAmount(item.amount != null ? String(item.amount) : '');
    setV({ kcal: String(item.kcal), protein: String(item.protein_g), carbs: String(item.carbs_g), fat: String(item.fat_g) });
    setLabel(item.label); setErr(null);
  }, [item]);

  const amt = parseNum(amount) ?? 0;
  const live = food ? scale(food, amt) : null;

  async function save() {
    if (!item) return;
    let patch: Partial<NewItem>;
    if (food) {
      if (!(amt > 0) || amt > 10000) return setErr(t('food.enterAmount'));
      patch = { amount: r1(amt), kcal: live!.kcal, protein_g: live!.protein_g, carbs_g: live!.carbs_g, fat_g: live!.fat_g };
    } else {
      const kcal = parseNum(v.kcal);
      if (kcal == null || kcal < 0) return setErr(t('food.manualNeedsKcal'));
      const nums = [parseNum(v.protein), parseNum(v.carbs), parseNum(v.fat)];
      if (nums.some((n) => n != null && n < 0)) return setErr(t('calc.err.negative'));
      patch = { kcal, protein_g: nums[0] ?? 0, carbs_g: nums[1] ?? 0, fat_g: nums[2] ?? 0, label: label.trim() };
    }
    setBusy(true);
    try { await onSave(patch); onClose(); } finally { setBusy(false); }
  }

  async function saveMine() {
    if (!item) return;
    try {
      await saveMyFood(userId, {
        name: title(item).slice(0, 120), amount: item.amount ?? 100, unit: food?.basis_unit ?? 'g',
        kcal: item.kcal, protein_g: item.protein_g, carbs_g: item.carbs_g, fat_g: item.fat_g,
      });
      invalidate('catalog:foods');
      toast.show(t('food.savedMyFood'));
    } catch { toast.show(t('common.saveFailed'), { tone: 'error' }); }
  }

  return (
    <Sheet open={!!item} onClose={onClose} title={t('food.editItem')}>
      {item && (
        <div className="space-y-4 pb-4">
          <p className="font-display text-lg font-semibold">{title(item)}</p>
          {food ? (
            <>
              <NumberField label={t('food.amount')} value={amount} onChange={(x) => { setAmount(x); setErr(null); }} suffix={f.unit(food.basis_unit)} error={err} />
              <p className="num text-sm text-muted">{f.n0(live!.kcal)} {t('common.kcal')} · P {f.n1(live!.protein_g)} · C {f.n1(live!.carbs_g)} · F {f.n1(live!.fat_g)}</p>
            </>
          ) : (
            <>
              <TextField label={t('food.label')} value={label} onChange={setLabel} max={LIMITS.label} />
              <div className="grid grid-cols-2 gap-3">
                <NumberField label={t('food.calories')} value={v.kcal} onChange={(x) => setV({ ...v, kcal: x })} error={err} />
                <NumberField label={t('food.protein')} value={v.protein} onChange={(x) => setV({ ...v, protein: x })} />
                <NumberField label={t('food.carbs')} value={v.carbs} onChange={(x) => setV({ ...v, carbs: x })} />
                <NumberField label={t('food.fat')} value={v.fat} onChange={(x) => setV({ ...v, fat: x })} />
              </div>
            </>
          )}
          <Button variant="primary" size="lg" className="w-full" loading={busy} onClick={save}>{t('common.save')}</Button>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={saveMine}><Bookmark className="size-4" />{t('food.saveAsMyFood')}</Button>
            <Button variant="danger" onClick={async () => { await onDelete(); onClose(); }}><Trash2 className="size-4" />{t('common.delete')}</Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

/**
 * New meal: breakfast, lunch and dinner once a day each; snacks and custom
 * names as often as you like; or repeat one of yesterday's meals.
 */
export function AddMealSheet({ open, onClose, onCreate, today, yesterday, onRepeat }: {
  open: boolean; onClose: () => void; onCreate: (name: string, kind: MealKind) => Promise<void>;
  today: Meal[]; yesterday: Meal[] | undefined; onRepeat: (m: Meal) => Promise<void>;
}) {
  const t = useTranslations();
  const f = useFmt();
  const [custom, setCustom] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { if (open) setCustom(''); }, [open]);
  const run = async (key: string, fn: () => Promise<void>) => { setBusy(key); try { await fn(); onClose(); } finally { setBusy(null); } };
  const taken = new Set(today.map((m) => m.kind).filter((k) => MAIN_MEALS.includes(k)));
  const presets: MealKind[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  return (
    <Sheet open={open} onClose={onClose} title={t('food.addMeal')}>
      <div className="space-y-5 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {presets.map((p) => {
            const Icon = MEAL_ICON[p];
            const done = taken.has(p);
            return (
              <Button key={p} size="lg" disabled={done} loading={busy === p} onClick={() => run(p, () => onCreate(t(`food.${p}`), p))}
                className="justify-start" aria-label={done ? `${t(`food.${p}`)} · ${t('food.alreadyAdded')}` : t(`food.${p}`)}>
                {done ? <Check className="size-5 text-accent" /> : <Icon className="size-5 text-accent" />}
                <span className="flex flex-col items-start leading-tight">
                  <span>{t(`food.${p}`)}</span>
                  <span className="text-[11px] font-normal text-muted">{done ? t('food.alreadyAdded') : p === 'snack' ? t('food.unlimited') : t('food.oncePerDay')}</span>
                </span>
              </Button>
            );
          })}
        </div>
        <div className="flex items-end gap-2">
          <TextField className="flex-1" label={t('food.customMeal')} value={custom} onChange={setCustom} max={LIMITS.mealName} placeholder={t('food.mealNamePlaceholder')} />
          <Button variant="primary" size="md" className="h-12" disabled={!custom.trim()} loading={busy === 'custom'}
            onClick={() => run('custom', () => onCreate(custom.trim(), 'custom'))}><Plus className="size-4" />{t('food.createMeal')}</Button>
        </div>
        <div>
          <p className="label mb-2 flex items-center gap-2"><Repeat className="size-3.5" />{t('food.repeatYesterday')}</p>
          {!yesterday?.length ? <p className="text-sm text-muted">{t('food.noYesterday')}</p> : (
            <ul className="space-y-1.5">
              {yesterday.map((m) => {
                const tot = totals(m.items);
                const blocked = taken.has(m.kind);
                return (
                  <li key={m.id}>
                    <button disabled={!!busy || blocked} onClick={() => run(m.id, () => onRepeat(m))}
                      className="press flex w-full items-center gap-3 rounded-2xl border border-[rgb(var(--line)/0.1)] px-4 py-3 text-start hover:bg-[rgb(var(--line)/0.05)] disabled:opacity-40">
                      <span className="flex-1">
                        <span className="block font-medium">{m.name}</span>
                        <span className="num block text-xs text-muted">{blocked ? t('food.alreadyAdded') : <>{t('food.items', { n: m.items.length })} · {f.n0(tot.kcal)} {t('common.kcal')}</>}</span>
                      </span>
                      <Repeat className="size-4 text-accent" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </Sheet>
  );
}

/** Rename a meal. */
export function RenameMealSheet({ meal, onClose, onSave }: { meal: Meal | null; onClose: () => void; onSave: (name: string) => Promise<void> }) {
  const t = useTranslations();
  const [name, setName] = useState('');
  useEffect(() => { if (meal) setName(meal.name); }, [meal]);
  return (
    <Sheet open={!!meal} onClose={onClose} title={t('food.renameMeal')}>
      <div className="space-y-4 pb-4">
        <TextField value={name} onChange={setName} max={LIMITS.mealName} label={t('food.customMeal')} />
        <Button variant="primary" size="lg" className="w-full" disabled={!name.trim()} onClick={async () => { await onSave(name.trim()); onClose(); }}>{t('common.save')}</Button>
      </div>
    </Sheet>
  );
}
