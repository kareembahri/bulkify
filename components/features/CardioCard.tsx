'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Bike, Footprints, HeartPulse, Mountain, Plus, Route, Trash2, Zap, Flame, Activity } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/components/ui/Confirm';
import { Panel, SectionTitle } from '@/components/ui/Panel';
import { RollingNumber } from '@/components/ui/RollingNumber';
import { Segmented } from '@/components/ui/Segmented';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { useProfile } from '@/lib/auth';
import {
  caloriesBurned, CARDIO_GROUPS, CARDIO_LIMITS, checkCardio, INTENSITIES, pace,
  type Body, type CardioKind, type Intensity,
} from '@/lib/cardio';
import { addCardio, deleteCardio, loadCardio } from '@/lib/data';
import { useFmt } from '@/lib/format';
import { tick } from '@/lib/haptics';
import { invalidate, setData, useQuery } from '@/lib/query';
import { LIMITS, type CardioEntry, type Profile } from '@/lib/types';

const ICONS: Partial<Record<string, React.ComponentType<{ className?: string }>>> = {
  run_outside: Route, treadmill: Footprints, incline_walk: Mountain, bike: Bike, jump_rope: Zap,
};
/** Icon for a cardio type (older entries of removed types get a generic one). */
export const cardioIcon = (k: string) => ICONS[k] ?? Activity;

export const bodyOf = (p: Profile): Body | null =>
  p.sex && p.age && p.height_cm && p.weight_kg ? { sex: p.sex, age: p.age, heightCm: +p.height_cm, weightKg: +p.weight_kg } : null;

