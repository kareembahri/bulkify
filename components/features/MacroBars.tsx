'use client';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useFmt } from '@/lib/format';
import type { Totals } from '@/lib/nutrition';
import { ratioOf, RED_AT, score, scoreColor, type Mode } from '@/lib/targets';
import type { Profile } from '@/lib/types';

type Key = 'kcal' | 'protein' | 'carbs' | 'fat';

/**
 * Calories and macros eaten vs. the daily targets from Settings. Each bar starts
 * red at 0 and turns green near 100 %; on a cut or maintain it turns red again
 * when you go too far over (bulk stays green).
 */
export function MacroBars({ totals, profile, compact }: { totals: Totals; profile: Profile; compact?: boolean }) {
  const t = useTranslations();
  const f = useFmt();
  const mode = (profile.goal ?? 'maintain') as Mode;
  const g = f.ar ? ' غ' : ' g';
  const rows: { key: Key; value: number; goal: number | null; unit: string }[] = [
    { key: 'kcal', value: totals.kcal, goal: profile.kcal_goal, unit: ` ${t('common.kcal')}` },
    { key: 'protein', value: totals.protein_g, goal: profile.protein_goal, unit: g },
    { key: 'carbs', value: totals.carbs_g, goal: profile.carbs_goal, unit: g },
    { key: 'fat', value: totals.fat_g, goal: profile.fat_goal, unit: g },
  ];

  return (
    <div className={compact ? 'space-y-2.5' : 'space-y-4'}>
      {rows.map((r, i) => {
        const ratio = ratioOf(r.value, r.goal);
        const s = score(ratio, mode);
        const color = scoreColor(s);
        // the bar shows up to 135 % so "too much" is visible; the tick marks 100 %
        const scaleMax = Math.max(RED_AT, ratio);
        const w = Math.min(ratio / scaleMax, 1) * 100;
        const tickAt = (1 / scaleMax) * 100;
        const state = s >= 1 ? 'ok' : ratio > 1 ? 'over' : 'under';
        return (
          <div key={r.key}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <span className="size-2 rounded-full transition-colors duration-700" style={{ background: color, boxShadow: `0 0 10px ${color}` }} aria-hidden />
                {t(`macros.${r.key}`)}
              </span>
              <span className="num text-muted">
                <span className="font-semibold text-ink">{f.n0(r.value)}</span>
                {r.goal ? <> / {f.n0(r.goal)}</> : null}{r.unit}
                {r.goal ? <span className="ms-2 text-xs font-semibold transition-colors duration-700" style={{ color }}>{f.n0(ratio * 100)}%</span> : null}
              </span>
            </div>
            <div className={`relative overflow-hidden rounded-full bg-[rgb(var(--line)/0.08)] ${compact ? 'h-2' : 'h-3'}`}
              role="meter" aria-valuemin={0} aria-valuenow={Math.round(ratio * 100)} aria-label={`${t(`macros.${r.key}`)} · ${t(`food.state.${state}`)}`}>
              <motion.div className="absolute inset-y-0 start-0 overflow-hidden rounded-full" style={{ background: color, transition: 'background-color .7s' }}
                initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ type: 'spring', stiffness: 70, damping: 18, delay: i * 0.06 }}>
                <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              </motion.div>
              <div className="absolute inset-y-0 w-0.5 bg-ink/60" style={{ insetInlineStart: `${tickAt}%` }} aria-hidden />
            </div>
          </div>
        );
      })}
    </div>
  );
}
