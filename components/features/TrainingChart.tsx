'use client';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, Equal, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Panel, SectionTitle } from '@/components/ui/Panel';
import { EmptyState } from '@/components/ui/States';
import { useExercises } from '@/lib/catalog';
import { addDays, startOfWeek, today } from '@/lib/dates';
import { useFmt } from '@/lib/format';
import { compareWeeks, type Verdict } from '@/lib/gym';
import { tick } from '@/lib/haptics';
import { useThemeColors, type ThemeColors } from '@/lib/theme';
import type { Workout } from '@/lib/types';

const verdictColor = (c: ThemeColors, v: Verdict) => (v === 'better' ? c.ok(true) : v === 'worse' ? c.ok(false) : c.mutedSoft);
const VERDICT_ICON = { better: ArrowUpRight, worse: ArrowDownRight, same: Equal, new: Sparkles } as const;

/**
 * Training: every exercise of the chosen week against the week before (best set:
 * heaviest weight, then most reps). Green = this week is better, red = last week was.
 */
export function TrainingChart({ workouts }: { workouts: Workout[] }) {
  const t = useTranslations();
  const f = useFmt();
  const ex = useExercises();
  const c = useThemeColors();
  const okColor = c.ok;
  const NEUTRAL = c.mutedSoft;
  const thisWeek = startOfWeek(today());
  const [week, setWeek] = useState(thisWeek);
  const [all, setAll] = useState(false);
  const LIST = 5;
  const prevWeek = addDays(week, -7);

  const rows = useMemo(() => compareWeeks(workouts, week, prevWeek, addDays(week, 6))
    .map((r) => ({ ...r, name: ex.name(ex.byId.get(r.exercise_id)), prevKg: r.prev ? +r.prev.weight_kg : 0, curKg: +r.cur.weight_kg }))
    .sort((a, b) => b.curKg - a.curKg), [workouts, week, prevWeek, ex]);
  const better = rows.filter((r) => r.verdict === 'better').length;
  const worse = rows.filter((r) => r.verdict === 'worse').length;

  const go = (d: 1 | -1) => { const n = addDays(week, 7 * d); if (n > thisWeek) return; tick(5); setWeek(n); };
  const label = week === thisWeek ? t('progress.thisWeek') : week === addDays(thisWeek, -7) ? t('progress.lastWeek') : `${f.dayMonth(week)} – ${f.dayMonth(addDays(week, 6))}`;

  return (
    <Panel edge>
      <SectionTitle>{t('progress.training')}</SectionTitle>
      <div className="mb-3 flex items-center justify-between gap-2 rounded-2xl bg-[rgb(var(--line)/0.04)] p-1">
        <button onClick={() => go(-1)} className="press grid size-9 place-items-center rounded-xl hover:bg-[rgb(var(--line)/0.08)]" aria-label={t('common.prev')}><ChevronLeft className="size-5 rtl:rotate-180" /></button>
        <div className="text-center">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-[11px] text-muted">{t('progress.vsWeekBefore')}</p>
        </div>
        <button onClick={() => go(1)} disabled={week >= thisWeek} className="press grid size-9 place-items-center rounded-xl hover:bg-[rgb(var(--line)/0.08)] disabled:opacity-30" aria-label={t('common.next')}><ChevronRight className="size-5 rtl:rotate-180" /></button>
      </div>

      {rows.length === 0 ? (
        <EmptyState compact icon={Sparkles} title={t('progress.noTraining')} hint={t('progress.noTrainingHint')} />
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold" style={{ background: `color-mix(in srgb, ${okColor(true)} 16%, transparent)`, color: okColor(true) }}>
              <ArrowUpRight className="size-3.5" />{t('progress.better', { n: better })}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold" style={{ background: `color-mix(in srgb, ${okColor(false)} 16%, transparent)`, color: okColor(false) }}>
              <ArrowDownRight className="size-3.5" />{t('progress.worse', { n: worse })}
            </span>
          </div>
          {/* legend: two series */}
          <div className="mb-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm" style={{ background: NEUTRAL }} />{t('progress.weekBefore')}</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm" style={{ background: `linear-gradient(90deg, ${okColor(true)} 50%, ${okColor(false)} 50%)` }} />{t('progress.chosenWeek')}</span>
          </div>
          <div style={{ height: Math.min(Math.max(rows.length * 34 + 30, 120), 340) }} dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 4 }} barGap={2} barCategoryGap="22%">
                <CartesianGrid horizontal={false} stroke={c.grid} />
                <XAxis type="number" tick={{ fill: c.muted, fontSize: 11 }} axisLine={false} tickLine={false} unit=" kg" reversed={f.ar} />
                <YAxis type="category" dataKey="name" width={88} tick={{ fill: c.ink, fontSize: 10 }} axisLine={false} tickLine={false}
                  orientation={f.ar ? 'right' : 'left'} tickFormatter={(v: string) => (v.length > 13 ? v.slice(0, 12) + '…' : v)} />
                <Tooltip cursor={{ fill: c.grid }} content={<TrainTip c={c} />} />
                <Bar dataKey="prevKg" name={t('progress.weekBefore')} fill={NEUTRAL} radius={[0, 4, 4, 0]} maxBarSize={10} animationDuration={700} />
                <Bar dataKey="curKg" name={t('progress.chosenWeek')} radius={[0, 4, 4, 0]} maxBarSize={10} animationDuration={900}>
                  {rows.map((r) => <Cell key={r.exercise_id} fill={verdictColor(c, r.verdict)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 divide-y divide-[rgb(var(--line)/0.07)]">
            {(all ? rows : rows.slice(0, LIST)).map((r, i) => {
              const Icon = VERDICT_ICON[r.verdict];
              return (
                <motion.li key={r.exercise_id} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-2.5 py-1.5 text-[13px]">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg" style={{ background: `color-mix(in srgb, ${verdictColor(c, r.verdict)} 18%, transparent)`, color: verdictColor(c, r.verdict) }}>
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{r.name}</span>
                  <span className="num shrink-0 text-xs text-muted" dir="ltr">
                    {r.prev ? `${+r.prev.weight_kg}×${r.prev.reps}` : '—'} → <span className="font-semibold text-ink">{+r.cur.weight_kg}×{r.cur.reps}</span>
                  </span>
                </motion.li>
              );
            })}
          </ul>
          {rows.length > LIST && (
            <button onClick={() => setAll((x) => !x)} className="press mt-1 w-full rounded-xl py-2 text-sm font-medium text-accent hover:bg-[rgb(var(--line)/0.05)]">
              {all ? t('progress.showLess') : t('progress.showAll', { n: rows.length })}
            </button>
          )}
        </>
      )}
    </Panel>
  );
}

function TrainTip({ c, active, payload }: { c: ThemeColors; active?: boolean; payload?: { payload: { name: string; prev: { weight_kg: number; reps: number } | null; cur: { weight_kg: number; reps: number }; verdict: Verdict } }[] }) {
  const t = useTranslations();
  if (!active || !payload?.length) return null;
  const r = payload[0].payload;
  return (
    <div className="glass-strong rounded-xl px-3 py-2 text-xs shadow-lift">
      <p className="mb-1 font-semibold">{r.name}</p>
      <p className="num text-muted">{t('progress.weekBefore')}: {r.prev ? `${+r.prev.weight_kg} kg × ${r.prev.reps}` : '—'}</p>
      <p className="num" style={{ color: verdictColor(c, r.verdict) }}>{t('progress.chosenWeek')}: {+r.cur.weight_kg} kg × {r.cur.reps}</p>
    </div>
  );
}
