'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlert, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ExerciseGuide } from '@/lib/guides';
import type { Exercise } from '@/lib/types';

/** Small circle-! button next to an exercise. Opens a centered box with step-by-step instructions. */
export function ExerciseGuideButton({ exercise, name, className = '' }: { exercise: Exercise | undefined; name: string; className?: string }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  if (!exercise) return null;
  return (
    <>
      <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        aria-label={t('guide.openFor', { name })} title={t('guide.title')}
        className={`press grid size-9 shrink-0 place-items-center rounded-full text-cyan hover:bg-cyan/10 ${className}`}>
        <CircleAlert className="size-5" aria-hidden />
      </button>
      <GuideDialog open={open} onClose={() => setOpen(false)} exercise={exercise} name={name} />
    </>
  );
}

function GuideDialog({ open, onClose, exercise, name }: { open: boolean; onClose: () => void; exercise: Exercise; name: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [guide, setGuide] = useState<ExerciseGuide | null>(null);
  // The guide text is loaded only when the box is opened, so pages stay light.
  useEffect(() => {
    if (!open) return;
    let alive = true;
    import('@/lib/guides').then((m) => { if (alive) setGuide(m.guideFor(exercise, locale)); });
    return () => { alive = false; };
  }, [open, exercise, locale]);

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', onKey, true);
    const timer = setTimeout(() => closeRef.current?.focus({ preventScroll: true }), 50);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
      clearTimeout(timer);
      prevFocus?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && guide && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <motion.div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div role="dialog" aria-modal="true" aria-labelledby={titleId}
            className="glass-strong relative flex max-h-[80dvh] w-full max-w-md flex-col rounded-[24px] shadow-lift"
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}>
            <div className="flex items-start gap-3 px-5 pb-2 pt-4">
              <div className="min-w-0 flex-1">
                <p className="label">{t('guide.title')}</p>
                <h2 id={titleId} className="font-display text-lg font-semibold leading-snug">{name}</h2>
              </div>
              <button ref={closeRef} type="button" onClick={onClose} aria-label={t('common.close')}
                className="-me-2 -mt-1 grid size-10 shrink-0 place-items-center rounded-full hover:bg-[rgb(var(--line)/0.08)]">
                <X className="size-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
              <ol className="space-y-3">
                {guide.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
                    <span className="num mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-semibold text-accent">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              {guide.tips.length > 0 && (
                <div className="mt-5 rounded-2xl bg-[rgb(var(--line)/0.05)] p-4">
                  <p className="label mb-2">{t('guide.tips')}</p>
                  <ul className="space-y-2 text-sm leading-relaxed text-muted">
                    {guide.tips.map((s, i) => (
                      <li key={i} className="flex gap-2"><span aria-hidden className="text-accent">•</span><span>{s}</span></li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="mt-4 text-xs text-muted">{t('guide.note')}</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
