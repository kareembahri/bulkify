'use client';
import { motion, useScroll, useSpring } from 'framer-motion';
import { CalendarDays, Dumbbell, House, Languages, Settings, TrendingUp, UtensilsCrossed } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { tick } from '@/lib/haptics';
import { Wordmark } from './ui/Brand';

const NAV = [
  { href: '/', key: 'home', icon: House },
  { href: '/workout', key: 'workout', icon: Dumbbell },
  { href: '/food', key: 'food', icon: UtensilsCrossed },
  { href: '/progress', key: 'progress', icon: TrendingUp },
] as const;

export function LanguageSwitch({ className = '' }: { className?: string }) {
  const t = useTranslations();
  const { setLanguage } = useAuth();
  // The label shows the *other* language (e.g. "العربية" while in English).
  const next = t('nav.language') === 'English' ? 'en' : 'ar';
  return (
    <button onClick={() => { tick(); setLanguage(next); }}
      className={`chip h-10 px-3 ${className}`} lang={next} aria-label={t('settings.language')}>
      <Languages className="size-4" /> <span className={`hidden min-[400px]:inline ${next === 'ar' ? 'font-sans' : ''}`}>{t('nav.language')}</span>
    </button>
  );
}

function HeaderIcon({ href, label, active, children }: { href: string; label: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} aria-label={label} title={label} onClick={() => tick(5)} aria-current={active ? 'page' : undefined}
      className={`press glass grid size-10 place-items-center rounded-full transition-colors ${active ? 'border-accent/60 text-accent shadow-glow' : 'hover:text-accent'}`}>
      {children}
    </Link>
  );
}

export function Header() {
  const t = useTranslations();
  const path = usePathname();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  return (
    <header className="sticky top-0 z-40 -mx-4 mb-4 px-4 pb-3 pt-[max(env(safe-area-inset-top),12px)] md:backdrop-blur-xl [background:linear-gradient(rgb(var(--bg)/0.96),rgb(var(--bg)/0.85)_70%,transparent)] md:[background:linear-gradient(rgb(var(--bg)/0.9),rgb(var(--bg)/0.6)_70%,transparent)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
        <Link href="/" aria-label="Bulkify" className="press shrink-0"><Wordmark /></Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <HeaderIcon href="/calendar" label={t('nav.calendar')} active={path.startsWith('/calendar')}><CalendarDays className="size-[18px]" /></HeaderIcon>
          <LanguageSwitch />
          <HeaderIcon href="/settings" label={t('nav.settings')} active={path.startsWith('/settings')}><Settings className="size-[18px]" /></HeaderIcon>
        </div>
      </div>
      {/* scroll progress */}
      <motion.div aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-accent via-cyan to-violet rtl:origin-right"
        style={{ scaleX: progress }} />
    </header>
  );
}

export function BottomNav() {
  const t = useTranslations();
  const path = usePathname();
  const active = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
  return (
    <nav aria-label="Main" className="safe-bottom fixed inset-x-0 bottom-0 z-50 px-3">
      <div className="glass-strong mx-auto flex max-w-[520px] items-stretch justify-between rounded-[26px] p-1.5 shadow-lift">
        {NAV.map(({ href, key, icon: Icon }) => {
          const on = active(href);
          return (
            <Link key={href} href={href} onClick={() => tick(5)} aria-current={on ? 'page' : undefined}
              className={`press relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 rounded-[20px] text-[11px] font-medium transition-colors ${on ? 'text-on-accent' : 'text-muted hover:text-ink'}`}>
              {on && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-[20px] bg-accent shadow-glow" transition={{ type: 'spring', stiffness: 480, damping: 36 }} />}
              <motion.span className="relative" animate={{ y: on ? -1 : 0, scale: on ? 1.12 : 1, rotate: on ? [0, -8, 6, 0] : 0 }} transition={{ default: { type: 'spring', stiffness: 400, damping: 18 }, rotate: { duration: 0.5, ease: 'easeOut' } }}>
                <Icon className="size-[22px]" strokeWidth={on ? 2.3 : 1.9} />
              </motion.span>
              <span className="relative">{t(`nav.${key}`)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
