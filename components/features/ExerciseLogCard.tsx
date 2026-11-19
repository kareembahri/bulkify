'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, CircleAlert, LoaderCircle, Minus, Plus, StickyNote, Trash2, Trophy, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TextArea } from '@/components/ui/Field';
import { Panel } from '@/components/ui/Panel';
import { useToast } from '@/components/ui/Toast';
import { saveSets, updateWorkoutExercise } from '@/lib/data';
import { useFmt } from '@/lib/format';
import { bestSet, compareSets } from '@/lib/gym';
import { tick } from '@/lib/haptics';
import { LIMITS, type SetRow, type WorkoutExercise } from '@/lib/types';

type Draft = { id: number; reps: string; kg: string };
type Status = 'idle' | 'saving' | 'saved' | 'error';

let seq = 0;
const draft = (reps = '', kg = ''): Draft => ({ id: ++seq, reps, kg });
const toDraft = (s: SetRow): Draft => draft(String(s.reps), String(+s.weight_kg));
const validReps = (s: string) => /^\d+$/.test(s) && +s > 0 && +s <= 500;
const validKg = (s: string) => s.trim() !== '' && Number.isFinite(+s) && +s >= 0 && +s <= LIMITS.maxKg;

type Props = {
  wex: WorkoutExercise;
  name: string;
  history: { date: string; sets: SetRow[] }[] | undefined;
  first: boolean;
  last: boolean;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onSaved: (sets: SetRow[]) => void;
};

