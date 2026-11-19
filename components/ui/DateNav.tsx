'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { addDays, today } from '@/lib/dates';
import { useFmt } from '@/lib/format';
import { tick } from '@/lib/haptics';

/** Previous / next day, tap the label to pick any date, quick "Today" pill. Mirrors in RTL. */
export function DateNav({ date, onChange, max }: { date: string; onChange: (d: string) => void; max?: string }) {
  const t = useTranslations();
  const f = useFmt();
  const isToday = date === today();
  const label = isToday ? t('common.today') : date === addDays(today(), -1) ? t('common.yesterday') : f.weekday(date);
  const go = (n: number) => { const d = addDays(date, n); if (max && d > max) return; tick(5); onChange(d); };
  return (
    <div className="glass flex items-center gap-1 rounded-2xl p-1">
      <button className="grid size-10 place-items-center rounded-xl hover:bg-[rgb(var(--line)/0.08)]" onClick={() => go(-1)} aria-label={t('common.prev')}>
        <ChevronLeft className="size-5 rtl:rotate-180" />
      </button>
      <label className="relative flex min-w-0 flex-1 cursor-pointer flex-col items-center px-2 text-center">
        <span className="text-sm font-semibold">{label}</span>
        <span className="num text-xs text-muted">{f.dayMonth(date)}</span>
        <input type="date" value={date} max={max} aria-label={t('common.pickDate')}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0" />
      </label>
      <button className="grid size-10 place-items-center rounded-xl hover:bg-[rgb(var(--line)/0.08)] disabled:opacity-30"
        onClick={() => go(1)} disabled={!!max && date >= max} aria-label={t('common.next')}>
        <ChevronRight className="size-5 rtl:rotate-180" />
      </button>
      {!isToday && (
        <button onClick={() => onChange(today())} className="me-1 rounded-xl bg-accent/15 px-3 py-2 text-xs font-semibold text-accent">
          {t('common.today')}
        </button>
      )}
    </div>
  );
}
