'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { KeyRound, Mail, User, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LanguageSwitch } from '@/components/Shell';
import { Mark } from '@/components/ui/Brand';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { Credit } from '@/components/ui/Footer';
import { Panel } from '@/components/ui/Panel';
import { Segmented } from '@/components/ui/Segmented';
import { useAuth } from '@/lib/auth';
import { peekPendingInvite } from '@/lib/invite';
import { sb } from '@/lib/supabase';

type Mode = 'in' | 'up' | 'forgot';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const { status } = useAuth();
  const [mode, setMode] = useState<Mode>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [invite, setInvite] = useState<string | null>(null);
  useEffect(() => setInvite(peekPendingInvite()), []);
  // After signing in, an invite link sends you straight to Friends.
  useEffect(() => { if (status === 'ready') router.replace(peekPendingInvite() ? '/friends' : '/'); }, [status, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setInfo(null);
    if (!EMAIL.test(email.trim())) return setErr(t('auth.emailInvalid'));
    if (mode !== 'forgot' && password.length < 8) return setErr(t('auth.weak'));
    setBusy(true);
    try {
      const origin = window.location.origin;
      if (mode === 'in') {
        const { error } = await sb().auth.signInWithPassword({ email: email.trim(), password });
        if (error) setErr(/confirm/i.test(error.message) ? t('auth.notConfirmed') : /invalid/i.test(error.message) ? t('auth.invalid') : error.message);
      } else if (mode === 'up') {
        const { data, error } = await sb().auth.signUp({
          email: email.trim(), password, options: { emailRedirectTo: `${origin}/login`, data: { name: name.trim() } },
        });
        if (error) setErr(error.message);
        else if (!data.session) { setInfo(t('auth.checkEmail')); setMode('in'); }
      } else {
        const { error } = await sb().auth.resetPasswordForEmail(email.trim(), { redirectTo: `${origin}/reset` });
        if (error) setErr(error.message); else setInfo(t('auth.resetSent'));
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-[max(env(safe-area-inset-top),20px)]">
      <div className="flex justify-end"><LanguageSwitch /></div>
      <div className="flex flex-1 flex-col justify-center py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-3xl bg-accent/30 blur-2xl" />
            <Mark className="relative size-20" />
          </div>
          <h1 dir="ltr" className="font-display text-4xl font-semibold tracking-[-0.05em]">Bulk<span className="text-accent">ify</span></h1>
          <p className="mt-2 text-muted">{t('auth.tagline')}</p>
        </motion.div>

        {status === 'noenv' ? (
          <Panel edge className="text-center">
            <h2 className="font-display text-lg font-semibold">{t('auth.noEnvTitle')}</h2>
            <p className="mt-2 text-sm text-muted" dir="ltr">{t('auth.noEnvBody')}</p>
          </Panel>
        ) : (
          <Panel edge className="p-5 sm:p-6">
            {invite && (
              <p className="mb-4 flex items-center gap-2 rounded-2xl bg-accent/10 px-3 py-2.5 text-sm ring-1 ring-accent/30">
                <UserPlus className="size-4 shrink-0 text-accent" />
                <span>{t('friends.inviteLogin', { code: invite })}</span>
              </p>
            )}
            {mode !== 'forgot' && (
              <Segmented className="mb-5 w-full" value={mode} onChange={(m) => { setMode(m); setErr(null); }}
                options={[{ value: 'in', label: t('auth.signIn') }, { value: 'up', label: t('auth.signUp') }]} />
            )}
            <form onSubmit={submit} className="space-y-4" noValidate>
              <AnimatePresence initial={false}>
                {mode === 'up' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <TextField label={<span className="inline-flex items-center gap-2"><User className="size-4" />{t('auth.name')}</span>}
                      value={name} onChange={setName} max={40} autoComplete="name" />
                  </motion.div>
                )}
              </AnimatePresence>
              <TextField label={<span className="inline-flex items-center gap-2"><Mail className="size-4" />{t('auth.email')}</span>}
                type="email" dir="ltr" value={email} onChange={setEmail} autoComplete="email" inputMode="email" required />
              {mode !== 'forgot' && (
                <TextField label={<span className="inline-flex items-center gap-2"><KeyRound className="size-4" />{t('auth.password')}</span>}
                  type="password" dir="ltr" value={password} onChange={setPassword}
                  autoComplete={mode === 'up' ? 'new-password' : 'current-password'} required />
              )}
              {err && <p role="alert" className="rounded-xl bg-bad/10 px-3 py-2 text-sm text-bad">{err}</p>}
              {info && <p role="status" className="rounded-xl bg-accent/10 px-3 py-2 text-sm text-accent">{info}</p>}
              <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy}>
                {mode === 'in' ? t('auth.signIn') : mode === 'up' ? t('auth.signUp') : t('auth.sendReset')}
              </Button>
              <button type="button" className="w-full text-center text-sm text-muted hover:text-ink"
                onClick={() => { setMode(mode === 'forgot' ? 'in' : 'forgot'); setErr(null); setInfo(null); }}>
                {mode === 'forgot' ? t('auth.backToSignIn') : t('auth.forgot')}
              </button>
            </form>
          </Panel>
        )}
      </div>
      <div className="flex justify-center pb-6"><Credit /></div>
    </div>
  );
}
