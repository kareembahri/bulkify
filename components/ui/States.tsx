'use client';
import { motion } from 'framer-motion';
import { CloudOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from './Button';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[rgb(var(--line)/0.06)] ${className}`} aria-hidden>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[rgb(var(--line)/0.08)] to-transparent" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-44" />
      <div className="grid grid-cols-2 gap-4"><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
      <Skeleton className="h-24" />
    </div>
  );
}

/** Empty state: an icon floating in a soft glowing orb, a title, a hint and an action. */
export function EmptyState({ icon: Icon, title, hint, action, compact }: {
  icon: React.ComponentType<{ className?: string }>; title: string; hint?: string; action?: React.ReactNode; compact?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center text-center ${compact ? 'py-6' : 'py-12'}`}>
      <motion.div
        className="relative mb-5 grid size-20 place-items-center"
        animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0 rounded-full bg-accent/15 blur-xl" />
        <div className="glass relative grid size-16 place-items-center rounded-full">
          <Icon className="size-7 text-accent" />
        </div>
      </motion.div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {hint && <p className="mt-1 max-w-xs text-sm text-muted">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  const t = useTranslations();
  return (
    <div className="glass flex flex-col items-center rounded-3xl p-6 text-center">
      <CloudOff className="mb-3 size-7 text-bad" />
      <p className="text-sm text-muted">{message ?? t('common.loadFailed')}</p>
      {onRetry && <Button className="mt-4" size="sm" onClick={onRetry}>{t('common.retry')}</Button>}
    </div>
  );
}
