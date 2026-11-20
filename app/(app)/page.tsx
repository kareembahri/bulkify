'use client';
import { motion } from 'framer-motion';
import { BedDouble, CalendarHeart, ChevronRight, Dumbbell, Rocket, Route, UtensilsCrossed } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Panel, TapPanel } from '@/components/ui/Panel';
import { Ring } from '@/components/ui/Ring';
import { RollingNumber } from '@/components/ui/RollingNumber';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/States';
import { useItemTitle } from '@/components/features/MealParts';
import { useProfile } from '@/lib/auth';
import { useExercises } from '@/lib/catalog';
import { loadCardio, loadMeals, loadProgram, loadWorkout } from '@/lib/data';
import { daysBetween, startOfWeek, toISO, today, weekdayIndex } from '@/lib/dates';
import { useFmt } from '@/lib/format';
import { totals } from '@/lib/nutrition';
import { useQuery } from '@/lib/query';
import type { CardioEntry } from '@/lib/types';
import { rangeOf, ratioOf, score, scoreColor, type Mode } from '@/lib/targets';
import { ExerciseGuideButton } from '@/components/features/ExerciseGuide';

const item = { hidden: { opacity: 0, y: 22, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1 } };

export default function HomePage() {
  const t = useTranslations();
  const f = useFmt();
  const router = useRouter();
  const { profile } = useProfile();
  const ex = useExercises();
  const title = useItemTitle();
  const d = today();
  const w = useQuery(`workout:${d}`, () => loadWorkout(d));
  const week0 = startOfWeek(d);
  const runs = useQuery(`runs:${week0}:${d}`, async () => (await loadCardio(week0, d)).filter((c) => c.kind === 'run_outside'));
  const meals = useQuery(`meals:${d}`, () => loadMeals(d));
  const program = useQuery('program', loadProgram);
  const [sheet, setSheet] = useState<'ex' | 'meals' | null>(null);

  const mode = (profile.goal ?? 'maintain') as Mode;
  const count = w.data?.exercises.length ?? 0;
  const plan = program.data?.find((p) => p.weekday === weekdayIndex(d));
  const restDay = count === 0 && !!plan?.is_rest;
  const tot = totals((meals.data ?? []).flatMap((m) => m.items));
  const kcalColor = scoreColor(score(ratioOf(tot.kcal, profile.kcal_goal), mode));
  const protColor = scoreColor(score(ratioOf(tot.protein_g, profile.protein_goal), mode));

  const hour = new Date().getHours();
  const greet = hour < 12 ? t('home.morning') : hour < 18 ? t('home.afternoon') : t('home.evening');
  const appStart = toISO(new Date(profile.created_at));

  return (
    <motion.div className="space-y-4" initial="hidden" animate="show" transition={{ staggerChildren: 0.08 }}>
      <motion.div variants={item}>
        <p className="text-sm text-muted">{f.dayLong(d)}</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {greet}{profile.display_name ? <>, <span className="shine">{profile.display_name}</span></> : ''}
        </h1>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 1 · training today */}
        <motion.div variants={item}>
          {w.loading || program.loading ? <Skeleton className="h-44 rounded-3xl" /> : restDay ? (
            <Panel edge className="flex h-full min-h-44 items-center gap-4">
              <motion.div animate={{ rotate: [0, -6, 6, 0] }} transition={{ duration: 6, repeat: Infinity }}
                className="grid size-16 shrink-0 place-items-center rounded-2xl bg-cyan/15"><BedDouble className="size-8 text-cyan" /></motion.div>
              <div>
                <p className="label">{t('home.training')}</p>
                <p className="font-display text-3xl font-semibold">{t('home.restDay')}</p>
                <p className="text-sm text-muted">{t('home.restHint')}</p>
              </div>
            </Panel>
          ) : (
            <TapPanel edge className="h-full min-h-44" onClick={() => (count ? setSheet('ex') : router.push('/workout'))}
              aria-label={`${t('home.training')}: ${t('home.exercisesToday', { n: count })}`}>
              <div className="flex items-center justify-between">
                <p className="label">{t('home.training')}</p>
                <ChevronRight className="size-4 text-muted rtl:rotate-180" />
              </div>
              <div className="mt-3 flex items-end gap-4">
                <RollingNumber value={count} className="font-display text-7xl font-semibold leading-none text-accent drop-shadow-[0_0_24px_rgb(var(--accent)/0.45)]" />
                <div className="pb-1.5">
                  <p className="font-semibold">{t('home.exercisesWord', { n: count })}</p>
                  <p className="text-sm text-muted">{count ? (w.data?.day_name || t('home.untitled')) : t('home.tapToStart')}</p>
                </div>
              </div>
              <Dumbbell className="pointer-events-none absolute -bottom-4 end-3 size-28 -rotate-12 text-accent/[0.07]" aria-hidden />
            </TapPanel>
          )}
        </motion.div>

        {/* 2 · calories + protein so far today, against the targets */}
        <motion.div variants={item}>
          {meals.loading ? <Skeleton className="h-44 rounded-3xl" /> : (
            <TapPanel edge className="h-full" onClick={() => setSheet('meals')} aria-label={t('home.nutritionToday')}>
              <div className="flex items-center justify-between">
                <p className="label">{t('home.nutritionToday')}</p>
                <ChevronRight className="size-4 text-muted rtl:rotate-180" />
              </div>
              <div className="mt-2 flex items-center justify-around gap-2">
                <div className="flex flex-col items-center">
                  <Ring label={t('home.calories')} value={tot.kcal} goal={profile.kcal_goal} color={kcalColor} format={f.n0} size={148} stroke={12}
                    sub={<span className="num">/ {f.n0(profile.kcal_goal)}</span>} />
                  <RangeLine range={rangeOf(profile.kcal_goal)} fmt={f.n0} />
                </div>
                <div className="flex flex-col items-center">
                  <Ring label={t('home.protein')} value={tot.protein_g} goal={profile.protein_goal} color={protColor} format={f.n0} size={148} stroke={12}
                    sub={<span className="num">/ {f.g(profile.protein_goal)}</span>} />
                  <RangeLine range={rangeOf(profile.protein_goal)} fmt={f.g} />
                </div>
              </div>
            </TapPanel>
          )}
        </motion.div>
      </div>

      {/* 3 · running outside: km today and this week */}
      <motion.div variants={item}>
        <RunsCard runs={runs.data} loading={runs.loading} today={d} />
      </motion.div>

      {/* 4 · since when */}
      <motion.div variants={item}>
        <Panel className="grid grid-cols-2 divide-x divide-[rgb(var(--line)/0.08)] p-0 rtl:divide-x-reverse">
          <div className="flex items-center gap-3 p-4">
            <Rocket className="size-5 shrink-0 text-cyan" />
            <div className="min-w-0">
              <p className="label">{t('home.usingSince')}</p>
              <p className="num truncate font-semibold">{f.dayMonthYear(appStart)}</p>
              <p className="num text-xs text-muted">{t('home.daysAgo', { n: Math.max(daysBetween(appStart, d), 0) })}</p>
            </div>
          </div>
          {profile.gym_start_date ? (
            <div className="flex items-center gap-3 p-4">
              <CalendarHeart className="size-5 shrink-0 text-accent" />
              <div className="min-w-0">
                <p className="label">{t('home.gymSince')}</p>
                <p className="num truncate font-semibold">{f.dayMonthYear(profile.gym_start_date)}</p>
                <p className="num text-xs text-muted">{t('home.daysAgo', { n: Math.max(daysBetween(profile.gym_start_date, d), 0) })}</p>
              </div>
            </div>
          ) : (
            <Link href="/settings" className="press flex items-center gap-3 p-4 hover:bg-[rgb(var(--line)/0.04)]">
              <CalendarHeart className="size-5 shrink-0 text-muted" />
              <div><p className="label">{t('home.gymSince')}</p><p className="text-sm text-accent">{t('home.setGymStart')}</p></div>
            </Link>
          )}
        </Panel>
      </motion.div>

      {/* lists (read-only) */}
      <Sheet open={sheet === 'ex'} onClose={() => setSheet(null)} title={w.data?.day_name || t('home.exercisesTitle')}>
        <ol className="space-y-2 pb-6">
          {(w.data?.exercises ?? []).map((e, i) => (
            <motion.li key={e.id} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-2xl bg-[rgb(var(--line)/0.04)] px-3 py-3">
              <span className="num grid size-8 shrink-0 place-items-center rounded-xl bg-accent/15 text-sm font-semibold text-accent">{i + 1}</span>
              <span className="min-w-0 flex-1 font-medium">{ex.name(ex.byId.get(e.exercise_id))}</span>
              <ExerciseGuideButton exercise={ex.byId.get(e.exercise_id)} name={ex.name(ex.byId.get(e.exercise_id))} />
            </motion.li>
          ))}
        </ol>
      </Sheet>

      <Sheet open={sheet === 'meals'} onClose={() => setSheet(null)} title={t('home.mealsTitle')}>
        <div className="space-y-3 pb-6">
          {!meals.data?.length ? (
            <div className="py-8 text-center">
              <UtensilsCrossed className="mx-auto mb-2 size-7 text-muted" />
              <p className="text-sm text-muted">{t('home.noMeals')}</p>
            </div>
          ) : meals.data.map((m, i) => {
            const mt = totals(m.items);
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-[rgb(var(--line)/0.04)] p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-display font-semibold">{m.name}</p>
                  <p className="num text-sm"><span className="font-semibold">{f.n0(mt.kcal)}</span> <span className="text-muted">{t('common.kcal')} · P {f.n0(mt.protein_g)}</span></p>
                </div>
                {m.items.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5 text-sm text-muted">
                    {m.items.map((it) => (
                      <li key={it.id} className="flex justify-between gap-2"><span className="truncate">{title(it)}</span><span className="num">{f.n0(it.kcal)}</span></li>
                    ))}
                  </ul>
                )}
              </motion.div>
            );
          })}
        </div>
      </Sheet>
    </motion.div>
  );
}

