'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export function OfflineBanner() {
  const t = useTranslations();
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const on = () => setOffline(!navigator.onLine);
    on();
    window.addEventListener('online', on); window.addEventListener('offline', on);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', on); };
  }, []);
  return (
    <AnimatePresence>
      {offline && (
        <motion.div role="status" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          className="mb-3 flex items-center gap-2 rounded-2xl bg-warn/10 px-4 py-2.5 text-sm text-warn">
          <WifiOff className="size-4 shrink-0" />{t('empty.offline')}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
