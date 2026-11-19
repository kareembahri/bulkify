'use client';
import { motion } from 'framer-motion';
import { LogOut, Scale } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { LanguageSwitch } from '@/components/Shell';
import { Splash } from '@/components/Splash';
import { Wordmark } from '@/components/ui/Brand';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { Segmented } from '@/components/ui/Segmented';
import { useToast } from '@/components/ui/Toast';
import { useAuth, useProfile } from '@/lib/auth';
import { calculate, kgToLb, lbToKg, LIMITS } from '@/lib/calculator';
import { checkinDue } from '@/lib/checkin';
import { loadWeights, logWeight } from '@/lib/data';
import { today } from '@/lib/dates';
import { useFmt } from '@/lib/format';
import { invalidate, useQuery } from '@/lib/query';
import { setupComplete } from '@/lib/types';
import { Calculator } from './Calculator';

/**
 * Blocks the app until (1) the body data and goal are set, and (2) the monthly
 * weigh-in is done. Everything else renders only after both.
 */
export function SetupGate({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile();
  const done = setupComplete(profile);
  const weights = useQuery(done ? 'weights' : null, loadWeights, 60_000);

  if (!done) return <GateFrame><SetupScreen /></GateFrame>;
  if (weights.loading) return <Splash />;
  // If the weight log can't be read (e.g. migration 004 not run yet), don't lock the user out.
  const last = weights.data?.at(-1)?.date ?? null;
  if (!weights.error && checkinDue(today(), last)) return <GateFrame><CheckinScreen /></GateFrame>;
  return <>{children}</>;
}

function GateFrame({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const { signOut } = useAuth();
  return (
    <div className="mx-auto min-h-dvh max-w-5xl px-4 pb-16">
      <header className="flex items-center justify-between gap-2 pb-4 pt-[max(env(safe-area-inset-top),14px)]">
        <Wordmark />
        <div className="flex items-center gap-2">
          <LanguageSwitch />
          <button onClick={signOut} className="chip h-10 px-3" aria-label={t('auth.signOut')}><LogOut className="size-4" /></button>
        </div>
      </header>
      {children}
    </div>
  );
}

function SetupScreen() {
  const t = useTranslations();
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight"><span className="shine">{t('calc.setupTitle')}</span></h1>
        <p className="mt-1 max-w-xl text-sm text-muted">{t('calc.setupHint')}</p>
      </div>
      <Calculator mode="setup" />
    </motion.div>
  );
}

function CheckinScreen() {
  const t = useTranslations();
  const f = useFmt();
  const toast = useToast();
  const { profile, userId } = useProfile();
  const { updateProfile } = useAuth();
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
  const [raw, setRaw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const prev = profile.weight_kg ? +profile.weight_kg : null;

  async function save() {
    const n = Number(raw.replace(',', '.'));
    if (!raw.trim()) return setErr(t('common.required'));
    if (!Number.isFinite(n)) return setErr(t('calc.err.notNumber'));
    if (n < 0) return setErr(t('calc.err.negative'));
    const kg = Math.round((unit === 'lb' ? lbToKg(n) : n) * 10) / 10;
    if (kg < LIMITS.weightKg.min || kg > LIMITS.weightKg.max) return setErr(t('calc.err.weightRange'));
    setBusy(true);
    try {
      const r = calculate({ sex: profile.sex!, age: profile.age!, weightKg: kg, heightCm: +profile.height_cm!, activity: profile.activity!, goal: profile.goal!, aggressiveness: profile.aggressiveness });
      await logWeight(userId, today(), kg);
      await updateProfile({ weight_kg: kg, kcal_goal: r.calories, protein_goal: r.protein, carbs_goal: r.carbs, fat_goal: r.fat });
      invalidate('weights', 'home', 'cal', 'nut');
      toast.show(t('checkin.updated', { kcal: f.n0(r.calories) }));
    } catch (e) {
      toast.show(`${t('common.saveFailed')} ${(e as Error).message ?? ''}`, { tone: 'error' });
    } finally { setBusy(false); }
  }

  return (
    <div className="grid min-h-[70dvh] place-items-center">
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="w-full max-w-md">
        <Panel edge className="space-y-5 p-6 text-center">
          <motion.div className="relative mx-auto grid size-20 place-items-center" animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
            <div className="absolute inset-0 animate-breathe rounded-full bg-accent/25" />
            <div className="glass relative grid size-16 place-items-center rounded-full"><Scale className="size-7 text-accent" /></div>
          </motion.div>
          <div>
            <h1 className="font-display text-2xl font-semibold">{t('checkin.title')}</h1>
            <p className="mt-1 text-sm text-muted">{t('checkin.body')}</p>
            {prev && <p className="num mt-2 text-xs text-muted">{t('checkin.last', { kg: f.n1(unit === 'lb' ? kgToLb(prev) : prev), unit })}</p>}
          </div>
          <div className="flex justify-center">
            <Segmented size="sm" value={unit} onChange={(u) => { setUnit(u); setRaw(''); setErr(null); }} options={[{ value: 'kg', label: 'kg' }, { value: 'lb', label: 'lb' }]} />
          </div>
          <div className="relative">
            <input autoFocus inputMode="decimal" aria-label={t('calc.weight')} aria-invalid={!!err} placeholder="0"
              className="field num h-16 text-center text-3xl font-semibold" value={raw}
              onChange={(e) => { setRaw(e.target.value.replace(',', '.').replace(/[^0-9.\-]/g, '').slice(0, 6)); setErr(null); }}
              onKeyDown={(e) => e.key === 'Enter' && save()} />
            <span className="pointer-events-none absolute end-5 top-1/2 -translate-y-1/2 text-muted">{unit}</span>
          </div>
          {err && <p className="text-sm text-bad">{err}</p>}
          <Button variant="primary" size="lg" className="w-full" loading={busy} onClick={save}>{t('checkin.save')}</Button>
          <p className="text-xs text-muted">{t('checkin.why')}</p>
        </Panel>
      </motion.div>
    </div>
  );
}
