'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Plus, Search, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { useProfile } from '@/lib/auth';
import { useExercises } from '@/lib/catalog';
import { addCustomExercise } from '@/lib/data';
import { invalidate, setData } from '@/lib/query';
import { search } from '@/lib/search';
import { EQUIPMENT, MUSCLES, type Equipment, type Exercise, type Muscle } from '@/lib/types';

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (ids: string[]) => void;
  single?: boolean;
  exclude?: string[];
  only?: string[];          // restrict the list (e.g. exercises you have history for)
  title?: string;
  max?: number;             // how many can still be picked (multi-select)
};

export function ExercisePicker({ open, onClose, onPick, single, exclude = [], only, title, max = Infinity }: Props) {
  const t = useTranslations();
  const ex = useExercises();
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState<Muscle | null>(null);
  const [equip, setEquip] = useState<Equipment | null>(null);
  const [sel, setSel] = useState<string[]>([]);
  const [limit, setLimit] = useState(80);
  const [custom, setCustom] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) { setSel([]); setQ(''); setCustom(false); } }, [open]);
  useEffect(() => setLimit(80), [q, muscle, equip]);

  const results = useMemo(() => {
    const ex1 = new Set(exclude);
    const onlySet = only ? new Set(only) : null;
    return search(ex.index, q, 2000).filter((e: Exercise) =>
      !ex1.has(e.id) && (!onlySet || onlySet.has(e.id)) && (!muscle || e.primary_muscle === muscle) && (!equip || e.equipment === equip));
  }, [ex.index, q, muscle, equip, exclude, only]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => es[0].isIntersecting && setLimit((l) => l + 80), { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, [results.length, open]);

  const toggle = (id: string) => {
    if (single) { onPick([id]); onClose(); return; }
    setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= max ? s : [...s, id]));
  };

  return (
    <Sheet open={open} onClose={onClose} tall title={title ?? (single ? t('picker.single') : t('picker.title'))}
      footer={!single && !custom ? (
        <Button variant="primary" size="lg" className="mb-1 w-full" disabled={!sel.length} onClick={() => { onPick(sel); onClose(); }}>
          {t('picker.add', { n: sel.length })}
          {Number.isFinite(max) && <span className="num text-sm opacity-75">{sel.length}/{max}</span>}
        </Button>
      ) : undefined}>
      {custom ? (
        <CustomExerciseForm initialName={q} onCancel={() => setCustom(false)} onCreated={(id) => { setCustom(false); toggle(id); }} />
      ) : (
        <>
          <div className="sticky top-0 z-10 -mx-5 space-y-3 bg-[rgb(var(--surface)/0.92)] px-5 pb-3 backdrop-blur">
            <div className="relative">
              <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input data-autofocus className="field ps-11" placeholder={t('picker.search')} value={q} onChange={(e) => setQ(e.target.value)}
                type="search" enterKeyHint="search" aria-label={t('picker.search')} />
            </div>
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
              <button className="chip" aria-pressed={!muscle} onClick={() => setMuscle(null)}>{t('picker.allMuscles')}</button>
              {MUSCLES.map((m) => <button key={m} className="chip" aria-pressed={muscle === m} onClick={() => setMuscle(muscle === m ? null : m)}>{t(`muscle.${m}`)}</button>)}
            </div>
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
              <button className="chip h-8 text-xs" aria-pressed={!equip} onClick={() => setEquip(null)}>{t('picker.allEquipment')}</button>
              {EQUIPMENT.map((m) => <button key={m} className="chip h-8 text-xs" aria-pressed={equip === m} onClick={() => setEquip(equip === m ? null : m)}>{t(`equipment.${m}`)}</button>)}
            </div>
          </div>

          {ex.loading ? (
            <div className="space-y-2 pt-2">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : (
            <>
              <p className="label mb-2 mt-1">{t('picker.count', { n: results.length })}</p>
              <ul className="space-y-1.5">
                {results.slice(0, limit).map((e) => {
                  const on = sel.includes(e.id);
                  return (
                    <li key={e.id}>
                      <motion.button whileTap={{ scale: 0.98 }} onClick={() => toggle(e.id)}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-start transition-colors ${on ? 'border-accent/60 bg-accent/10' : 'border-transparent hover:bg-[rgb(var(--line)/0.05)]'}`}>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{ex.name(e)}</span>
                          <span className="block truncate text-xs text-muted">
                            {t(`muscle.${e.primary_muscle}`)} · {t(`equipment.${e.equipment}`)}
                            {e.owner_id && <span className="ms-2 rounded-full bg-cyan/15 px-2 py-0.5 text-[10px] text-cyan">{t('picker.mine')}</span>}
                          </span>
                        </span>
                        {!single && (
                          <span className={`grid size-7 shrink-0 place-items-center rounded-full border transition-colors ${on ? 'border-accent bg-accent text-on-accent' : 'border-[rgb(var(--line)/0.2)]'}`}>
                            <AnimatePresence>{on && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check className="size-4" /></motion.span>}</AnimatePresence>
                          </span>
                        )}
                      </motion.button>
                    </li>
                  );
                })}
              </ul>
              <div ref={sentinel} />
              {!results.length && <p className="py-8 text-center text-sm text-muted">{t('picker.noResults')}</p>}
              {!only && (
                <Button className="mt-4 w-full" onClick={() => setCustom(true)}>
                  <Sparkles className="size-4 text-accent" /> {t('picker.custom')}
                </Button>
              )}
            </>
          )}
        </>
      )}
    </Sheet>
  );
}

function CustomExerciseForm({ initialName, onCreated, onCancel }: { initialName: string; onCreated: (id: string) => void; onCancel: () => void }) {
  const t = useTranslations();
  const toast = useToast();
  const { userId } = useProfile();
  const [nameEn, setNameEn] = useState(initialName);
  const [nameAr, setNameAr] = useState('');
  const [muscle, setMuscle] = useState<Muscle>('chest');
  const [equip, setEquip] = useState<Equipment>('dumbbell');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function create() {
    if (!nameEn.trim()) return setErr(t('common.required'));
    setBusy(true);
    try {
      const e = await addCustomExercise(userId, { name_en: nameEn.trim(), name_ar: nameAr.trim(), primary_muscle: muscle, equipment: equip });
      setData<Exercise[]>('catalog:exercises', (prev) => [...(prev ?? []), e]);
      invalidate('catalog:exercises');
      onCreated(e.id);
    } catch {
      toast.show(t('common.saveFailed'), { tone: 'error' });
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-4 pt-1">
      <h3 className="font-display font-semibold">{t('picker.customTitle')}</h3>
      <TextField label={t('picker.nameEn')} value={nameEn} onChange={(v) => { setNameEn(v); setErr(null); }} max={80} error={err} />
      <TextField label={<>{t('picker.nameAr')} <span className="text-muted">({t('common.optional')})</span></>} value={nameAr} onChange={setNameAr} max={80} dir="rtl" lang="ar" />
      <div>
        <p className="mb-2 text-sm font-medium">{t('picker.muscle')}</p>
        <div className="flex flex-wrap gap-2">{MUSCLES.map((m) => <button key={m} className="chip" aria-pressed={muscle === m} onClick={() => setMuscle(m)}>{t(`muscle.${m}`)}</button>)}</div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium">{t('picker.equipment')}</p>
        <div className="flex flex-wrap gap-2">{EQUIPMENT.map((m) => <button key={m} className="chip" aria-pressed={equip === m} onClick={() => setEquip(m)}>{t(`equipment.${m}`)}</button>)}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 pb-2">
        <Button onClick={onCancel}>{t('common.cancel')}</Button>
        <Button variant="primary" loading={busy} onClick={create}><Plus className="size-4" />{t('picker.create')}</Button>
      </div>
    </div>
  );
}
