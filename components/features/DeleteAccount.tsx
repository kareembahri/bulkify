'use client';
import { MailCheck, Trash2, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { deleteWithPassword, emailDeleteLink, finishDeletion } from '@/lib/account';
import { useAuth } from '@/lib/auth';
import { tick } from '@/lib/haptics';

/**
 * "Delete account" button for Settings (under Sign out). Opens a sheet that
 * asks for the password; if the user forgot it, they can get an email link
 * that opens /delete-account instead.
 */
export function DeleteAccount() {
  const t = useTranslations();
  const toast = useToast();
  const { session } = useAuth();
  const email = session?.user.email ?? '';
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<'pw' | 'mail' | null>(null);
  const [sent, setSent] = useState(false);

  const close = () => { if (busy) return; setOpen(false); setPw(''); setErr(null); setSent(false); };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pw) return setErr(t('deleteAccount.enterPassword'));
    setBusy('pw'); setErr(null);
    try {
      const r = await deleteWithPassword(pw);
      if (r === 'ok') {
        tick(30);
        await finishDeletion();
        toast.show(t('deleteAccount.done'));
        window.location.replace('/login');
        return;
      }
      setErr(t(`deleteAccount.${r}`));
    } catch (e) {
      setErr(`${t('common.saveFailed')} ${(e as Error).message ?? ''}`);
    } finally { setBusy(null); }
  }

  async function sendLink() {
    setBusy('mail'); setErr(null);
    try { await emailDeleteLink(email); setSent(true); }
    catch (e) { setErr(/rate|many/i.test((e as Error).message) ? t('deleteAccount.tooMany') : (e as Error).message); }
    finally { setBusy(null); }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="press flex w-full items-center justify-center gap-2 rounded-2xl border border-bad/40 px-4 py-3 text-sm font-semibold text-bad hover:bg-bad/10">
        <Trash2 className="size-4" />{t('deleteAccount.button')}
      </button>

      <Sheet open={open} onClose={close} title={t('deleteAccount.title')}>
        <div className="space-y-4 pb-4">
          <p className="flex gap-2 rounded-2xl bg-bad/10 p-3 text-sm text-bad ring-1 ring-bad/30">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />{t('deleteAccount.warning')}
          </p>
          {sent ? (
            <p className="flex gap-2 rounded-2xl bg-good/10 p-3 text-sm ring-1 ring-good/30">
              <MailCheck className="mt-0.5 size-4 shrink-0 text-good" />
              <span>{t('deleteAccount.linkSent', { email })}</span>
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <TextField label={t('deleteAccount.password')} type="password" dir="ltr" value={pw} onChange={setPw}
                autoComplete="current-password" error={err} />
              <Button type="submit" variant="danger" size="lg" className="w-full" loading={busy === 'pw'} disabled={!!busy}>
                <Trash2 className="size-4" />{t('deleteAccount.confirm')}
              </Button>
              <button type="button" onClick={sendLink} disabled={!!busy || !email}
                className="block w-full text-center text-sm font-medium text-accent underline-offset-4 hover:underline disabled:opacity-50">
                {busy === 'mail' ? t('common.saving') : t('deleteAccount.forgot')}
              </button>
            </form>
          )}
          <Button className="w-full" onClick={close} disabled={!!busy}>{t('common.cancel')}</Button>
        </div>
      </Sheet>
    </>
  );
}
