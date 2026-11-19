'use client';
import { motion } from 'framer-motion';

/** Smooth page transition between tabs. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 30 }}>
      {children}
    </motion.div>
  );
}
