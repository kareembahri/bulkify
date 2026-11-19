'use client';
import { motion } from 'framer-motion';
import { Crown, Medal, Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Panel, SectionTitle } from '@/components/ui/Panel';
import { EmptyState } from '@/components/ui/States';
import { useExercises } from '@/lib/catalog';
import { useFmt } from '@/lib/format';
import { topLifts } from '@/lib/gym';
import type { Workout } from '@/lib/types';

const PODIUM = [
  { ring: 'from-[#FFE17A] to-[#E0A100]', text: 'text-[#B98500] dark:text-[#FFD34D]', icon: Crown },
  { ring: 'from-[#F1F4F8] to-[#9AA6B5]', text: 'text-[#6B7785]', icon: Medal },
  { ring: 'from-[#F5B48A] to-[#B4612C]', text: 'text-[#A55A2A]', icon: Medal },
];

/** Leaderboard of the 5 heaviest sets ever: weight × reps, exercise, date and which set it was. */
export function TopLifts({ workouts }: { workouts: Workout[] }) {
  const t = useTranslations();
  const f = useFmt();
  const ex = useExercises();
  const top = useMemo(() => topLifts(workouts, 5), [workouts]);
  return (
    <Panel edge>
      <SectionTitle><span className="inline-flex items-center gap-2"><Trophy className="size-3.5" />{t('progress.topLifts')}</span></SectionTitle>
      {top.length === 0 ? <EmptyState compact icon={Trophy} title={t('progress.noLifts')} hint={t('progress.noLiftsHint')} /> : (
        <ol className="space-y-1.5 sm:space-y-2">
          {top.map((l, i) => {
            const p = PODIUM[i];
            const Icon = p?.icon;
            return (
              <motion.li key={`${l.date}-${l.exercise_id}-${l.set_number}`}
                initial={{ opacity: 0, x: -24, scale: 0.97 }} whileInView={{ opacity: 1, x: 0, scale: 1 }} viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 260, damping: 24, delay: i * 0.08 }}
                whileHover={{ x: 4 }}
                className={`relative flex items-center gap-2.5 overflow-hidden rounded-2xl border p-2.5 sm:gap-3 sm:p-3 ${i === 0 ? 'border-[#E0A100]/40 bg-[#FFD34D]/[0.07]' : 'border-[rgb(var(--line)/0.08)] bg-[rgb(var(--line)/0.03)]'}`}>
                {i === 0 && <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[#FFD34D]/10 to-transparent" />}
                <div className={`relative grid size-9 shrink-0 sm:size-11 place-items-center rounded-full ${p ? `bg-gradient-to-br ${p.ring} p-[2px]` : ''}`}>
                  <div className={`grid size-full place-items-center rounded-full ${p ? 'bg-surface' : 'bg-[rgb(var(--line)/0.06)]'}`}>
                    {Icon ? <Icon className={`size-4 sm:size-5 ${p.text}`} /> : <span className="num text-sm font-bold text-muted">{i + 1}</span>}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold sm:text-base">{ex.name(ex.byId.get(l.exercise_id))}</p>
                  <p className="num text-xs text-muted">{f.dayMonthYear(l.date)} · {t('progress.setN', { n: l.set_number })}</p>
                </div>
                <div className="text-end">
                  <p className="num font-display text-xl font-semibold leading-none sm:text-2xl">{f.n1(l.weight_kg)}<span className="text-sm text-muted"> kg</span></p>
                  <p className="num text-xs text-muted">× {l.reps} {t('workout.reps').toLowerCase()}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      )}
    </Panel>
  );
}
