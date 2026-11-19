'use client';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Panel, SectionTitle } from '@/components/ui/Panel';
import { ErrorState, Skeleton } from '@/components/ui/States';
import { useProfile } from '@/lib/auth';
import { loadDaily, loadFirstMealDate } from '@/lib/data';
import { addDays, addMonths, daysBetween, isValidISO, toISO, today } from '@/lib/dates';
import { useFmt } from '@/lib/format';
import { tick } from '@/lib/haptics';
import { useQuery } from '@/lib/query';
import { rangeSummary, type Mode, type Targets } from '@/lib/targets';
import { useThemeColors } from '@/lib/theme';

type Preset = '1d' | '1w' | '1m' | '3m' | '6m' | '1y' | 'custom';
const PRESETS: Preset[] = ['1d', '1w', '1m', '3m', '6m', '1y', 'custom'];

function startFor(p: Exclude<Preset, 'custom'>, end: string) {
  switch (p) {
    case '1d': return end;
    case '1w': return addDays(end, -6);
    case '1m': return addDays(addMonths(end, -1), 1);
    case '3m': return addDays(addMonths(end, -3), 1);
    case '6m': return addDays(addMonths(end, -6), 1);
    case '1y': return addDays(addMonths(end, -12), 1);
  }
}

/**
 * Nutrition over a range: what you ate vs. (daily target × days in the range),
 * per macro. Green when on target for your goal, red when not.
 */
export function NutritionChart() {
  const t = useTranslations();
  const f = useFmt();
  const c = useThemeColors();
  const { profile } = useProfile();
  const td = today();
  const [preset, setPreset] = useState<Preset>('1w');
  const [from, setFrom] = useState(addDays(td, -13));
  const [to, setTo] = useState(td);
  const firstMeal = useQuery('cal:firstMeal', loadFirstMealDate, 5 * 60_000);

  // Days before you started tracking are not counted (otherwise "1 year" is always red).
  const appStart = toISO(new Date(profile.created_at));
  const trackingStart = firstMeal.data && firstMeal.data < appStart ? firstMeal.data : appStart;
  const customOk = isValidISO(from) && isValidISO(to) && from <= to && to <= td;
  const rawFrom = preset === 'custom' ? from : startFor(preset, td);
  const rawTo = preset === 'custom' ? to : td;
  const start = rawFrom < trackingStart && trackingStart <= rawTo ? trackingStart : rawFrom;
  const end = rawTo;
  const valid = preset !== 'custom' || customOk;

  const q = useQuery(valid ? `nut:${start}:${end}` : null, () => loadDaily(start, end));
  const mode = (profile.goal ?? 'maintain') as Mode;
  const targets: Targets = { kcal: profile.kcal_goal, protein: profile.protein_goal, carbs: profile.carbs_goal, fat: profile.fat_goal };
  const sum = useMemo(() => rangeSummary(q.data ?? [], start, end, targets, mode),
    [q.data, start, end, mode, targets.kcal, targets.protein, targets.carbs, targets.fat]); // eslint-disable-line react-hooks/exhaustive-deps
  const data = sum.rows.map((r) => ({ ...r, label: t(`macros.${r.key}`), pct: Math.round(r.ratio * 100) }));
  const unit = (k: string) => (k === 'kcal' ? ` ${t('common.kcal')}` : f.ar ? ' غ' : ' g');
  const yMax = Math.max(150, ...data.map((d) => d.pct + 15));

  return (
    <Panel edge>
      <SectionTitle>{t('progress.nutrition')}</SectionTitle>
      <div className="no-scrollbar -mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {PRESETS.map((p) => (
          <button key={p} className="chip h-8 shrink-0 px-3 text-[13px]" aria-pressed={preset === p} onClick={() => { tick(5); setPreset(p); }}>{t(`progress.range.${p}`)}</button>
        ))}
      </div>
      {preset === 'custom' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-3 grid grid-cols-2 gap-2 overflow-hidden">
          <label className="text-xs text-muted">{t('common.from')}
            <input type="date" className="field num mt-1 h-11" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="text-xs text-muted">{t('common.to')}
            <input type="date" className="field num mt-1 h-11" value={to} min={from} max={td} onChange={(e) => setTo(e.target.value)} />
          </label>
          {!customOk && <p className="col-span-2 text-xs text-bad">{t('progress.badRange')}</p>}
        </motion.div>
      )}

      <p className="num mb-2 text-xs text-muted">
        {f.dayMonthYear(start)}{start !== end && <> – {f.dayMonthYear(end)}</>} · {t('progress.days', { n: Math.max(daysBetween(start, end) + 1, 0) })}
        {start !== rawFrom && <> · {t('progress.fromStart')}</>}
      </p>

      {q.error ? <ErrorState onRetry={q.refresh} /> : q.loading || !valid ? <Skeleton className="h-40 sm:h-56" /> : (
        <>
          <div className="h-40 sm:h-56" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 22, right: 8, bottom: 0, left: -18 }} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke={c.grid} />
                <XAxis dataKey="label" tick={{ fill: c.ink, fontSize: 12 }} axisLine={false} tickLine={false} reversed={f.ar} />
                <YAxis domain={[0, yMax]} tick={{ fill: c.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" orientation={f.ar ? 'right' : 'left'} />
                <ReferenceLine y={100} stroke={c.muted} strokeDasharray="4 4" label={{ value: '100%', fill: c.muted, fontSize: 10, position: 'insideTopRight' }} />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]} maxBarSize={44} animationDuration={900}>
                  {data.map((d) => <Cell key={d.key} fill={c.ok(d.ok)} />)}
                  <LabelList dataKey="pct" position="top" formatter={(v: unknown) => `${v}%`} style={{ fill: c.ink, fontSize: 12, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-1.5 sm:gap-2">
            {data.map((d, i) => (
              <motion.li key={d.key} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-xl p-2 sm:rounded-2xl sm:p-3" style={{ background: `color-mix(in srgb, ${c.ok(d.ok)} 12%, transparent)` }}>
                <p className="flex items-center justify-between text-xs font-semibold" style={{ color: c.ok(d.ok) }}>
                  {d.label}{d.ok ? <Check className="size-4" aria-label={t('progress.onTarget')} /> : <X className="size-4" aria-label={t('progress.offTarget')} />}
                </p>
                <p className="num mt-0.5 text-xs sm:text-sm"><span className="font-semibold">{f.n0(d.consumed)}</span><span className="text-muted"> / {f.n0(d.needed)}{unit(d.key)}</span></p>
              </motion.li>
            ))}
          </ul>
          <p className="mt-2 hidden text-xs text-muted sm:block">{t('progress.neededHint', { kcal: f.n0(profile.kcal_goal) })}</p>
        </>
      )}
    </Panel>
  );
}
