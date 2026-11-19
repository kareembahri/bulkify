'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Bookmark, Info, Plus, Search, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { NumberField, TextField, parseNum } from '@/components/ui/Field';
import { RollingNumber } from '@/components/ui/RollingNumber';
import { Segmented } from '@/components/ui/Segmented';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { useProfile } from '@/lib/auth';
import { useFoods } from '@/lib/catalog';
import { saveMyFood, type NewItem } from '@/lib/data';
import { useFmt } from '@/lib/format';
import { isPackaged, r1, scale } from '@/lib/nutrition';
import { invalidate } from '@/lib/query';
import { search } from '@/lib/search';
import { LIMITS, type Food } from '@/lib/types';

type Pending = { key: number; title: string; item: NewItem };

export function AddFoodSheet({ open, onClose, mealName, onConfirm }: {
  open: boolean; onClose: () => void; mealName: string; onConfirm: (items: NewItem[]) => Promise<void>;
}) {
  const t = useTranslations();
  const f = useFmt();
  const [tab, setTab] = useState<'search' | 'manual'>('search');
  const [picked, setPicked] = useState<Food | null>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [busy, setBusy] = useState(false);
  const seq = useRef(0);

  useEffect(() => { if (open) { setPending([]); setPicked(null); setTab('search'); } }, [open]);

  const sum = pending.reduce((s, p) => ({ kcal: s.kcal + p.item.kcal, protein: s.protein + p.item.protein_g }), { kcal: 0, protein: 0 });
  const push = (title: string, item: NewItem) => setPending((p) => [...p, { key: ++seq.current, title, item }]);

  async function confirm() {
    setBusy(true);
    try { await onConfirm(pending.map((p) => p.item)); onClose(); } finally { setBusy(false); }
  }

  return (
    <Sheet open={open} onClose={onClose} tall title={t('food.confirmAdd', { meal: mealName })}
      footer={
        <div className="pb-1">
          <AnimatePresence initial={false}>
            {pending.length > 0 && (
              <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
                {pending.map((p) => (
                  <motion.li layout key={p.key} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-[rgb(var(--line)/0.12)] bg-[rgb(var(--line)/0.05)] py-1 pe-1 ps-3 text-xs">
                    <span className="max-w-[9rem] truncate">{p.title}</span>
                    <span className="num text-muted">{f.n0(p.item.kcal)}</span>
                    <button aria-label={t('food.removeFromList')} onClick={() => setPending((x) => x.filter((y) => y.key !== p.key))}
                      className="grid size-6 place-items-center rounded-full hover:bg-[rgb(var(--line)/0.1)]"><Trash2 className="size-3" /></button>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
          <Button variant="primary" size="lg" className="w-full" disabled={!pending.length} loading={busy} onClick={confirm}>
            {pending.length
              ? <>{t('food.confirmAdd', { meal: mealName })} · <RollingNumber value={sum.kcal} format={f.n0} /> {t('common.kcal')}</>
              : t('food.confirmAdd', { meal: mealName })}
          </Button>
        </div>
      }>
      {!picked && (
        <Segmented className="mb-4 w-full" value={tab} onChange={setTab}
          options={[{ value: 'search', label: t('food.searchTab') }, { value: 'manual', label: t('food.manualTab') }]} />
      )}
      {tab === 'search'
        ? picked
          ? <AmountPanel food={picked} onBack={() => setPicked(null)} onAdd={(title, item) => { push(title, item); setPicked(null); }} />
          : <FoodSearch onPick={setPicked} />
        : <ManualPanel onAdd={push} />}
    </Sheet>
  );
}

function FoodSearch({ onPick }: { onPick: (f: Food) => void }) {
  const t = useTranslations();
  const fm = useFmt();
  const foods = useFoods();
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(60);
  useEffect(() => setLimit(60), [q]);

  const groups = useMemo(() => {
    const res = search(foods.index, q, 1000);
    const mine = res.filter((x) => x.owner_id);
    const rest = res.filter((x) => !x.owner_id);
    const ordered = [...mine, ...(q ? rest : [...rest].sort((a, b) => a.category_no - b.category_no))].slice(0, limit);
    const map = new Map<number, Food[]>();
    for (const x of ordered) { const k = x.owner_id ? 0 : x.category_no; map.set(k, [...(map.get(k) ?? []), x]); }
    return { groups: [...map.entries()], total: res.length };
  }, [foods.index, q, limit]);

  return (
    <div>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input data-autofocus type="search" enterKeyHint="search" className="field ps-11" placeholder={t('food.search')} aria-label={t('food.search')}
          value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {foods.loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : groups.total === 0 ? (
        <p className="py-10 text-center text-sm text-muted">{t('food.noResults')}</p>
      ) : (
        <div className="space-y-4">
          {groups.groups.map(([cat, list]) => (
            <section key={cat}>
              <h3 className="label sticky top-0 z-[1] -mx-1 mb-1.5 bg-[rgb(var(--surface)/0.9)] px-1 py-1 backdrop-blur">{t(`foodCat.${cat}`)}</h3>
              <ul className="space-y-1">
                {list.map((x) => (
                  <li key={x.id}>
                    <motion.button whileTap={{ scale: 0.98 }} onClick={() => onPick(x)}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-start hover:bg-[rgb(var(--line)/0.05)]">
                      <span className="size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{foods.name(x)}</span>
                        <span className="num block text-xs text-muted">
                          {t('food.per', { amount: fm.n1(x.basis_amount), unit: fm.unit(x.basis_unit) })} · {fm.n0(x.kcal)} {t('common.kcal')} · P {fm.n1(x.protein_g)}
                        </span>
                      </span>
                      <Plus className="size-4 text-muted" />
                    </motion.button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {groups.total > limit && <Button className="w-full" onClick={() => setLimit((l) => l + 80)}>{t('food.showMore')}</Button>}
        </div>
      )}
    </div>
  );
}

function AmountPanel({ food, onBack, onAdd }: { food: Food; onBack: () => void; onAdd: (title: string, item: NewItem) => void }) {
  const t = useTranslations();
  const fm = useFmt();
  const foods = useFoods();
  const packaged = isPackaged(food);
  const [mode, setMode] = useState<'serving' | 'weight'>(packaged ? 'serving' : 'weight');
  const [raw, setRaw] = useState(packaged ? '1' : '100');
  const [err, setErr] = useState<string | null>(null);

  const n = parseNum(raw) ?? 0;
  const grams = mode === 'serving' ? n * food.basis_amount : n;
  const m = scale(food, grams);
  const quick = mode === 'serving' ? [0.5, 1, 2, 3] : food.basis_unit === 'ml' ? [100, 200, 250, 330, 500] : [50, 100, 150, 200, 300];
  const unit = fm.unit(food.basis_unit);

  const add = () => {
    if (!(grams > 0) || grams > 10000) return setErr(t('food.enterAmount'));
    onAdd(foods.name(food), {
      food_id: food.id, amount: r1(grams), kcal: m.kcal, protein_g: m.protein_g, carbs_g: m.carbs_g, fat_g: m.fat_g, label: '',
    });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4 rtl:rotate-180" />{t('common.back')}
      </button>
      <div>
        <h3 className="font-display text-xl font-semibold">{foods.name(food)}</h3>
        <p className="text-xs text-muted">{t(`foodCat.${food.owner_id ? 0 : food.category_no}`)}</p>
        {food.note === 'carbs include fibre' && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-cyan/10 px-3 py-1.5 text-xs text-cyan" role="note">
            <Info className="size-3.5" aria-hidden />{t('food.fibre')}
          </p>
        )}
        {food.note === 'approximate' && <p className="mt-2 text-xs text-muted">{t('food.approximate')}</p>}
      </div>

      {packaged && (
        <Segmented size="sm" value={mode} onChange={(v) => { setMode(v); setRaw(v === 'serving' ? '1' : String(food.basis_amount)); }}
          options={[{ value: 'serving', label: t('food.byServing') }, { value: 'weight', label: t('food.byWeight', { unit }) }]} />
      )}
      <NumberField label={mode === 'serving' ? t('food.servings') : t('food.amount')} value={raw}
        onChange={(v) => { setRaw(v); setErr(null); }} suffix={mode === 'serving' ? '×' : unit} error={err}
        hint={mode === 'serving' ? t('food.serving', { amount: fm.n1(food.basis_amount), unit }) : undefined} />
      <div className="flex flex-wrap gap-2">
        {quick.map((v) => <button key={v} className="chip num" aria-pressed={n === v} onClick={() => setRaw(String(v))}>{fm.n1(v)}{mode === 'serving' ? '×' : ` ${unit}`}</button>)}
      </div>

      <div className="glass rounded-3xl p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="label">{t('macros.kcal')}</p>
            <RollingNumber value={m.kcal} format={fm.n0} className="font-display text-4xl font-semibold" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {([['protein', m.protein_g], ['carbs', m.carbs_g], ['fat', m.fat_g]] as const).map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-[rgb(var(--line)/0.04)] py-2.5">
              <RollingNumber value={v} format={fm.n1} className="block text-lg font-semibold" />
              <span className="text-[11px] text-muted">{t(`macros.${k}`)}</span>
            </div>
          ))}
        </div>
      </div>
      <Button variant="primary" size="lg" className="w-full" onClick={add}><Plus className="size-5" />{t('food.addToList')}</Button>
    </motion.div>
  );
}

function ManualPanel({ onAdd }: { onAdd: (title: string, item: NewItem) => void }) {
  const t = useTranslations();
  const toast = useToast();
  const { userId } = useProfile();
  const [label, setLabel] = useState('');
  const [v, setV] = useState({ kcal: '', protein: '', carbs: '', fat: '', amount: '' });
  const [saveMine, setSaveMine] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof v) => (x: string) => { setV((s) => ({ ...s, [k]: x })); setErr(null); };

  async function add() {
    const kcal = parseNum(v.kcal);
    if (kcal == null || kcal < 0 || kcal > 20000) return setErr(t('food.manualNeedsKcal'));
    const portion = parseNum(v.amount);
    if (portion != null && (portion <= 0 || portion > 10000)) return setErr(t('food.enterAmount'));
    const macros = [parseNum(v.protein), parseNum(v.carbs), parseNum(v.fat)];
    if (macros.some((n) => n != null && (n < 0 || n > 5000))) return setErr(t('calc.err.negative'));
    const item: NewItem = {
      food_id: null, amount: portion, kcal, protein_g: macros[0] ?? 0, carbs_g: macros[1] ?? 0, fat_g: macros[2] ?? 0, label: label.trim(),
    };
    onAdd(label.trim() || t('food.manualDefault'), item);
    if (saveMine && label.trim()) {
      try {
        await saveMyFood(userId, { name: label.trim(), amount: portion ?? 100, unit: 'g', kcal, protein_g: item.protein_g, carbs_g: item.carbs_g, fat_g: item.fat_g });
        invalidate('catalog:foods');
        toast.show(t('food.savedMyFood'));
      } catch { toast.show(t('common.saveFailed'), { tone: 'error' }); }
    }
    setLabel(''); setV({ kcal: '', protein: '', carbs: '', fat: '', amount: '' }); setSaveMine(false);
  }

  return (
    <div className="space-y-4">
      <TextField label={<>{t('food.label')} <span className="text-muted">({t('common.optional')})</span></>} value={label} onChange={setLabel}
        max={LIMITS.label} placeholder={t('food.labelPlaceholder')} data-autofocus />
      <div className="grid grid-cols-2 gap-3">
        <NumberField label={t('food.calories')} value={v.kcal} onChange={set('kcal')} suffix={t('common.kcal')} error={err} />
        <NumberField label={t('food.protein')} value={v.protein} onChange={set('protein')} />
        <NumberField label={t('food.carbs')} value={v.carbs} onChange={set('carbs')} />
        <NumberField label={t('food.fat')} value={v.fat} onChange={set('fat')} />
        <NumberField className="col-span-2" label={<>{t('food.amount')} <span className="text-muted">({t('common.optional')})</span></>} value={v.amount} onChange={set('amount')} suffix="g" />
      </div>
      <label className={`flex items-center gap-3 rounded-2xl px-1 text-sm ${label.trim() ? '' : 'opacity-50'}`}>
        <input type="checkbox" className="size-5 accent-[rgb(var(--accent))]" checked={saveMine} disabled={!label.trim()} onChange={(e) => setSaveMine(e.target.checked)} />
        <Bookmark className="size-4 text-accent" />{t('food.saveAsMyFood')}
      </label>
      <Button variant="primary" size="lg" className="w-full" onClick={add}><Plus className="size-5" />{t('food.addToList')}</Button>
    </div>
  );
}
