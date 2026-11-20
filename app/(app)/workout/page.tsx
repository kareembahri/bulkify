'use client';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { CalendarCog, Dumbbell, Play, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExerciseLogCard } from '@/components/features/ExerciseLogCard';
import { ExercisePicker } from '@/components/features/ExercisePicker';
import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/components/ui/Confirm';
import { DateNav } from '@/components/ui/DateNav';
import { Counter } from '@/components/ui/Field';
import { Panel } from '@/components/ui/Panel';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { useExercises } from '@/lib/catalog';
import {
  addWorkoutExercises, createWorkout, deleteWorkout, deleteWorkoutExercise, loadHistory, loadProgram,
  loadWorkout, updateWorkout, updateWorkoutExercise,
} from '@/lib/data';
import { isValidISO, today, weekdayIndex } from '@/lib/dates';
import { useFmt } from '@/lib/format';
import { invalidate, setData, useQuery } from '@/lib/query';
import { clampChars } from '@/lib/text';
import { LIMITS, type SetRow, type Workout } from '@/lib/types';

export default function WorkoutPage() {
  return <Suspense fallback={<PageSkeleton />}><WorkoutScreen /></Suspense>;
}

function WorkoutScreen() {
  const t = useTranslations();
  const f = useFmt();
  const toast = useToast();
  const confirm = useConfirm();
  const router = useRouter();
  const params = useSearchParams();
  const date = isValidISO(params.get('date')) ? params.get('date')! : today();
  const key = `workout:${date}`;

  const ex = useExercises();
  const program = useQuery('program', loadProgram);
  const w = useQuery<Workout | null>(key, () => loadWorkout(date));
  const [picker, setPicker] = useState(false);
  const [starting, setStarting] = useState(false);
  const [name, setName] = useState('');
  const [nameErr, setNameErr] = useState(false);
  const nameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const shake = useAnimationControls();

  const plan = program.data?.find((d) => d.weekday === weekdayIndex(date));
  const workout = w.data;
  const count = workout?.exercises.length ?? 0;
  const room = LIMITS.maxExercises - count;
  const ids = useMemo(() => [...new Set((workout?.exercises ?? []).map((e) => e.exercise_id))].sort(), [workout]);
  const history = useQuery(ids.length ? `history:${date}:${ids.join(',')}` : null, () => loadHistory(ids, date), 60_000);

  // Name: the saved one for this day, or a suggestion from the weekly plan (never overwrites what you typed).
  const suggestion = plan && !plan.is_rest ? clampChars(plan.day_name, LIMITS.dayName) : '';
  useEffect(() => {
    setName(workout?.day_name || suggestion);
    setNameErr(false);
  }, [workout?.id, date]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!workout?.day_name && suggestion) setName((n) => n || suggestion);
  }, [suggestion]); // eslint-disable-line react-hooks/exhaustive-deps

  const setDate = (d: string) => router.replace(`/workout?date=${d}`, { scroll: false });

  /** Name is required: flag the field, shake it and focus it. */
  const needName = () => {
    if (name.trim()) return false;
    setNameErr(true);
    void shake.start({ x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.4 } });
    nameRef.current?.focus();
    toast.show(t('workout.nameFirst'), { tone: 'error' });
    return true;
  };

  const startFromPlan = useCallback(async () => {
    if (!plan || needName()) return;
    setStarting(true);
    try {
      await createWorkout(date, name.trim(), plan.exercise_ids.slice(0, LIMITS.maxExercises));
      await w.refresh();
      invalidate('home', 'cal', 'gym');
    } catch { toast.show(t('common.saveFailed'), { tone: 'error' }); }
    finally { setStarting(false); }
  }, [date, plan, name, w, toast, t]); // eslint-disable-line react-hooks/exhaustive-deps

  function openPicker() {
    if (needName()) return;
    if (room <= 0) { toast.show(t('workout.maxExercises', { n: LIMITS.maxExercises }), { tone: 'error' }); return; }
    setPicker(true);
  }

  async function addExercises(newIds: string[]) {
    const take = newIds.slice(0, Math.max(room, 0));
    if (take.length < newIds.length) toast.show(t('workout.maxExercises', { n: LIMITS.maxExercises }), { tone: 'error' });
    if (!take.length) return;
    try {
      let wid = workout?.id;
      if (!wid) wid = await createWorkout(date, name.trim(), []);
      const startPos = (workout?.exercises.at(-1)?.position ?? -1) + 1;
      const rows = await addWorkoutExercises(wid, take, startPos);
      setData<Workout | null>(key, (prev) => ({
        id: wid!, date, day_name: prev?.day_name || name.trim(),
        exercises: [...(prev?.exercises ?? []), ...rows.map((r) => ({ ...r, note: '', sets: [] as SetRow[] }))],
      }));
      invalidate('home', 'cal', 'gym');
    } catch {
      toast.show(t('common.saveFailed'), { tone: 'error' });
      invalidate(key);
    }
  }

  async function move(index: number, dir: -1 | 1) {
    if (!workout) return;
    const list = [...workout.exercises];
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    [list[index], list[j]] = [list[j], list[index]];
    const renumbered = list.map((e, i) => ({ ...e, position: i }));
    setData<Workout | null>(key, (p) => (p ? { ...p, exercises: renumbered } : p ?? null));
    try {
      await Promise.all([updateWorkoutExercise(renumbered[index].id, { position: index }), updateWorkoutExercise(renumbered[j].id, { position: j })]);
    } catch { toast.show(t('common.saveFailed'), { tone: 'error' }); invalidate(key); }
  }

  async function remove(id: string, label: string) {
    if (!(await confirm({ title: t('workout.removeExercise'), body: label, danger: true, confirmLabel: t('common.delete') }))) return;
    setData<Workout | null>(key, (p) => (p ? { ...p, exercises: p.exercises.filter((e) => e.id !== id) } : p ?? null));
    try { await deleteWorkoutExercise(id); invalidate('home', 'cal', 'gym'); }
    catch { toast.show(t('common.saveFailed'), { tone: 'error' }); invalidate(key); }
  }

  async function removeWorkout() {
    if (!workout) return;
    if (!(await confirm({ title: t('workout.deleteWorkout'), body: f.dayLong(date), danger: true, confirmLabel: t('common.delete') }))) return;
    try { await deleteWorkout(workout.id); setData(key, () => null); invalidate('home', 'cal', 'gym', 'history'); }
    catch { toast.show(t('common.saveFailed'), { tone: 'error' }); }
  }

  function onName(v: string) {
    const nv = clampChars(v, LIMITS.dayName);
    setName(nv);
    setNameErr(false);
    if (!workout) return;
    if (nameTimer.current) clearTimeout(nameTimer.current);
    if (!nv.trim()) { setNameErr(true); return; }   // required: never save an empty name
    nameTimer.current = setTimeout(() => {
      updateWorkout(workout.id, { day_name: nv.trim() }).then(() => { setData<Workout | null>(key, (p) => (p ? { ...p, day_name: nv.trim() } : p ?? null)); invalidate('home', 'cal'); })
        .catch(() => toast.show(t('common.saveFailed'), { tone: 'error' }));
    }, 600);
  }

  const onSaved = useCallback((id: string, sets: SetRow[]) => {
    setData<Workout | null>(key, (p) => (p ? { ...p, exercises: p.exercises.map((e) => (e.id === id ? { ...e, sets } : e)) } : p ?? null));
    invalidate('gym', 'cal', 'history');
  }, [key]);

  return (
    <div className="space-y-4">
      {/* title on the left, the (required) workout name on the right */}
      <div className="flex items-start justify-between gap-3">
        <h1 className="pt-2 font-display text-3xl font-semibold tracking-tight">{t('workout.title')}</h1>
        <motion.div animate={shake} className="w-[min(15rem,58%)]">
          <div className="mb-1 flex items-center justify-between gap-2">
            <label htmlFor="wname" className="label">{t('workout.dayName')} <span className="text-bad">*</span></label>
            <Counter value={name} max={LIMITS.dayName} />
          </div>
          <input id="wname" ref={nameRef} value={name} onChange={(e) => onName(e.target.value)} placeholder={t('workout.namePlaceholder')}
            aria-required="true" aria-invalid={nameErr} className="field h-11 text-end font-display text-lg font-semibold rtl:text-start" />
          {nameErr && <p className="mt-1 text-end text-xs text-bad">{t('workout.nameRequired')}</p>}
        </motion.div>
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1"><DateNav date={date} onChange={setDate} /></div>
        <Link href="/workout/program" className="press glass grid size-12 shrink-0 place-items-center rounded-2xl" aria-label={t('workout.program')} title={t('workout.program')}>
          <CalendarCog className="size-5 text-accent" />
        </Link>
      </div>

      {w.error ? <ErrorState onRetry={w.refresh} /> : w.loading || ex.loading ? <PageSkeleton /> : !workout || count === 0 ? (
        <Panel edge>
          <EmptyState icon={Dumbbell} title={t('workout.empty')} hint={t('workout.emptyHint', { n: LIMITS.maxExercises })}
            action={
              <div className="flex flex-col items-center gap-3">
                {!workout && plan && !plan.is_rest && plan.exercise_ids.length > 0 && (
                  <>
                    <div className="flex max-w-md flex-wrap justify-center gap-1.5">
                      {plan.exercise_ids.slice(0, LIMITS.maxExercises).map((id) => <span key={id} className="chip h-7 text-xs">{ex.name(ex.byId.get(id))}</span>)}
                    </div>
                    <Button variant="primary" size="lg" loading={starting} onClick={startFromPlan}>
                      <Play className="size-5" />{t('workout.startPlan', { name: plan.day_name || t('home.untitled') })}
                    </Button>
                  </>
                )}
                <Button onClick={openPicker}><Plus className="size-4" />{t('workout.addExercise')}</Button>
              </div>
            } />
        </Panel>
      ) : (
        <>
          <motion.div layout className="space-y-3">
            <AnimatePresence initial={false}>
              {workout.exercises.map((we, i) => (
                <motion.div key={we.id} layout initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 60, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28, delay: Math.min(i, 6) * 0.03 }}>
                  <ExerciseLogCard
                    wex={we}
                    name={ex.name(ex.byId.get(we.exercise_id))}
                    exercise={ex.byId.get(we.exercise_id)}
                    history={history.data?.get(we.exercise_id) ?? (history.data ? [] : undefined)}
                    first={i === 0}
                    last={i === workout.exercises.length - 1}
                    onMove={(d) => move(i, d)}
                    onRemove={() => remove(we.id, ex.name(ex.byId.get(we.exercise_id)))}
                    onSaved={(sets) => onSaved(we.id, sets)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          <Button variant="primary" size="lg" className="w-full" disabled={room <= 0} onClick={openPicker}>
            <Plus className="size-5" />{room > 0 ? t('workout.addExercise') : t('workout.maxExercises', { n: LIMITS.maxExercises })}
            <span className="num text-sm opacity-75">{count}/{LIMITS.maxExercises}</span>
          </Button>
          <div className="flex justify-center">
            <button onClick={removeWorkout} className="press inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted hover:text-bad">
              <Trash2 className="size-4" />{t('workout.deleteWorkout')}
            </button>
          </div>
        </>
      )}

      <ExercisePicker open={picker} onClose={() => setPicker(false)} onPick={addExercises} max={room}
        exclude={workout?.exercises.map((e) => e.exercise_id)} />
    </div>
  );
}