/** Small "min – max" caption under a target (the target is the middle of the range). */
function RangeLine({ range, fmt }: { range: { min: number; max: number } | null; fmt: (n: number) => string }) {
  const t = useTranslations();
  if (!range) return null;
  return (
    <p className="num mt-1 text-center text-[11px] leading-tight text-muted">
      {t('targets.min')} {fmt(range.min)} · {t('targets.max')} {fmt(range.max)}
    </p>
  );
}

/** Running outside: kilometres today and this week (Monday → today). */
function RunsCard({ runs, loading, today: d }: { runs: CardioEntry[] | undefined; loading: boolean; today: string }) {
  const t = useTranslations();
  const f = useFmt();
  const router = useRouter();
  if (loading) return <Skeleton className="h-24 rounded-3xl" />;
  const list = runs ?? [];
  const todayKm = list.filter((r) => r.date === d).reduce((s, r) => s + (r.distance_km ?? 0), 0);
  const weekKm = list.reduce((s, r) => s + (r.distance_km ?? 0), 0);
  return (
    <TapPanel className="relative" onClick={() => router.push('/workout')} aria-label={t('home.running')}>
      <div className="flex items-center justify-between">
        <p className="label">{t('home.running')}</p>
        <ChevronRight className="size-4 text-muted rtl:rotate-180" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div>
          <p className="font-display text-4xl font-semibold leading-none text-accent">
            <RollingNumber value={Math.round(todayKm * 10) / 10} format={f.n1} /> <span className="text-base text-muted">{t('cardio.km')}</span>
          </p>
          <p className="mt-1 text-xs text-muted">{t('common.today')}</p>
        </div>
        <div>
          <p className="font-display text-4xl font-semibold leading-none">
            <RollingNumber value={Math.round(weekKm * 10) / 10} format={f.n1} /> <span className="text-base text-muted">{t('cardio.km')}</span>
          </p>
          <p className="mt-1 text-xs text-muted">{t('home.runsWeek', { n: list.length })}</p>
        </div>
      </div>
      {list.length === 0 && <p className="mt-2 text-xs text-muted">{t('home.noRuns')}</p>}
      <Route className="pointer-events-none absolute -bottom-3 end-3 size-20 -rotate-12 text-accent/[0.07]" aria-hidden />
    </TapPanel>
  );
}
