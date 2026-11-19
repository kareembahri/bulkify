'use client';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  tall?: boolean;
};

/** Bottom sheet: drag the handle down to dismiss, Esc closes, focus is kept inside. */
export function Sheet({ open, onClose, title, children, footer, tall }: Props) {
  const t = useTranslations();
  const controls = useDragControls();
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button:not([disabled]),input,textarea,select,a[href],[tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>('[data-autofocus],input,textarea')?.focus({ preventScroll: true }), 260);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
      prevFocus?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={`glass-strong relative flex w-full max-w-xl flex-col rounded-t-[28px] shadow-lift sm:mb-4 sm:rounded-[28px] ${tall ? 'h-[92dvh] sm:h-[86dvh]' : 'max-h-[92dvh]'}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 40 }}
            drag="y"
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => { if (i.offset.y > 110 || i.velocity.y > 600) onClose(); }}
          >
            <div className="cursor-grab touch-none px-5 pb-2 pt-3 active:cursor-grabbing" onPointerDown={(e) => controls.start(e)}>
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[rgb(var(--line)/0.2)]" />
              <div className="flex items-center justify-between gap-3">
                <h2 id={titleId} className="font-display text-lg font-semibold">{title}</h2>
                <button onClick={onClose} className="grid size-10 place-items-center rounded-full hover:bg-[rgb(var(--line)/0.08)]" aria-label={t('common.close')}>
                  <X className="size-5" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">{children}</div>
            {footer && <div className="safe-bottom border-t border-[rgb(var(--line)/0.08)] px-5 pt-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
