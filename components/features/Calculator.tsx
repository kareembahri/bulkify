'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Armchair, Bike, Equal, Flame, Footprints, HardHat, Info, Mars, ShieldAlert, TrendingDown, TrendingUp, Venus, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import { Button } from '@/components/ui/Button';
import { Panel, SectionTitle } from '@/components/ui/Panel';
import { RollingNumber } from '@/components/ui/RollingNumber';
import { Segmented } from '@/components/ui/Segmented';
import { useToast } from '@/components/ui/Toast';
import { useAuth, useProfile } from '@/lib/auth';
import {
  ACTIVITIES, ACTIVITY, calculate, cmToFtIn, kgToLb, validate,
  type Activity, type CalcResult, type FieldError, type Goal, type RawForm, type Warning,
} from '@/lib/calculator';
import { logWeight } from '@/lib/data';
import { today } from '@/lib/dates';
import { useFmt } from '@/lib/format';
import { tick } from '@/lib/haptics';
import { invalidate } from '@/lib/query';
import { rangeOf } from '@/lib/targets';
import { useThemeColors } from '@/lib/theme';
import type { Profile } from '@/lib/types';

const ACT_ICON: Record<Activity, React.ComponentType<{ className?: string }>> = {
  sedentary: Armchair, light: Footprints, moderate: Bike, active: Flame, veryActive: HardHat,
};
const GOAL_ICON: Record<Goal, React.ComponentType<{ className?: string }>> = { cut: TrendingDown, maintain: Equal, bulk: TrendingUp };

export function formFromProfile(p: Profile): RawForm {
  const ftin = p.height_cm ? cmToFtIn(p.height_cm) : null;
  return {
    sex: p.sex ?? '', age: p.age ? String(p.age) : '',
    weight: p.weight_kg ? String(+p.weight_kg) : '', weightUnit: 'kg',
    height: p.height_cm ? String(+p.height_cm) : '', heightFt: ftin ? String(ftin.ft) : '', heightIn: ftin ? String(ftin.inch) : '', heightUnit: 'cm',
    activity: p.activity ?? '', goal: p.goal ?? '', aggressiveness: p.aggressiveness ?? 'normal',
  };
}

/** Profile fields to save for a calculation (body data + the four daily targets). */
export const targetsPatch = (input: NonNullable<ReturnType<typeof validate>['input']>, r: CalcResult) => ({
  sex: input.sex, age: input.age, height_cm: input.heightCm, weight_kg: input.weightKg, activity: input.activity,
  goal: input.goal, aggressiveness: input.aggressiveness ?? 'normal',
  kcal_goal: r.calories, protein_goal: r.protein, carbs_goal: r.carbs, fat_goal: r.fat,
});

/**
 * Calories & macros calculator. Recalculates live as you type; "Save" writes
 * the body data and the daily targets to your profile (and logs the weight).
 */
