'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlert, CircleCheck } from 'lucide-react';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

type Toast = { id: number; text: string; tone: 'ok' | 'error'; action?: { label: string; run: () => void } };
type Ctx = { show: (text: string, opts?: { tone?: 'ok' | 'error'; action?: Toast['action'] }) => void };
const ToastCtx = createContext<Ctx>({ show: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const seq = useRef(0);
  const show = useCallback<Ctx['show']>((text, opts) => {
    const id = ++seq.current;
    setItems((x) => [...x.slice(-2), { id, text, tone: opts?.tone ?? 'ok', action: opts?.action }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), opts?.action ? 5000 : 3200);
  }, []);
  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[90] flex flex-col items-center gap-2 px-4" aria-live="polite" role="status">
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              className={`glass-strong pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl px-4 py-3 text-sm shadow-lift ${t.tone === 'error' ? 'border-bad/40' : ''}`}
            >
              {t.tone === 'error' ? <CircleAlert className="size-4 shrink-0 text-bad" /> : <CircleCheck className="size-4 shrink-0 text-accent" />}
              <span className="flex-1">{t.text}</span>
              {t.action && (
                <button className="font-semibold text-accent" onClick={() => { t.action!.run(); setItems((x) => x.filter((i) => i.id !== t.id)); }}>
                  {t.action.label}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
