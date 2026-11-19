'use client';
import { motion, type HTMLMotionProps } from 'framer-motion';

/** Fades and rises into view the first time it scrolls on screen. */
export function Reveal({ delay = 0, className = '', children, ...rest }: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ type: 'spring', stiffness: 170, damping: 24, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
