'use client';
import { motion } from 'framer-motion';
import { Dumbbell, NotebookPen, UtensilsCrossed } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/States';
import { useProfile } from '@/lib/auth';
import { useExercises } from '@/lib/catalog';
import { loadMeals, loadNote, loadWorkout } from '@/lib/data';
import { useFmt } from '@/lib/format';
import { totals } from '@/lib/nutrition';
import { useQuery } from '@/lib/query';
import { MacroBars } from './MacroBars';
import { useItemTitle } from './MealParts';

/** A calendar day: macros vs targets, the exercises trained (with sets) and every note of that day. */
export function DaySheet({ date, onClose }: { date: string | null; onClose: () => void }) {
  const t = useTranslations();
  const f = useFmt();
  const router = useRouter();
  const { profile } = useProfile();
  const ex = useExercises();
  const title = useItemTitle();
  const w = useQuery(date ? `workout:${date}` : null, () => loadWorkout(date!));
  const meals = useQuery(date ? `meals:${date}` : null, () => loadMeals(date!));
  const note = useQuery(date ? `note:${date}` : null, () => loadNote(date!));
  const tot = totals((meals.data ?? []).flatMap((m) => m.items));
  const exerciseNotes = (w.data?.exercises ?? []).filter((e) => e.note.trim());
  const hasNotes = !!note.data?.trim() || exerciseNotes.length > 0;

  return (
    <Sheet open={!!date} onClose={onClose} tall title={date ? f.dayLong(date) : ''}>
      {date && (
        <motion.div className="space-y-6 pb-6" initial="h" animate="s" transition={{ staggerChildren: 0.07 }}>
          <motion.section variants={{ h: { opacity: 0, y: 12 }, s: { opacity: 1, y: 0 } }}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="label flex items-center gap-2"><UtensilsCrossed className="size-3.5" />{t('calendar.macros')}</h3>
              <Button size="sm" onClick={() => router.push(`/food?date=${date}`)}>{t('calendar.openFood')}</Button>
            </div>
            {meals.loading ? <Skeleton className="h-28" /> : (
              <div className="space-y-3 rounded-2xl bg-[rgb(var(--line)/0.04)] p-3">
                <MacroBars totals={tot} profile={profile} compact />
                {(meals.data ?? []).length > 0 ? (
                  <ul className="space-y-1 border-t border-[rgb(var(--line)/0.07)] pt-2 text-sm">
                    {meals.data!.map((m) => (
                      <li key={m.id}>
                        <p className="flex justify-between gap-2 font-medium"><span>{m.name}</span><span className="num text-muted">{f.n0(totals(m.items).kcal)} {t('common.kcal')}</span></p>
                        {m.items.length > 0 && <p className="truncate text-xs text-muted">{m.items.map(title).join(' · ')}</p>}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-muted">{t('calendar.noMeals')}</p>}
              </div>
            )}
          </motion.section>

          <motion.section variants={{ h: { opacity: 0, y: 12 }, s: { opacity: 1, y: 0 } }}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="label flex items-center gap-2"><Dumbbell className="size-3.5" />{t('calendar.workout')}</h3>
              <Button size="sm" onClick={() => router.push(`/workout?date=${date}`)}>{t('calendar.openWorkout')}</Button>
            </div>
            {w.loading ? <Skeleton className="h-20" /> : !w.data || !w.data.exercises.length ? (
              <p className="text-sm text-muted">{t('calendar.noWorkout')}</p>
            ) : (
              <div className="rounded-2xl bg-[rgb(var(--line)/0.04)] p-3">
                <p className="mb-2 font-display text-lg font-semibold">{w.data.day_name || t('home.untitled')}</p>
                <ul className="space-y-2">
                  {w.data.exercises.map((e, i) => (
                    <li key={e.id} className="flex gap-2.5 text-sm">
                      <span className="num grid size-6 shrink-0 place-items-center rounded-lg bg-accent/15 text-xs font-semibold text-accent">{i + 1}</span>
                      <span className="min-w-0">
                        <span className="block font-medium">{ex.name(ex.byId.get(e.exercise_id))}</span>
                        <span className="num block text-xs text-muted" dir="ltr">{e.sets.map((s) => `${+s.weight_kg}kg × ${s.reps}`).join('  ·  ') || '—'}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.section>

          <motion.section variants={{ h: { opacity: 0, y: 12 }, s: { opacity: 1, y: 0 } }}>
            <h3 className="label mb-2 flex items-center gap-2"><NotebookPen className="size-3.5" />{t('calendar.notes')}</h3>
            {!hasNotes ? <p className="text-sm text-muted">{t('calendar.noNotes')}</p> : (
              <ul className="space-y-2">
                {note.data?.trim() && (
                  <li className="rounded-2xl bg-[rgb(var(--line)/0.04)] p-3 text-sm">
                    <p className="label mb-1">{t('food.dayNote')}</p>{note.data}
                  </li>
                )}
                {exerciseNotes.map((e) => (
                  <li key={e.id} className="rounded-2xl bg-[rgb(var(--line)/0.04)] p-3 text-sm">
                    <p className="label mb-1">{ex.name(ex.byId.get(e.exercise_id))}</p>{e.note}
                  </li>
                ))}
              </ul>
            )}
          </motion.section>
        </motion.div>
      )}
    </Sheet>
  );
}
