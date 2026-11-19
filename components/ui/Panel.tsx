'use client';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

type Props = React.HTMLAttributes<HTMLDivElement> & { edge?: boolean; pad?: boolean };

/** Glass surface with a thin luminous border. */
export const Panel = forwardRef<HTMLDivElement, Props>(function Panel({ edge, pad = true, className = '', ...rest }, ref) {
  return <div ref={ref} className={`glass rounded-3xl ${edge ? 'hud-edge' : ''} ${pad ? 'p-4 sm:p-5' : ''} ${className}`} {...rest} />;
});

/** A panel you can tap: lifts on hover, squishes on press. */
export function TapPanel({ edge, className = '', children, ...rest }: HTMLMotionProps<'button'> & { edge?: boolean }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className={`glass block w-full overflow-hidden rounded-3xl p-4 text-start sm:p-5 ${edge ? 'hud-edge' : ''} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="label">{children}</h2>
      {action}
    </div>
  );
}
