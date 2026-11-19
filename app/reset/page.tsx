'use client';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Wordmark } from '@/components/ui/Brand';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { Panel } from '@/components/ui/Panel';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { sb } from '@/lib/supabase';

/** Landing page of the password-reset email link (Supabase signs the user in with a recovery session). */
export default function ResetPage() {
  const t = useTranslations();
  const router = useRouter();
  const toast = useToast();
  const { session, status } = useAuth();
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return setErr(t('auth.weak'));
    setBusy(true);
    const { error } = await sb().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setErr(error.message);
    toast.show(t('auth.passwordUpdated'));
    window.location.replace('/');
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5">
      <div className="mb-8 flex justify-center"><Wordmark /></div>
      <Panel edge className="p-6">
        <h1 className="mb-4 font-display text-xl font-semibold">{t('auth.setPassword')}</h1>
        {status !== 'loading' && !session ? (
          <div className="space-y-4">
            <p className="text-sm text-muted">{t('auth.recoveryMissing')}</p>
            <Button className="w-full" onClick={() => router.replace('/login')}>{t('auth.backToSignIn')}</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <TextField label={t('auth.newPassword')} type="password" dir="ltr" value={pw} onChange={setPw} autoComplete="new-password" error={err} />
            <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy}>{t('auth.setPassword')}</Button>
          </form>
        )}
      </Panel>
    </div>
  );
}
