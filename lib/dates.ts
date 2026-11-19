// All app dates are local calendar days as 'YYYY-MM-DD' strings (no UTC shifting).

export const pad = (n: number) => String(n).padStart(2, '0');
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const today = () => toISO(new Date());
export const addDays = (s: string, n: number) => { const d = fromISO(s); d.setDate(d.getDate() + n); return toISO(d); };
export const addMonths = (s: string, n: number) => {
  const d = fromISO(s); const day = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + n);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return toISO(d);
};
/** 0 = Monday … 6 = Sunday (matches bulkify_program_days.weekday). */
export const weekdayIndex = (s: string) => (fromISO(s).getDay() + 6) % 7;
export const startOfWeek = (s: string) => addDays(s, -weekdayIndex(s));
export const startOfMonth = (s: string) => s.slice(0, 8) + '01';
export const endOfMonth = (s: string) => { const d = fromISO(s); return toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0)); };
export const daysBetween = (a: string, b: string) => Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86_400_000);
export const range = (from: string, to: string) => {
  const out: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
};
export const isValidISO = (s: string | null | undefined): s is string =>
  !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && toISO(fromISO(s)) === s;
/** A range is "at least one month" when `to` reaches the same day next month, minus one day. */
export const isAtLeastOneMonth = (from: string, to: string) => to >= addDays(addMonths(from, 1), -1);
