'use client';
import { CalendarDays, ChevronRight, Download, Dumbbell, FileJson, LogOut, Moon, Scale, Sun, Target, Timer, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { DeleteAccount } from '@/components/features/DeleteAccount';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { Credit } from '@/components/ui/Footer';
import { Mark } from '@/components/ui/Brand';
import { Panel, SectionTitle } from '@/components/ui/Panel';
import { Reveal } from '@/components/ui/Reveal';
import { Segmented } from '@/components/ui/Segmented';
import { useToast } from '@/components/ui/Toast';
import { useAuth, useProfile } from '@/lib/auth';
import { useExercises, useFoods } from '@/lib/catalog';
import { loadWeights } from '@/lib/data';
import { toISO, today } from '@/lib/dates';
import { exportJSON, exportMealsCSV, exportWorkoutsCSV } from '@/lib/export';
import { useFmt } from '@/lib/format';
import { useQuery } from '@/lib/query';
import { rangeOf } from '@/lib/targets';

export default function SettingsPage() {
  const t = useTranslations();
  const f = useFmt();
  const toast = useToast();
  const { profile } = useProfile();
  const { session, updateProfile, setLanguage, setTheme, signOut } = useAuth();
  const ex = useExercises();
  const foods = useFoods();
  const weights = useQuery('weights', loadWeights, 60_000);
  const [name, setName] = useState(profile.display_name);
  const [busy, setBusy] = useState<string | null>(null);
  const [theme, setThemeState] = useState(profile.theme);
  const nameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setName(profile.display_name), [profile.display_name]);

  const onName = (v: string) => {
    setName(v);
    if (nameTimer.current) clearTimeout(nameTimer.current);
    nameTimer.current = setTimeout(() => {
      updateProfile({ display_name: v.trim() }).catch(() => toast.show(t('common.saveFailed'), { tone: 'error' }));
    }, 700);
  };
  const onGymStart = (v: string) => {
    updateProfile({ gym_start_date: v || null }).then(() => toast.show(t('common.saved'))).catch(() => toast.show(t('common.saveFailed'), { tone: 'error' }));
  };
  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try { await fn(); toast.show(t('settings.exported')); } catch { toast.show(t('common.loadFailed'), { tone: 'error' }); } finally { setBusy(null); }
  };

  const recent = [...(weights.data ?? [])].reverse().slice(0, 6);
  const g = f.ar ? ' غ' : ' g';

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-semibold tracking-tight">{t('settings.title')}</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        {/* body & goals */}
        <Reveal className="lg:col-span-2">
          <Panel edge className="space-y-4">
            <SectionTitle action={<span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-semibold text-accent">{t('common.required')}</span>}>
              <span className="inline-flex items-center gap-2"><Target className="size-3.5" />{t('settings.bodyGoals')}</span>
            </SectionTitle>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Fact label={t('calc.goal')} value={profile.goal ? t(`calc.goals.${profile.goal}`) : '—'} accent />
              <Fact label={t('calc.weight')} value={profile.weight_kg ? f.kg(+profile.weight_kg) : '—'} />
              <Fact label={t('calc.height')} value={profile.height_cm ? `${f.n0(+profile.height_cm)} cm` : '—'} />
              <Fact label={t('calc.age')} value={profile.age ? String(profile.age) : '—'} />
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[rgb(var(--line)/0.04)] p-3 sm:grid-cols-4">
              <Target4 label={t('macros.kcal')} value={profile.kcal_goal} unit={` ${t('common.kcal')}`} />
              <Target4 label={t('macros.protein')} value={profile.protein_goal} unit={g} />
              <Target4 label={t('macros.carbs')} value={profile.carbs_goal} unit={g} />
              <Target4 label={t('macros.fat')} value={profile.fat_goal} unit={g} />
            </div>
            <Link href="/settings/goals" className="press flex items-center justify-between gap-3 rounded-2xl bg-accent px-4 py-3.5 font-semibold text-on-accent shadow-glow">
              <span>{t('settings.editBody')}</span><ChevronRight className="size-5 rtl:rotate-180" />
            </Link>
          </Panel>
        </Reveal>

        <Reveal>
          <Panel className="h-full space-y-4">
            <SectionTitle><span className="inline-flex items-center gap-2"><User className="size-3.5" />{t('settings.profile')}</span></SectionTitle>
            <TextField label={t('settings.name')} value={name} onChange={onName} max={40} autoComplete="name" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium">{t('settings.language')}</span>
              <Segmented value={profile.language} onChange={(l) => setLanguage(l)}
                options={[{ value: 'en', label: 'English' }, { value: 'ar', label: 'العربية' }]} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium">{t('settings.theme')}</span>
              <Segmented value={theme} onChange={(v) => { setThemeState(v); setTheme(v); }}
                options={[{ value: 'dark', label: <span className="inline-flex items-center gap-1.5"><Moon className="size-4" />{t('settings.dark')}</span> },
                          { value: 'light', label: <span className="inline-flex items-center gap-1.5"><Sun className="size-4" />{t('settings.light')}</span> }]} />
            </div>
            <p className="text-xs text-muted">{t('settings.account')}: <span dir="ltr">{session?.user.email}</span></p>
          </Panel>
        </Reveal>

        <Reveal delay={0.05}>
          <Panel className="h-full space-y-4">
            <SectionTitle><span className="inline-flex items-center gap-2"><Dumbbell className="size-3.5" />{t('settings.training')}</span></SectionTitle>
            <div>
              <label htmlFor="gym" className="mb-1.5 block text-sm font-medium">{t('settings.gymStart')}</label>
              <input id="gym" type="date" className="field num" defaultValue={profile.gym_start_date ?? ''} max={today()}
                onChange={(e) => onGymStart(e.target.value)} />
              <p className="mt-1.5 text-xs text-muted">{t('settings.gymStartHint')}</p>
            </div>
            <p className="text-sm text-muted">{t('settings.appStart', { date: f.dayFull(toISO(new Date(profile.created_at))) })}</p>
            <Link href="/calendar" className="press flex items-center gap-3 rounded-2xl border border-[rgb(var(--line)/0.12)] px-4 py-3 hover:bg-[rgb(var(--line)/0.05)]">
              <CalendarDays className="size-5 text-accent" /><span className="flex-1 font-medium">{t('nav.calendar')}</span><ChevronRight className="size-4 text-muted rtl:rotate-180" />
            </Link>
          </Panel>
        </Reveal>

        <Reveal>
          <Panel className="h-full">
            <SectionTitle><span className="inline-flex items-center gap-2"><Scale className="size-3.5" />{t('settings.weights')}</span></SectionTitle>
            {recent.length === 0 ? <p className="text-sm text-muted">{t('settings.noWeights')}</p> : (
              <ul className="divide-y divide-[rgb(var(--line)/0.07)]">
                {recent.map((w, i) => (
                  <li key={w.date} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-muted">{f.dayMonthYear(w.date)}</span>
                    <span className={`num font-semibold ${i === 0 ? 'text-accent' : ''}`}>{f.kg(w.weight_kg)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted">{t('settings.weightsHint')}</p>
          </Panel>
        </Reveal>

        <Reveal delay={0.05}>
          <Panel className="h-full space-y-3">
            <SectionTitle><span className="inline-flex items-center gap-2"><Download className="size-3.5" />{t('settings.data')}</span></SectionTitle>
            <p className="text-sm text-muted">{t('settings.exportHint')}</p>
            <Button className="w-full" loading={busy === 'json'} onClick={() => run('json', exportJSON)}><FileJson className="size-4" />{t('settings.exportJson')}</Button>
            <div className="grid grid-cols-2 gap-3">
              <Button loading={busy === 'w'} onClick={() => run('w', () => exportWorkoutsCSV(ex.byId))}>{t('settings.exportWorkouts')}</Button>
              <Button loading={busy === 'm'} onClick={() => run('m', () => exportMealsCSV(foods.byId))}>{t('settings.exportMeals')}</Button>
            </div>
          </Panel>
        </Reveal>

        <Reveal className="lg:col-span-2">
          <Panel className="space-y-4">
            <SectionTitle>{t('settings.about')}</SectionTitle>
            <div className="flex items-center gap-3">
              <Mark className="size-12" />
              <div>
                <p dir="ltr" className="font-display text-xl font-semibold tracking-tight">Bulk<span className="text-accent">ify</span></p>
                <p className="num text-xs text-muted">{t('settings.version', { v: '2.3.0' })}</p>
              </div>
            </div>
            <div>
              <p className="label mb-1">{t('settings.owner')}</p>
              <Credit className="-ms-3" />
            </div>
            <p className="flex gap-2 rounded-2xl bg-[rgb(var(--line)/0.04)] p-3 text-xs text-muted"><Timer className="size-4 shrink-0" />{t('settings.keepAlive')}</p>
            <Button variant="danger" className="w-full" onClick={signOut}><LogOut className="size-4" />{t('auth.signOut')}</Button>
            <DeleteAccount />
          </Panel>
        </Reveal>
      </div>
    </div>
  );
}

function Fact({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-[rgb(var(--line)/0.04)] px-3 py-2.5">
      <p className="label">{label}</p>
      <p className={`num mt-0.5 font-display text-lg font-semibold ${accent ? 'text-accent' : ''}`}>{value}</p>
    </div>
  );
}
function Target4({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  const t = useTranslations();
  const f = useFmt();
  const range = rangeOf(value);
  return (
    <div className="px-1">
      <p className="text-xs text-muted">{label}</p>
      <p className="num font-semibold">{value != null ? `${f.n0(value)}${unit}` : '—'}</p>
      {range && <p className="num text-[11px] leading-tight text-muted">{f.n0(range.min)}–{f.n0(range.max)}{unit}</p>}
    </div>
  );
}
