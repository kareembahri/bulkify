'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowLeft, ArrowUp, BedDouble, Dumbbell, Plus, ShieldCheck, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { ExercisePicker } from '@/components/features/ExercisePicker';
import { Counter } from '@/components/ui/Field';
import { Panel } from '@/components/ui/Panel';
import { ErrorState, PageSkeleton } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { useExercises } from '@/lib/catalog';
import { loadProgram, setProgramExercises, updateProgramDay } from '@/lib/data';
import { today, weekdayIndex } from '@/lib/dates';
import { useFmt } from '@/lib/format';
import { invalidate, setData, useQuery } from '@/lib/query';
import { clampChars } from '@/lib/text';
import { LIMITS, type ProgramDay } from '@/lib/types';
import { ExerciseGuideButton } from '@/components/features/ExerciseGuide';

export default function ProgramPage() {
  const t = useTranslations();
  const program = useQuery('program', loadProgram);
  const todayIdx = weekdayIndex(today());
  const [pickFor, setPickFor] = useState<ProgramDay | null>(null);
  const toast = useToast();

  async function setIds(day: ProgramDay, ids: string[]) {
    setData<ProgramDay[]>('program', (p) => (p ?? []).map((d) => (d.id === day.id ? { ...d, exercise_ids: ids } : d)));
    try { await setProgramExercises(day.id, ids); invalidate('home'); }
    catch { toast.show(t('common.saveFailed'), { tone: 'error' }); invalidate('program'); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/workout" className="glass grid size-10 place-items-center rounded-full" aria-label={t('common.back')}>
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{t('program.title')}</h1>
          <p className="text-sm text-muted">{t('program.subtitle')}</p>
        </div>
      </div>
      <p className="flex items-center gap-2 rounded-2xl bg-cyan/10 px-4 py-2.5 text-xs text-cyan"><ShieldCheck className="size-4 shrink-0" />{t('program.historySafe')}</p>

      {program.error ? <ErrorState onRetry={program.refresh} /> : program.loading ? <PageSkeleton /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {program.data!.map((d) => (
            <DayCard key={d.id} day={d} isToday={d.weekday === todayIdx}
              onAdd={() => setPickFor(d)} onIds={(ids) => setIds(d, ids)} />
          ))}
        </div>
      )}
      <ExercisePicker open={!!pickFor} onClose={() => setPickFor(null)} exclude={pickFor?.exercise_ids}
        max={LIMITS.maxExercises - (pickFor?.exercise_ids.length ?? 0)}
        onPick={(ids) => pickFor && setIds(pickFor, [...pickFor.exercise_ids, ...ids].slice(0, LIMITS.maxExercises))} />
    </div>
  );
}

function DayCard({ day, isToday, onAdd, onIds }: { day: ProgramDay; isToday: boolean; onAdd: () => void; onIds: (ids: string[]) => void }) {
  const t = useTranslations();
  const f = useFmt();
  const ex = useExercises();
  const toast = useToast();
  const [name, setName] = useState(day.day_name);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = (patch: Partial<Pick<ProgramDay, 'day_name' | 'is_rest'>>) => {
    setData<ProgramDay[]>('program', (p) => (p ?? []).map((x) => (x.id === day.id ? { ...x, ...patch } : x)));
    updateProgramDay(day.id, patch).then(() => invalidate('home')).catch(() => { toast.show(t('common.saveFailed'), { tone: 'error' }); invalidate('program'); });
  };
  const onName = (v: string) => {
    const nv = clampChars(v, LIMITS.dayName);
    setName(nv);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save({ day_name: nv }), 500);
  };
  const move = (i: number, dir: -1 | 1) => {
    const ids = [...day.exercise_ids]; const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    onIds(ids);
  };

  return (
    <Panel edge={isToday} className={isToday ? 'border-accent/30' : ''}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="label flex items-center gap-2">
          {f.weekdayName(day.weekday)}
          {isToday && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold normal-case tracking-normal text-on-accent">{t('program.today')}</span>}
        </span>
        <div className="inline-flex rounded-xl bg-[rgb(var(--line)/0.05)] p-0.5 text-xs">
          {[false, true].map((rest) => (
            <button key={String(rest)} onClick={() => save({ is_rest: rest })} aria-pressed={day.is_rest === rest}
              className={`flex h-8 items-center gap-1.5 rounded-[10px] px-3 font-medium transition-colors ${day.is_rest === rest ? 'bg-[rgb(var(--line)/0.12)] text-ink' : 'text-muted'}`}>
              {rest ? <BedDouble className="size-3.5" /> : <Dumbbell className="size-3.5" />}{rest ? t('program.rest') : t('program.training')}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input value={name} onChange={(e) => onName(e.target.value)} aria-label={`${f.weekdayName(day.weekday)}: ${t('workout.dayName')}`}
          placeholder={day.is_rest ? t('program.rest') : t('home.untitled')}
          className="min-w-0 flex-1 bg-transparent font-display text-xl font-semibold outline-none placeholder:text-muted/50" />
        <Counter value={name} max={LIMITS.dayName} />
      </div>

      <AnimatePresence initial={false}>
        {!day.is_rest && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <p className="label mb-2 mt-4">{t('program.planned')}</p>
            {day.exercise_ids.length === 0 && <p className="mb-2 text-sm text-muted">{t('program.empty')}</p>}
            <ul className="space-y-1">
              {day.exercise_ids.map((id, i) => (
                <motion.li layout key={id} className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[rgb(var(--line)/0.04)]">
                  <span className="num w-5 text-xs text-muted">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{ex.name(ex.byId.get(id))}</span>
                  <ExerciseGuideButton exercise={ex.byId.get(id)} name={ex.name(ex.byId.get(id))} className="size-8" />
                  <button aria-label={t('workout.moveUp')} disabled={i === 0} onClick={() => move(i, -1)} className="grid size-8 place-items-center rounded-lg text-muted disabled:opacity-25"><ArrowUp className="size-3.5" /></button>
                  <button aria-label={t('workout.moveDown')} disabled={i === day.exercise_ids.length - 1} onClick={() => move(i, 1)} className="grid size-8 place-items-center rounded-lg text-muted disabled:opacity-25"><ArrowDown className="size-3.5" /></button>
                  <button aria-label={t('common.delete')} onClick={() => onIds(day.exercise_ids.filter((x) => x !== id))} className="grid size-8 place-items-center rounded-lg text-bad/80 hover:bg-bad/10"><X className="size-4" /></button>
                </motion.li>
              ))}
            </ul>
            <button onClick={onAdd} disabled={day.exercise_ids.length >= LIMITS.maxExercises} className="chip mt-2 disabled:opacity-40">
              <Plus className="size-4" />{t('program.addPlanned')} <span className="num text-xs opacity-70">{day.exercise_ids.length}/{LIMITS.maxExercises}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}
