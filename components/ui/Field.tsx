'use client';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { charLen, clampChars } from '@/lib/text';

type Common = { label?: React.ReactNode; error?: string | null; hint?: React.ReactNode; className?: string };

/** Live character counter that counts Arabic correctly (code points, same as Postgres). */
export function Counter({ value, max }: { value: string; max: number }) {
  const t = useTranslations();
  const n = charLen(value);
  const left = max - n;
  return (
    <span aria-live="polite" className={`num text-xs tabular-nums ${left <= 0 ? 'text-bad' : left <= Math.ceil(max * 0.15) ? 'text-warn' : 'text-muted'}`}
      title={t('common.charsLeft', { n: Math.max(left, 0) })}>
      {n}/{max}
    </span>
  );
}

export function TextField({ label, error, hint, className = '', value, onChange, max, ...rest }: Common &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & { value: string; onChange: (v: string) => void; max?: number }) {
  const id = useId();
  return (
    <div className={className}>
      {(label || max) && (
        <div className="mb-1.5 flex items-end justify-between gap-2">
          {label && <label htmlFor={id} className="text-sm font-medium">{label}</label>}
          {max ? <Counter value={value} max={max} /> : null}
        </div>
      )}
      <input id={id} className="field" value={value} aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined}
        onChange={(e) => onChange(max ? clampChars(e.target.value, max) : e.target.value)} {...rest} />
      {error ? <p id={`${id}-e`} className="mt-1.5 text-xs text-bad">{error}</p> : hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function TextArea({ label, error, hint, className = '', value, onChange, max, rows = 3, ...rest }: Common &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'value'> & { value: string; onChange: (v: string) => void; max: number }) {
  const id = useId();
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-end justify-between gap-2">
        {label && <label htmlFor={id} className="text-sm font-medium">{label}</label>}
        <Counter value={value} max={max} />
      </div>
      <textarea id={id} rows={rows} className="field h-auto resize-none py-3 leading-relaxed" value={value} aria-invalid={!!error}
        onChange={(e) => onChange(clampChars(e.target.value, max))} {...rest} />
      {error ? <p className="mt-1.5 text-xs text-bad">{error}</p> : hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

/** Numeric input that keeps the raw text while typing (so "62." is allowed) and reports a number or null. */
export function NumberField({ label, error, hint, className = '', value, onChange, suffix, ...rest }: Common &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & { value: string; onChange: (v: string) => void; suffix?: string }) {
  const id = useId();
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>}
      <div className="relative">
        <input id={id} inputMode="decimal" className={`field num ${suffix ? 'pe-12' : ''}`} value={value} aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))} {...rest} />
        {suffix && <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-sm text-muted">{suffix}</span>}
      </div>
      {error ? <p className="mt-1.5 text-xs text-bad">{error}</p> : hint ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export const parseNum = (s: string): number | null => {
  if (s.trim() === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