export function Calculator({ mode, onSaved }: { mode: 'setup' | 'settings'; onSaved?: () => void }) {
  const t = useTranslations();
  const toast = useToast();
  const { profile, userId } = useProfile();
  const { updateProfile } = useAuth();
  const [form, setForm] = useState<RawForm>(() => formFromProfile(profile));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);
  const [gymStart, setGymStart] = useState(profile.gym_start_date ?? '');
  const [busy, setBusy] = useState(false);

  const { input, errors } = useMemo(() => validate(form), [form]);
  const result = useMemo(() => (input ? calculate(input) : null), [input]);
  const set = <K extends keyof RawForm>(k: K, v: RawForm[K]) => setForm((s) => ({ ...s, [k]: v }));
  const touch = (k: string) => setTouched((s) => ({ ...s, [k]: true }));
  const errFor = (k: keyof typeof errors) => (showAll || touched[k] ? errors[k] : undefined);

  const errText = (field: 'age' | 'weight' | 'height', e: FieldError | undefined) => {
    if (!e) return null;
    if (e === 'required') return t('common.required');
    if (e === 'negative') return t('calc.err.negative');
    if (e === 'notNumber') return field === 'age' ? t('calc.err.wholeNumber') : t('calc.err.notNumber');
    return field === 'age' ? t('calc.err.ageRange') : field === 'weight' ? t('calc.err.weightRange') : t('calc.err.heightRange');
  };

  function switchWeight(u: 'kg' | 'lb') {
    if (u === form.weightUnit) return;
    const n = Number(form.weight.replace(',', '.'));
    const conv = form.weight.trim() && Number.isFinite(n) ? String(Math.round((u === 'lb' ? kgToLb(n) : n * 0.4536) * 10) / 10) : form.weight;
    setForm((s) => ({ ...s, weightUnit: u, weight: conv }));
  }
  function switchHeight(u: 'cm' | 'ftin') {
    if (u === form.heightUnit) return;
    if (u === 'ftin') {
      const cm = Number(form.height);
      const fi = form.height.trim() && Number.isFinite(cm) && cm > 0 ? cmToFtIn(cm) : null;
      setForm((s) => ({ ...s, heightUnit: u, heightFt: fi ? String(fi.ft) : s.heightFt, heightIn: fi ? String(fi.inch) : s.heightIn }));
    } else {
      const ft = Number(form.heightFt), inch = Number(form.heightIn || 0);
      const ok = form.heightFt.trim() && Number.isFinite(ft) && Number.isFinite(inch);
      setForm((s) => ({ ...s, heightUnit: u, height: ok ? String(Math.round((ft * 12 + inch) * 2.54)) : s.height }));
    }
  }

  async function save() {
    setShowAll(true);
    if (!input || !result) { tick(20); toast.show(t('calc.fixErrors'), { tone: 'error' }); return; }
    setBusy(true);
    try {
      await updateProfile({ ...targetsPatch(input, result), gym_start_date: gymStart || null });
      if (mode === 'setup' || +(profile.weight_kg ?? 0) !== input.weightKg) await logWeight(userId, today(), input.weightKg);
      invalidate('weights', 'home', 'cal', 'nut');
      toast.show(t('calc.saved'));
      onSaved?.();
    } catch (e) {
      toast.show(`${t('common.saveFailed')} ${(e as Error).message ?? ''}`, { tone: 'error' });
    } finally { setBusy(false); }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr] lg:items-start">
      <div className="space-y-4">
        {/* about you */}
        <Panel className="space-y-4">
          <SectionTitle>{t('calc.you')}</SectionTitle>
          <div>
            <p className="mb-1.5 text-sm font-medium">{t('calc.sex')}</p>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('calc.sex')}>
              {(['male', 'female'] as const).map((s) => (
                <Choice key={s} on={form.sex === s} onClick={() => set('sex', s)} icon={s === 'male' ? Mars : Venus} title={t(`calc.${s}`)} />
              ))}
            </div>
            {errFor('sex') && <p className="mt-1.5 text-xs text-bad">{t('common.required')}</p>}
          </div>
          <NumberInput label={t('calc.age')} suffix={t('calc.years')} value={form.age} inputMode="numeric"
            onChange={(v) => set('age', v.replace(/[^0-9-]/g, ''))} onBlur={() => touch('age')} error={errText('age', errFor('age'))} />
        </Panel>

        {/* body */}
        <Panel className="space-y-4">
          <SectionTitle>{t('calc.body')}</SectionTitle>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{t('calc.weight')}</span>
              <Segmented size="sm" value={form.weightUnit} onChange={switchWeight} label={t('calc.weight')}
                options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]} />
            </div>
            <NumberInput value={form.weight} suffix={form.weightUnit} onChange={(v) => set('weight', v)} onBlur={() => touch('weight')}
              error={errText('weight', errFor('weight'))} ariaLabel={t('calc.weight')} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{t('calc.height')}</span>
              <Segmented size="sm" value={form.heightUnit} onChange={switchHeight} label={t('calc.height')}
                options={[{ value: 'cm', label: 'cm' }, { value: 'ftin', label: t('calc.ftin') }]} />
            </div>
            {form.heightUnit === 'cm' ? (
              <NumberInput value={form.height} suffix="cm" onChange={(v) => set('height', v)} onBlur={() => touch('height')}
                error={errText('height', errFor('height'))} ariaLabel={t('calc.height')} />
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput value={form.heightFt} suffix={t('calc.ft')} inputMode="numeric" onChange={(v) => set('heightFt', v)} onBlur={() => touch('height')} ariaLabel={t('calc.ft')} invalid={!!errFor('height')} />
                  <NumberInput value={form.heightIn} suffix={t('calc.in')} onChange={(v) => set('heightIn', v)} onBlur={() => touch('height')} ariaLabel={t('calc.in')} invalid={!!errFor('height')} />
                </div>
                {errFor('height') && <p className="mt-1.5 text-xs text-bad">{errText('height', errFor('height'))}</p>}
              </div>
            )}
          </div>
        </Panel>

        {/* activity */}
        <Panel>
          <SectionTitle>{t('calc.activity')}</SectionTitle>
          <div className="grid gap-2" role="radiogroup" aria-label={t('calc.activity')}>
            {ACTIVITIES.map((a) => (
              <Choice key={a} on={form.activity === a} onClick={() => set('activity', a)} icon={ACT_ICON[a]}
                title={t(`calc.act.${a}`)} hint={t(`calc.act.${a}Hint`)} badge={`× ${ACTIVITY[a]}`} />
            ))}
          </div>
          {errFor('activity') && <p className="mt-1.5 text-xs text-bad">{t('common.required')}</p>}
        </Panel>

        {/* goal */}
        <Panel className="space-y-4">
          <SectionTitle>{t('calc.goal')}</SectionTitle>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t('calc.goal')}>
            {(['cut', 'maintain', 'bulk'] as const).map((g) => (
              <Choice key={g} on={form.goal === g} onClick={() => set('goal', g)} icon={GOAL_ICON[g]} title={t(`calc.goals.${g}`)} stacked />
            ))}
          </div>
          {errFor('goal') && <p className="-mt-2 text-xs text-bad">{t('common.required')}</p>}
          <AnimatePresence initial={false}>
            {(form.goal === 'cut' || form.goal === 'bulk') && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-medium">{t('calc.pace')}</span>
                  <Segmented size="sm" value={form.aggressiveness} onChange={(v) => set('aggressiveness', v)} label={t('calc.pace')}
                    options={[{ value: 'mild', label: t('calc.mild', { pct: form.goal === 'cut' ? '−15%' : '+5%' }) },
                              { value: 'normal', label: t('calc.normal', { pct: form.goal === 'cut' ? '−20%' : '+10%' }) }]} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div>
            <label htmlFor="gymstart" className="mb-1.5 block text-sm font-medium">{t('calc.gymStart')} <span className="text-muted">({t('common.optional')})</span></label>
            <input id="gymstart" type="date" className="field num" value={gymStart} max={today()} onChange={(e) => setGymStart(e.target.value)} />
          </div>
        </Panel>
      </div>

      {/* results */}
      <div className="lg:sticky lg:top-24">
        <Results result={result} goal={input?.goal ?? null} />
        <Button variant="primary" size="lg" className="mt-4 w-full" loading={busy} onClick={save}>
          {mode === 'setup' ? t('calc.saveStart') : t('calc.save')}
        </Button>
        {mode === 'settings' && <p className="mt-2 text-center text-xs text-muted">{t('calc.saveHint')}</p>}
      </div>
    </div>
  );
}