/** Cardio for one day: list, total burned, and "Add cardio" (shown under the workout on the Workout page). */
export function CardioCard({ date }: { date: string }) {
  const t = useTranslations();
  const f = useFmt();
  const toast = useToast();
  const confirm = useConfirm();
  const key = `cardio:${date}`;
  const q = useQuery<CardioEntry[]>(key, () => loadCardio(date));
  const [open, setOpen] = useState(false);
  const list = q.data ?? [];
  const total = list.reduce((s, e) => s + e.kcal, 0);
  const full = list.length >= LIMITS.maxCardio;

  async function remove(e: CardioEntry) {
    if (!(await confirm({ title: t('cardio.remove'), body: t(`cardio.kind.${e.kind}`), danger: true, confirmLabel: t('common.delete') }))) return;
    setData<CardioEntry[]>(key, (p) => (p ?? []).filter((x) => x.id !== e.id));
    try { await deleteCardio(e.id); invalidate('cardio', 'runs'); }
    catch { toast.show(t('common.saveFailed'), { tone: 'error' }); invalidate(key); }
  }

  return (
    <Panel edge>
      <SectionTitle action={list.length ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#ff7a45]/15 px-2.5 py-1 text-xs font-semibold text-[#ff7a45]">
          <Flame className="size-3.5" /><RollingNumber value={total} format={f.n0} /> {t('common.kcal')}
        </span>
      ) : undefined}>
        <span className="inline-flex items-center gap-2"><HeartPulse className="size-3.5" />{t('cardio.title')}</span>
      </SectionTitle>

      {q.loading ? <Skeleton className="h-14" /> : list.length === 0 ? (
        <p className="mb-3 text-sm text-muted">{t('cardio.empty')}</p>
      ) : (
        <ul className="mb-3 space-y-2">
          <AnimatePresence initial={false}>
            {list.map((e) => {
              const Icon = cardioIcon(e.kind);
              const p = e.distance_km ? pace(e.distance_km, e.minutes) : null;
              return (
                <motion.li key={e.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}
                  className="flex items-center gap-3 rounded-2xl bg-[rgb(var(--line)/0.04)] px-3 py-2.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent"><Icon className="size-[18px]" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{t(`cardio.kind.${e.kind}`)}</span>
                    <span className="num block truncate text-xs text-muted">
                      {t('cardio.minutes', { n: e.minutes })}
                      {e.distance_km ? ` · ${f.n1(e.distance_km)} ${t('cardio.km')}` : ''}
                      {p ? ` · ${p} /${t('cardio.km')}` : ''}
                      {e.intensity ? ` · ${t(`cardio.intensity.${e.intensity}`)}` : ''}
                    </span>
                  </span>
                  <span className="num text-end text-sm font-semibold">{f.n0(e.kcal)} <span className="text-xs font-normal text-muted">{t('common.kcal')}</span></span>
                  <button onClick={() => remove(e)} aria-label={t('cardio.remove')} className="press grid size-8 place-items-center rounded-full text-muted hover:text-bad">
                    <Trash2 className="size-4" />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <Button className="w-full" disabled={full} onClick={() => setOpen(true)}>
        <Plus className="size-4" />{full ? t('cardio.full', { n: LIMITS.maxCardio }) : t('cardio.add')}
      </Button>
      <AddCardioSheet open={open} date={date} onClose={() => setOpen(false)} />
    </Panel>
  );
}

function AddCardioSheet({ open, date, onClose }: { open: boolean; date: string; onClose: () => void }) {
  const t = useTranslations();
  const f = useFmt();
  const toast = useToast();
  const { profile } = useProfile();
  const body = bodyOf(profile);
  const [kind, setKind] = useState<CardioKind>('run_outside');
  const [minutes, setMinutes] = useState('');
  const [km, setKm] = useState('');
  const [intensity, setIntensity] = useState<Intensity>('moderate');
  const [busy, setBusy] = useState(false);
  const [showErr, setShowErr] = useState(false);

  const run = kind === 'run_outside';
  const input = useMemo(() => ({
    kind, minutes: Number(minutes || NaN), intensity: run ? undefined : intensity, km: run ? Number(km || NaN) : null,
  }), [kind, minutes, km, intensity, run]);
  const err = checkCardio(input);
  const kcal = !err && body ? caloriesBurned(input, body) : 0;
  const p = run && !err ? pace(input.km ?? 0, input.minutes) : null;

  const reset = () => { setMinutes(''); setKm(''); setShowErr(false); setIntensity('moderate'); setKind('run_outside'); };
  const close = () => { if (!busy) { reset(); onClose(); } };

  async function save() {
    setShowErr(true);
    if (err || !body) { tick(20); return; }
    setBusy(true);
    try {
      const row = await addCardio({
        date, kind, intensity: run ? null : intensity, minutes: Math.round(input.minutes),
        distance_km: run ? Math.round((input.km ?? 0) * 100) / 100 : null, kcal,
      });
      setData<CardioEntry[]>(`cardio:${date}`, (prev) => [...(prev ?? []), row]);
      invalidate('cardio', 'runs');
      tick(15);
      toast.show(t('cardio.saved', { kcal: f.n0(kcal) }));
      reset(); onClose();
    } catch (e) {
      toast.show(/at most 10/.test((e as Error).message) ? t('cardio.full', { n: LIMITS.maxCardio }) : t('common.saveFailed'), { tone: 'error' });
    } finally { setBusy(false); }
  }

  const errText = !showErr || !err ? null : err === 'minutes' ? t('cardio.err.minutes', { max: CARDIO_LIMITS.maxMinutes })
    : err === 'km' ? t('cardio.err.km', { max: CARDIO_LIMITS.maxKm }) : t('cardio.err.speed');

  return (
    <Sheet open={open} onClose={close} tall title={t('cardio.add')}
      footer={
        <Button variant="primary" size="lg" className="mb-1 w-full" loading={busy} onClick={save}>
          <Flame className="size-5" />{t('cardio.save')}
        </Button>
      }>
      <div className="space-y-5 pb-4">
        {/* what */}
        <div>
          <p className="mb-2 text-sm font-medium">{t('cardio.what')}</p>
          <div className="space-y-3" role="radiogroup" aria-label={t('cardio.what')}>
            {CARDIO_GROUPS.map((g) => (
              <div key={g.id}>
                <p className="label mb-1.5">{t(`cardio.group.${g.id}`)}</p>
                <div className={`grid gap-2 ${g.kinds.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {g.kinds.map((k) => {
                    const Icon = cardioIcon(k);
                    const on = kind === k;
                    return (
                      <motion.button key={k} type="button" role="radio" aria-checked={on} whileTap={{ scale: 0.96 }}
                        onClick={() => { tick(5); setKind(k); setShowErr(false); }}
                        className={`flex items-center gap-2.5 rounded-2xl border px-3 py-3 text-start text-sm font-medium transition-colors
                          ${on ? 'border-accent/70 bg-accent/15 shadow-glow' : 'border-[rgb(var(--line)/0.12)] bg-[rgb(var(--line)/0.03)] hover:bg-[rgb(var(--line)/0.06)]'}`}>
                        <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${on ? 'bg-accent text-on-accent' : 'bg-[rgb(var(--line)/0.06)] text-muted'}`}>
                          <Icon className="size-[18px]" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate">{t(`cardio.kind.${k}`)}</span>
                          <span className="block truncate text-xs font-normal text-muted">{t(`cardio.hint.${k}`)}</span>
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* how long / how far / how hard */}
        <div className="grid grid-cols-2 gap-3">
          <Num label={t('cardio.time')} suffix={t('cardio.min')} value={minutes} onChange={setMinutes} inputMode="numeric" />
          {run && <Num label={t('cardio.distance')} suffix={t('cardio.km')} value={km} onChange={setKm} />}
        </div>
        {!run && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium">{t('cardio.howHard')}</span>
            <Segmented size="sm" value={intensity} onChange={setIntensity} label={t('cardio.howHard')}
              options={INTENSITIES.map((i) => ({ value: i, label: t(`cardio.intensity.${i}`) }))} />
          </div>
        )}
        {errText && <p className="text-sm text-bad">{errText}</p>}

        {/* result */}
        <div className="rounded-2xl bg-[#ff7a45]/10 p-4 text-center ring-1 ring-[#ff7a45]/30">
          <p className="label !text-[#ff7a45]">{t('cardio.burned')}</p>
          <p className="font-display text-4xl font-semibold text-[#ff7a45]">
            <RollingNumber value={kcal} format={f.n0} /> <span className="text-base">{t('common.kcal')}</span>
          </p>
          {p && <p className="num mt-1 text-xs text-muted">{t('cardio.pace', { pace: p })}</p>}
          <p className="mt-2 text-xs text-muted">{body ? t('cardio.basedOn') : t('cardio.needBody')}</p>
        </div>
      </div>
    </Sheet>
  );
}

function Num({ label, value, onChange, suffix, inputMode = 'decimal' }: {
  label: string; value: string; onChange: (v: string) => void; suffix: string; inputMode?: 'decimal' | 'numeric';
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <span className="relative block">
        <input inputMode={inputMode} className="field num pe-14" value={value} aria-label={label}
          onChange={(e) => onChange(e.target.value.replace(',', '.').replace(/[^0-9.]/g, '').slice(0, 6))} />
        <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-sm text-muted">{suffix}</span>
      </span>
    </label>
  );
}