/** One exercise in a workout: up to 5 sets (reps × kg), each removable, a note, and the exercise's PR. */
export function ExerciseLogCard({ wex, name, history, first, last, onMove, onRemove, onSaved }: Props) {
  const t = useTranslations();
  const f = useFmt();
  const toast = useToast();
  const [rows, setRows] = useState<Draft[]>(() => (wex.sets.length ? wex.sets.map(toDraft) : [draft()]));
  const [note, setNote] = useState(wex.note);
  const [showNote, setShowNote] = useState(!!wex.note);
  const [status, setStatus] = useState<Status>('idle');
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(rows);
  latest.current = rows;
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  const complete = rows.filter((r) => validReps(r.reps) && validKg(r.kg)).map((r) => ({ reps: +r.reps, weight_kg: +r.kg }));
  const before = useMemo(() => bestSet((history ?? []).flatMap((h) => h.sets)), [history]);
  const today = bestSet(complete);
  const pr = compareSets(today, before) > 0 ? today : before;
  const isNewPR = !!before && !!today && today.weight_kg > 0 && compareSets(today, before) > 0;

  const flush = useCallback(async () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    if (!dirty.current) return;
    const cur = latest.current;
    // Save only when every row is complete or completely empty (no half-typed values).
    if (cur.some((r) => (r.reps !== '' || r.kg !== '') && !(validReps(r.reps) && validKg(r.kg)))) return;
    const sets = cur.filter((r) => validReps(r.reps) && validKg(r.kg)).map((r) => ({ reps: +r.reps, weight_kg: Math.round(+r.kg * 100) / 100 }));
    dirty.current = false;
    setStatus('saving');
    try {
      await saveSets(wex.id, sets);
      setStatus('saved');
      onSavedRef.current(sets.map((s, i) => ({ ...s, set_number: i + 1 })));
    } catch {
      dirty.current = true;
      setStatus('error');
    }
  }, [wex.id]);

  const schedule = () => { dirty.current = true; setStatus('idle'); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(flush, 650); };
  useEffect(() => () => { void flush(); }, [flush]);   // save when leaving the page
  useEffect(() => {
    const onHide = () => { if (document.visibilityState === 'hidden') void flush(); };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [flush]);

  const update = (i: number, patch: Partial<Draft>) => { setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x))); schedule(); };
  const step = (i: number, dir: 1 | -1) => {
    const cur = validKg(rows[i].kg) ? +rows[i].kg : 0;
    const next = dir === 1 ? Math.floor(cur / LIMITS.kgStep) * LIMITS.kgStep + LIMITS.kgStep : Math.ceil(cur / LIMITS.kgStep) * LIMITS.kgStep - LIMITS.kgStep;
    tick(5);
    update(i, { kg: String(Math.min(LIMITS.maxKg, Math.max(0, next))) });
  };
  const addSet = () => {
    if (rows.length >= LIMITS.maxSets) return;
    const prev = rows[rows.length - 1];
    setRows((r) => [...r, prev && validReps(prev.reps) && validKg(prev.kg) ? draft(prev.reps, prev.kg) : draft()]);
    schedule();
  };
  const removeSet = (i: number) => {
    tick(12);
    setRows((r) => (r.length === 1 ? [draft()] : r.filter((_, j) => j !== i)));
    schedule();
  };
  const onNote = (v: string) => {
    setNote(v);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => updateWorkoutExercise(wex.id, { note: v }).catch(() => toast.show(t('common.saveFailed'), { tone: 'error' })), 700);
  };

  return (
    <Panel className={`overflow-hidden ${isNewPR ? 'animate-prglow !border-accent/60' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[17px] font-semibold">{name}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {pr && pr.weight_kg > 0 ? (
              <motion.span key={`${pr.weight_kg}x${pr.reps}`} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${isNewPR ? 'bg-accent text-on-accent shadow-glow' : 'bg-accent/15 text-accent'}`}>
                <Trophy className="size-3" />
                <span className="num">{t('workout.prValue', { weight: f.kg(pr.weight_kg), reps: pr.reps })}</span>
              </motion.span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--line)/0.06)] px-2 py-0.5 text-[11px] text-muted"><Trophy className="size-3" />{t('workout.noPR')}</span>
            )}
            <AnimatePresence>{isNewPR && (
              <motion.span initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} className="text-[11px] font-bold text-accent">
                {t('workout.newPR')}
              </motion.span>
            )}</AnimatePresence>
          </div>
        </div>
        <SaveDot status={status} onRetry={flush} />
      </div>

      <div className="mt-4 grid grid-cols-[1.75rem_4rem_1fr_2.5rem] items-center gap-2 px-0.5 text-[11px] font-medium text-muted">
        <span>{t('workout.set')}</span><span className="text-center">{t('workout.reps')}</span><span className="text-center">{t('workout.weight')}</span><span />
      </div>

      <ul className="mt-1.5 space-y-2">
        <AnimatePresence initial={false}>
          {rows.map((r, i) => {
            const bad = { reps: r.reps !== '' && !validReps(r.reps), kg: r.kg !== '' && !validKg(r.kg) };
            return (
              <motion.li key={r.id} layout initial={{ opacity: 0, height: 0, x: -12 }} animate={{ opacity: 1, height: 'auto', x: 0 }}
                exit={{ opacity: 0, height: 0, x: 40 }} transition={{ type: 'spring', stiffness: 380, damping: 32 }}>
                <div className="grid grid-cols-[1.75rem_4rem_1fr_2.5rem] items-center gap-2">
                  <span className="num grid size-7 place-items-center rounded-lg bg-[rgb(var(--line)/0.06)] text-sm font-semibold">{i + 1}</span>
                  <input inputMode="numeric" aria-label={`${t('workout.set')} ${i + 1} · ${t('workout.reps')}`} placeholder="0"
                    className="field num h-11 px-1 text-center text-lg" value={r.reps} aria-invalid={bad.reps}
                    onChange={(e) => update(i, { reps: e.target.value.replace(/\D/g, '').slice(0, 3) })} />
                  <div className="flex min-w-0 items-center gap-1">
                    <button type="button" onClick={() => step(i, -1)} aria-label="−5 kg"
                      className="press grid size-11 shrink-0 place-items-center rounded-xl bg-[rgb(var(--line)/0.06)]"><Minus className="size-4" /></button>
                    <input inputMode="decimal" aria-label={`${t('workout.set')} ${i + 1} · kg`} placeholder="0"
                      className="field num h-11 min-w-0 px-1 text-center text-lg" value={r.kg} aria-invalid={bad.kg}
                      onChange={(e) => update(i, { kg: e.target.value.replace(',', '.').replace(/[^0-9.]/g, '').slice(0, 6) })} />
                    <button type="button" onClick={() => step(i, 1)} aria-label="+5 kg"
                      className="press grid size-11 shrink-0 place-items-center rounded-xl bg-[rgb(var(--line)/0.06)]"><Plus className="size-4" /></button>
                  </div>
                  <button type="button" onClick={() => removeSet(i)} aria-label={t('workout.removeSet', { n: i + 1 })} title={t('workout.removeSet', { n: i + 1 })}
                    className="press grid size-10 place-items-center rounded-xl text-muted hover:bg-bad/10 hover:text-bad">
                    <X className="size-[18px]" />
                  </button>
                </div>
                {(bad.reps || bad.kg) && (
                  <p className="mt-1 ps-9 text-xs text-bad">{bad.reps ? t('workout.repsInvalid') : t('workout.weightRange')}</p>
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={addSet} disabled={rows.length >= LIMITS.maxSets} className="chip disabled:cursor-not-allowed disabled:opacity-40">
          <Plus className="size-4" />{t('workout.addSet')} <span className="num text-xs opacity-70">{rows.length}/{LIMITS.maxSets}</span>
        </button>
        <button className="chip" aria-pressed={showNote} onClick={() => setShowNote((s) => !s)}><StickyNote className="size-4" />{t('workout.note')}</button>
        <div className="ms-auto flex items-center">
          <IconBtn label={t('workout.moveUp')} disabled={first} onClick={() => onMove(-1)}><ArrowUp className="size-4" /></IconBtn>
          <IconBtn label={t('workout.moveDown')} disabled={last} onClick={() => onMove(1)}><ArrowDown className="size-4" /></IconBtn>
          <IconBtn label={t('workout.removeExercise')} onClick={onRemove} danger><Trash2 className="size-4" /></IconBtn>
        </div>
      </div>

      <AnimatePresence>
        {showNote && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <TextArea className="mt-3" label={t('workout.note')} value={note} onChange={onNote} max={LIMITS.exerciseNote} rows={2} placeholder={t('workout.notePlaceholder')} />
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
}

function IconBtn({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button aria-label={label} title={label} onClick={onClick} disabled={disabled}
      className={`press grid size-10 place-items-center rounded-xl transition-colors disabled:opacity-25 ${danger ? 'text-bad hover:bg-bad/10' : 'text-muted hover:bg-[rgb(var(--line)/0.06)] hover:text-ink'}`}>
      {children}
    </button>
  );
}

function SaveDot({ status, onRetry }: { status: Status; onRetry: () => void }) {
  const t = useTranslations();
  if (status === 'saving') return <span className="flex items-center gap-1 text-xs text-muted"><LoaderCircle className="size-3.5 animate-spin" />{t('common.saving')}</span>;
  if (status === 'error') return <button onClick={onRetry} className="flex items-center gap-1 text-xs text-bad"><CircleAlert className="size-3.5" />{t('common.retry')}</button>;
  if (status === 'saved') return <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1.5 text-xs text-muted"><span className="size-1.5 rounded-full bg-accent" />{t('common.saved')}</motion.span>;
  return null;
}