export function Results({ result, goal }: { result: CalcResult | null; goal: Goal | null }) {
  const t = useTranslations();
  const f = useFmt();
  const c = useThemeColors();
  if (!result || !goal) {
    return (
      <Panel edge className="grid min-h-[16rem] place-items-center text-center">
        <div>
          <motion.div animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.06, 1] }} transition={{ duration: 3, repeat: Infinity }}>
            <Zap className="mx-auto mb-3 size-8 text-accent" />
          </motion.div>
          <p className="font-display text-lg font-semibold">{t('calc.fillIn')}</p>
          <p className="mt-1 text-sm text-muted">{t('calc.fillInHint')}</p>
        </div>
      </Panel>
    );
  }
  const macros = [
    { key: 'protein', g: result.protein, pct: result.pct.protein, color: c.protein },
    { key: 'carbs', g: result.carbs, pct: result.pct.carbs, color: c.carbs },
    { key: 'fat', g: result.fat, pct: result.pct.fat, color: c.fat },
  ] as const;
  return (
    <Panel edge className="space-y-5">
      <SectionTitle>{t('calc.results')}</SectionTitle>
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat label={t('calc.bmr')} hint={t('calc.bmrHint')} value={result.bmr} />
        <Stat label={t('calc.tdee')} hint={t('calc.tdeeHint')} value={result.tdee} />
        <div className="rounded-2xl bg-accent/15 px-2 py-3 ring-1 ring-accent/40">
          <p className="label !text-accent">{t('calc.target')}</p>
          <RollingNumber value={result.calories} format={f.n0} className="block font-display text-2xl font-semibold text-accent" />
          <p className="text-[11px] text-muted">{t('common.kcal')} / {t('calc.day')}</p>
          <p className="num mt-0.5 text-[10px] leading-tight text-muted">{f.n0(rangeOf(result.calories)!.min)}–{f.n0(rangeOf(result.calories)!.max)}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative size-[168px] shrink-0">
          <PieChart width={168} height={168}>
            <Pie data={macros.map((m) => ({ name: m.key, value: m.pct }))} dataKey="value" innerRadius={54} outerRadius={80}
              paddingAngle={3} cornerRadius={6} stroke={c.surface} strokeWidth={2} startAngle={90} endAngle={-270}
              isAnimationActive animationDuration={700}>
              {macros.map((m) => <Cell key={m.key} fill={m.color} />)}
            </Pie>
          </PieChart>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="num text-xl font-semibold">{f.n0(result.calories)}</p>
              <p className="text-[11px] text-muted">{t('common.kcal')}</p>
            </div>
          </div>
        </div>
        <ul className="w-full space-y-2.5">
          {macros.map((m, i) => (
            <motion.li key={m.key} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
              className="flex items-center gap-3 rounded-2xl bg-[rgb(var(--line)/0.04)] px-3 py-2.5">
              <span className="size-3 shrink-0 rounded-full" style={{ background: m.color }} aria-hidden />
              <span className="flex-1 text-sm font-medium">{t(`macros.${m.key}`)}</span>
              <span className="text-end">
                <span className="num block text-lg font-semibold leading-tight"><RollingNumber value={m.g} format={f.n0} />{f.ar ? ' غ' : ' g'}</span>
                {rangeOf(m.g) && <span className="num block text-[10px] leading-tight text-muted">{f.n0(rangeOf(m.g)!.min)}–{f.n0(rangeOf(m.g)!.max)}</span>}
              </span>
              <span className="num w-12 text-end text-xs text-muted">{f.n1(m.pct)}%</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {result.warnings.length > 0 && (
        <ul className="space-y-2">
          {result.warnings.map((w) => <WarningRow key={w} w={w} result={result} />)}
        </ul>
      )}

      <p className="text-xs text-muted">{t('targets.rangeHint')}</p>

      <p className="flex gap-2 rounded-2xl bg-cyan/10 p-3 text-sm text-ink/90"><Info className="mt-0.5 size-4 shrink-0 text-cyan" />{t(`calc.tip.${goal}`)}</p>
      <p className="text-xs leading-relaxed text-muted">{t('calc.disclaimer')}</p>
    </Panel>
  );
}

function WarningRow({ w, result }: { w: Warning; result: CalcResult }) {
  const t = useTranslations();
  const strong = w === 'minorCut';
  return (
    <motion.li initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 rounded-2xl p-3 text-sm ${strong ? 'bg-bad/15 text-bad ring-1 ring-bad/30' : 'bg-warn/10 text-warn'}`}>
      <ShieldAlert className="mt-0.5 size-4 shrink-0" />
      <span>{t(`calc.warn.${w}`, { floor: result.floor, kcal: result.calories })}</span>
    </motion.li>
  );
}

function Stat({ label, hint, value }: { label: string; hint: string; value: number }) {
  const f = useFmt();
  const t = useTranslations();
  return (
    <div className="rounded-2xl bg-[rgb(var(--line)/0.04)] px-2 py-3" title={hint}>
      <p className="label">{label}</p>
      <RollingNumber value={value} format={f.n0} className="block font-display text-2xl font-semibold" />
      <p className="text-[11px] text-muted">{t('common.kcal')}</p>
    </div>
  );
}

function Choice({ on, onClick, icon: Icon, title, hint, badge, stacked }: {
  on: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; title: string; hint?: string; badge?: string; stacked?: boolean;
}) {
  return (
    <motion.button type="button" role="radio" aria-checked={on} onClick={() => { tick(5); onClick(); }}
      whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`relative flex items-center gap-3 overflow-hidden rounded-2xl border px-3.5 py-3 text-start transition-colors
        ${stacked ? 'flex-col justify-center gap-1.5 py-4 text-center' : ''}
        ${on ? 'border-accent/70 bg-accent/15 shadow-glow' : 'border-[rgb(var(--line)/0.12)] bg-[rgb(var(--line)/0.03)] hover:bg-[rgb(var(--line)/0.06)]'}`}>
      <span className={`grid size-9 shrink-0 place-items-center rounded-xl transition-colors ${on ? 'bg-accent text-on-accent' : 'bg-[rgb(var(--line)/0.06)] text-muted'}`}>
        <Icon className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
      {badge && <span className="num shrink-0 text-xs text-muted">{badge}</span>}
    </motion.button>
  );
}

function NumberInput({ label, value, onChange, onBlur, suffix, error, inputMode = 'decimal', ariaLabel, invalid }: {
  label?: string; value: string; onChange: (v: string) => void; onBlur?: () => void; suffix?: string; error?: string | null;
  inputMode?: 'decimal' | 'numeric'; ariaLabel?: string; invalid?: boolean;
}) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-medium">{label}</label>}
      <div className="relative">
        <input inputMode={inputMode} className={`field num ${suffix ? 'pe-14' : ''}`} value={value} aria-label={ariaLabel ?? label}
          aria-invalid={!!error || invalid} onBlur={onBlur}
          onChange={(e) => onChange(e.target.value.replace(',', '.').replace(/[^0-9.\-]/g, '').slice(0, 7))} />
        {suffix && <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-sm text-muted">{suffix}</span>}
      </div>
      {error && <p className="mt-1.5 text-xs text-bad">{error}</p>}
    </div>
  );
}
