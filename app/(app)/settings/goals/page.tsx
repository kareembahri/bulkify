'use client';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calculator } from '@/components/features/Calculator';

/** Settings → Body & goals: the calories & macros calculator. */
export default function GoalsPage() {
  const t = useTranslations();
  const router = useRouter();
  return (
    <div className="space-y-4">
      <div>
        <Link href="/settings" className="press inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          <ArrowLeft className="size-4 rtl:rotate-180" />{t('settings.title')}
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">{t('calc.title')}</h1>
        <p className="mt-1 max-w-xl text-sm text-muted">{t('calc.intro')}</p>
      </div>
      <Calculator mode="settings" onSaved={() => router.push('/settings')} />
    </div>
  );
}
