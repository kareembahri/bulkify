'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { NutritionChart } from '@/components/features/NutritionChart';
import { TopLifts } from '@/components/features/TopLifts';
import { TrainingChart } from '@/components/features/TrainingChart';
import { Segmented } from '@/components/ui/Segmented';
import { ErrorState, PageSkeleton } from '@/components/ui/States';
import { loadWorkoutsRange } from '@/lib/data';
import { today } from '@/lib/dates';
import { useQuery } from '@/lib/query';

type Tab = 'training' | 'nutrition' | 'top';

/**
 * Progress: training chart, nutrition chart and the top-5 lifts board.
 * Phones show one at a time (tabs); large screens show all three.
 */
export default function ProgressPage() {
  const t = useTranslations();
  const [tab, setTab] = useState<Tab>('training');
  const all = useQuery('gym:all', () => loadWorkoutsRange(null, today()), 60_000);
  const show = (x: Tab) => (tab === x ? 'block' : 'hidden lg:block');
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-semibold tracking-tight">{t('progress.title')}</h1>
      <Segmented className="flex w-full lg:hidden" value={tab} onChange={setTab} label={t('progress.title')}
        options={[{ value: 'training', label: t('progress.tabTraining') }, { value: 'nutrition', label: t('progress.tabNutrition') }, { value: 'top', label: t('progress.tabTop') }]} />
      {all.error ? <ErrorState onRetry={all.refresh} /> : all.loading ? <PageSkeleton /> : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
            className="grid gap-4 lg:grid-cols-2 lg:items-start">
            <div className={show('training')}><TrainingChart workouts={all.data ?? []} /></div>
            <div className={show('nutrition')}><NutritionChart /></div>
            <div className={`${show('top')} lg:col-span-2`}><TopLifts workouts={all.data ?? []} /></div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
