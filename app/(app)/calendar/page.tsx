'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Dumbbell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { DaySheet } from '@/components/features/DaySheet';
import { Panel } from '@/components/ui/Panel';
import { ErrorState, Skeleton } from '@/components/ui/States';
import { useProfile } from '@/lib/auth';
import { loadDaily, loadFirstMealDate, loadWorkoutSummaries } from '@/lib/data';
import { addDays, endOfMonth, range, startOfMonth, startOfWeek, toISO, today } from '@/lib/dates';
import { useFmt } from '@/lib/format';
import { tick } from '@/lib/haptics';
import { useQuery } from '@/lib/query';
import { dayOnTarget, monthSummary, okColor, type Mode, type MonthSummary, type Targets } from '@/lib/targets';
import type { DayNutrition } from '@/lib/types';

type YearData = { nut: Map<string, DayNutrition>; workouts: Map<string, { day_name: string; count: number }> };

export default function CalendarPage() {
  const t = useTranslations();
  const f = useFmt();
  const { profile } = useProfile();
  const td = today();
  const [year, setYear] = useState(Number(td.slice(0, 4)));
  const [month, setMonth] = useState<string | null>(null);   // 'YYYY-MM' when a month is open
  const [open, setOpen] = useState<string | null>(null);
  const [dir, setDir] = useState(1);

  const from = `${year}-01-01`, to = `${year}-12-31`;
  const q = useQuery(`cal:year:${year}`, async (): Promise<YearData> => {
    const [ns, ws] = await Promise.all([loadDaily(from, to), loadWorkoutSummaries(from, to)]);
    return {
      nut: new Map(ns.map((n) => [n.date, n])),
      workouts: new Map(ws.filter((w) => w.count > 0).map((w) => [w.date, { day_name: w.day_name, count: w.count }])),
    };
  });
  const firstMeal = useQuery('cal:firstMeal', loadFirstMealDate, 5 * 60_000);

  const mode = (profile.goal ?? 'maintain') as Mode;
  const targets: Targets = { kcal: profile.kcal_goal, protein: profile.protein_goal, carbs: profile.carbs_goal, fat: profile.fat_goal };
  const appStart = toISO(new Date(profile.created_at));
  const trackingStart = firstMeal.data && firstMeal.data < appStart ? firstMeal.data : appStart;

  const months = useMemo(() => {
    const days = [...(q.data?.nut.values() ?? [])];
    return Array.from({ length: 12 }, (_, i) => {
      const m = `${year}-${String(i + 1).padStart(2, '0')}`;
      const workouts = [...(q.data?.workouts.keys() ?? [])].filter((d) => d.startsWith(m)).length;
      return { m, summary: monthSummary(m, days, targets, mode, trackingStart, td), workouts };
    });
  }, [q.data, year, mode, trackingStart, td, targets.kcal, targets.protein]); // eslint-disable-line react-hooks/exhaustive-deps

  const openMonth = (m: string) => { tick(5); setDir(1); setMonth(m); };
  const shiftYear = (d: 1 | -1) => { tick(5); setDir(d); setYear((y) => y + d); };
  const shiftMonth = (d: 1 | -1) => {
    tick(5); setDir(d);
    const [y, mm] = month!.split('-').map(Number);
    const n = new Date(y, mm - 1 + d, 1);
    const next = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`;
    if (n.getFullYear() !== year) setYear(n.getFullYear());
    setMonth(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {month && (
            <button onClick={() => { tick(5); setDir(-1); setMonth(null); }} className="press glass grid size-10 place-items-center rounded-full" aria-label={t('calendar.backToYear')}>
              <ArrowLeft className="size-5 rtl:rotate-180" />
            </button>
          )}
          <h1 className="font-display text-3xl font-semibold tracking-tight">{t('calendar.title')}</h1>
        </div>
      </div>

      <div className="glass flex items-center justify-between rounded-2xl p-1">
        <button onClick={() => (month ? shiftMonth(-1) : shiftYear(-1))} className="press grid size-10 place-items-center rounded-xl hover:bg-[rgb(var(--line)/0.08)]" aria-label={t('common.prev')}><ChevronLeft className="size-5 rtl:rotate-180" /></button>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={month ?? year} initial={{ opacity: 0, y: dir * 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -dir * 10 }}
            className="num font-display text-lg font-semibold">{month ? f.month(`${month}-01`) : year}</motion.span>
        </AnimatePresence>
        <button onClick={() => (month ? shiftMonth(1) : shiftYear(1))} className="press grid size-10 place-items-center rounded-xl hover:bg-[rgb(var(--line)/0.08)]" aria-label={t('common.next')}><ChevronRight className="size-5 rtl:rotate-180" /></button>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: okColor(true) }} />{month ? t('calendar.dayGood') : t('calendar.monthGood')}</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: okColor(false) }} />{month ? t('calendar.dayBad') : t('calendar.monthBad')}</span>
        <span className="flex items-center gap-1.5"><Dumbbell className="size-3 text-accent" />{t('calendar.legendTrained')}</span>
      </div>

      {q.error ? <ErrorState onRetry={q.refresh} /> : q.loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 12 }, (_, i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}</div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          {!month ? (
            <motion.div key={`y${year}`} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -dir * 30 }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {months.map(({ m, summary, workouts }, i) => (
                <MonthTile key={m} month={m} summary={summary} workouts={workouts} index={i} data={q.data!} targets={targets} mode={mode}
                  isCurrent={td.startsWith(m)} onClick={() => openMonth(m)} />
              ))}
            </motion.div>
          ) : (
            <motion.div key={month} initial={{ opacity: 0, x: dir * 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -dir * 30 }}>
              <MonthGrid month={month} data={q.data!} targets={targets} mode={mode} trackingStart={trackingStart} onOpen={setOpen}
                summary={months.find((x) => x.m === month)?.summary} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
      <DaySheet date={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function MonthTile({ month, summary, workouts, index, data, targets, mode, isCurrent, onClick }: {
  month: string; summary: MonthSummary; workouts: number; index: number; data: YearData; targets: Targets; mode: Mode; isCurrent: boolean; onClick: () => void;
}) {
  const t = useTranslations();
  const f = useFmt();
  const color = summary.status === 'none' ? null : okColor(summary.status === 'good');
  const days = range(`${month}-01`, endOfMonth(`${month}-01`));
  return (
    <motion.button type="button" onClick={onClick}
      initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: index * 0.03 }}
      whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
      className={`glass relative overflow-hidden rounded-3xl p-3.5 text-start ${isCurrent ? 'ring-1 ring-accent/60' : ''}`}
      aria-label={`${f.month(`${month}-01`)} · ${summary.status === 'none' ? t('calendar.noData') : t(summary.status === 'good' ? 'calendar.monthGood' : 'calendar.monthBad')}`}>
      {color && <div className="pointer-events-none absolute -end-8 -top-8 size-24 rounded-full opacity-30" style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }} />}
      <div className="relative flex items-center justify-between gap-2">
        <span className="font-display text-lg font-semibold">{f.monthShort(`${month}-01`)}</span>
        <span className="size-3 rounded-full" style={{ background: color ?? 'rgb(var(--line) / 0.15)', boxShadow: color ? `0 0 12px ${color}` : undefined }} />
      </div>
      {/* tiny heat strip of the days */}
      <div className="relative mt-2 grid grid-cols-7 gap-[3px]">
        {days.map((d) => {
          const n = data.nut.get(d);
          const c = n ? okColor(dayOnTarget(n, targets, mode)) : 'rgb(var(--line) / 0.08)';
          return <span key={d} className="aspect-square rounded-[3px]" style={{ background: c, opacity: n ? 0.85 : 1 }} />;
        })}
      </div>
      <p className="num relative mt-2 text-[11px] text-muted">
        {summary.counted ? t('calendar.daysOnTarget', { n: summary.onTarget, total: summary.counted }) : t('calendar.noData')}
        {workouts > 0 && <> · <Dumbbell className="inline size-3 text-accent" /> {workouts}</>}
      </p>
    </motion.button>
  );
}

function MonthGrid({ month, data, targets, mode, trackingStart, onOpen, summary }: {
  month: string; data: YearData; targets: Targets; mode: Mode; trackingStart: string; onOpen: (d: string) => void; summary?: MonthSummary;
}) {
  const t = useTranslations();
  const f = useFmt();
  const td = today();
  const first = startOfMonth(`${month}-01`);
  const days = range(startOfWeek(first), addDays(startOfWeek(endOfMonth(first)), 6));
  const heads = Array.from({ length: 7 }, (_, i) => f.weekdayName(i, 'short'));
  return (
    <Panel className="p-2 sm:p-3">
      {summary && summary.status !== 'none' && (
        <p className="mb-2 px-1 text-sm">
          <span className="font-semibold" style={{ color: okColor(summary.status === 'good') }}>{t(summary.status === 'good' ? 'calendar.monthGood' : 'calendar.monthBad')}</span>
          <span className="num text-muted"> · {t('calendar.daysOnTarget', { n: summary.onTarget, total: summary.counted })}</span>
        </p>
      )}
      <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-muted">{heads.map((h) => <div key={h} className="py-1">{h}</div>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const inMonth = d.startsWith(month);
          const n = data.nut.get(d);
          const w = data.workouts.get(d);
          const ok = n ? dayOnTarget(n, targets, mode) : null;
          const missed = !n && d < td && d >= trackingStart;
          const color = ok === null ? (missed ? okColor(false) : null) : okColor(ok);
          return (
            <motion.button key={d} type="button" onClick={() => { tick(5); onOpen(d); }} disabled={!inMonth}
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: inMonth ? 1 : 0.25, scale: 1 }} transition={{ delay: i * 0.008 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`${f.dayLong(d)}${w ? ` · ${w.day_name}` : ''}${ok === null ? '' : ok ? ` · ${t('calendar.dayGood')}` : ` · ${t('calendar.dayBad')}`}`}
              className={`relative flex aspect-[0.8] flex-col items-center justify-between overflow-hidden rounded-xl p-1 sm:aspect-square ${d === td ? 'ring-2 ring-accent' : ''}`}
              style={{ background: color ? `color-mix(in srgb, ${color} ${n ? 24 : 9}%, transparent)` : 'rgb(var(--line) / 0.04)' }}>
              <span className={`num text-[13px] font-semibold ${d === td ? 'text-accent' : ''}`}>{+d.slice(8)}</span>
              {w ? <Dumbbell className="size-3.5 text-accent" /> : <span className="h-3.5" />}
              <span className="h-1 w-3/5 rounded-full" style={{ background: color ?? 'transparent', opacity: n ? 1 : 0.4 }} />
            </motion.button>
          );
        })}
      </div>
    </Panel>
  );
}
