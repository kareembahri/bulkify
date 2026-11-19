'use client';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

/** Instagram glyph drawn in the same 24px / 2px-stroke style as the Lucide icon set used everywhere else. */
export function InstagramIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export const OWNER_URL = 'https://www.instagram.com/kareem_bahri/';

/** Owner credit. Shown on every main page and in Settings → About. */
export function Credit({ className = '' }: { className?: string }) {
  const t = useTranslations();
  return (
    <motion.a
      href={OWNER_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('footer.instagram')}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      className={`group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-muted transition-colors hover:text-ink ${className}`}
    >
      <span className="grid size-6 place-items-center rounded-full border border-[rgb(var(--line)/0.12)] transition-all group-hover:border-accent/60 group-hover:text-accent group-hover:shadow-glow">
        <InstagramIcon className="size-3.5" />
      </span>
      <span>{t('footer.madeBy')}</span>
    </motion.a>
  );
}

export function Footer() {
  return (
    <footer className="mt-12 flex justify-center pb-2">
      <Credit />
    </footer>
  );
}
