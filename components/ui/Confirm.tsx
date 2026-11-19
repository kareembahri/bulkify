'use client';
import { useTranslations } from 'next-intl';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Button } from './Button';
import { Sheet } from './Sheet';

type Opts = { title: string; body?: string; confirmLabel?: string; danger?: boolean };
const Ctx = createContext<(o: Opts) => Promise<boolean>>(async () => false);

/** Confirmation as a bottom sheet (no browser popups). `const ok = await confirm({...})` */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const [opts, setOpts] = useState<Opts | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const confirm = useCallback((o: Opts) => new Promise<boolean>((res) => { resolver.current = res; setOpts(o); }), []);
  const close = (v: boolean) => { resolver.current?.(v); resolver.current = null; setOpts(null); };
  return (
    <Ctx.Provider value={confirm}>
      {children}
      <Sheet open={!!opts} onClose={() => close(false)} title={opts?.title}>
        {opts?.body && <p className="mb-5 text-sm text-muted">{opts.body}</p>}
        <div className="grid grid-cols-2 gap-3 pb-4">
          <Button onClick={() => close(false)}>{t('common.cancel')}</Button>
          <Button data-autofocus variant={opts?.danger ? 'danger' : 'primary'} onClick={() => close(true)}>
            {opts?.confirmLabel ?? t('common.confirm')}
          </Button>
        </div>
      </Sheet>
    </Ctx.Provider>
  );
}
export const useConfirm = () => useContext(Ctx);
