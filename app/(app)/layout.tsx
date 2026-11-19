'use client';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SetupGate } from '@/components/features/SetupGate';
import { BottomNav, Header } from '@/components/Shell';
import { Splash } from '@/components/Splash';
import { Button } from '@/components/ui/Button';
import { Footer } from '@/components/ui/Footer';
import { OfflineBanner } from '@/components/ui/Offline';
import { ErrorState } from '@/components/ui/States';
import { useAuth } from '@/lib/auth';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status, recovery, retry, signOut, error } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  useEffect(() => {
    if (status === 'signedOut' || status === 'noenv') router.replace('/login');
    else if (recovery) router.replace('/reset');
  }, [status, recovery, router]);

  if (status === 'error') {
    return (
      <div className="mx-auto grid min-h-dvh max-w-sm place-items-center px-6">
        <div className="w-full space-y-3">
          <ErrorState message={`${t('auth.profileError')} ${error ?? ''}`} onRetry={retry} />
          <Button variant="ghost" className="w-full" onClick={signOut}>{t('auth.signOut')}</Button>
        </div>
      </div>
    );
  }
  if (status !== 'ready') return <Splash />;

  return (
    <SetupGate>
      <div className="mx-auto min-h-dvh max-w-5xl px-4 pb-36">
        <Header />
        <OfflineBanner />
        <main>{children}</main>
        <Footer />
      </div>
      <BottomNav />
    </SetupGate>
  );
}
