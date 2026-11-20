'use client';
import { Trash2, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Wordmark } from '@/components/ui/Brand';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { deleteWithEmailLink, finishDeletion } from '@/lib/account';
import { useAuth } from '@/lib/auth';

/** Landing page of the "delete my account" email link (the link signs the user in by email). */
export default function DeleteAccountPage() {
  const t = useTranslations();
  const router = useRouter();
  const { session, status } = useAuth();
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<'ask' | 'done' | 'expired' | 'error'>('ask');

  async function confirm() {
    setBusy(true);
    try {
      const r = await deleteWithEmailLink();
      if (r === 'ok') { await finishDeletion(); setState('done'); } else setState('expired');
    } catch { setState('error'); } finally { setBusy(false); }
  }

  const waiting = status === 'loading';
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5">
      <div className="mb-8 flex justify-center"><Wordmark /></div>
      <Panel edge className="space-y-4 p-6">
        <h1 className="font-display text-xl font-semibold">{t('deleteAccount.title')}</h1>
        {state === 'done' ? (
          <>
            <p className="text-sm">{t('deleteAccount.done')}</p>
            <Button className="w-full" onClick={() => window.location.replace('/login')}>{t('auth.backToSignIn')}</Button>
          </>
        ) : !waiting && !session ? (
          <>
            <p className="text-sm text-muted">{t('deleteAccount.linkMissing')}</p>
            <Button className="w-full" onClick={() => router.replace('/login')}>{t('auth.backToSignIn')}</Button>
          </>
        ) : (
          <>
            <p className="flex gap-2 rounded-2xl bg-bad/10 p-3 text-sm text-bad ring-1 ring-bad/30">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />{t('deleteAccount.warning')}
            </p>
            {session?.user.email && <p className="text-sm text-muted">{t('settings.account')}: <span dir="ltr">{session.user.email}</span></p>}
            {state === 'expired' && <p className="text-sm text-bad">{t('deleteAccount.expired')}</p>}
            {state === 'error' && <p className="text-sm text-bad">{t('common.saveFailed')}</p>}
            <Button variant="danger" size="lg" className="w-full" loading={busy || waiting} disabled={state === 'expired'} onClick={confirm}>
              <Trash2 className="size-4" />{t('deleteAccount.confirm')}
            </Button>
            <Button className="w-full" onClick={() => router.replace('/')}>{t('deleteAccount.keep')}</Button>
          </>
        )}
      </Panel>
    </div>
  );
}
