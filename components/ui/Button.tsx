'use client';
import { AnimatePresence, motion, type HTMLMotionProps } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';
import { forwardRef, useState } from 'react';
import { tick } from '@/lib/haptics';

type Variant = 'primary' | 'ghost' | 'soft' | 'danger' | 'plain';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent font-semibold shadow-glow hover:brightness-105',
  soft: 'bg-[rgb(var(--line)/0.06)] border border-[rgb(var(--line)/0.12)] hover:bg-[rgb(var(--line)/0.1)]',
  ghost: 'hover:bg-[rgb(var(--line)/0.06)]',
  danger: 'bg-bad/10 text-bad border border-bad/30 hover:bg-bad/20',
  plain: '',
};
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-xl gap-1.5',
  md: 'h-11 px-5 text-[15px] rounded-2xl gap-2',
  lg: 'h-14 px-6 text-base rounded-2xl gap-2.5',
  icon: 'size-11 rounded-2xl',
};

export type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: Variant; size?: Size; loading?: boolean; children?: React.ReactNode;
};

type Ripple = { id: number; x: number; y: number };

/** Button with spring press, a light ripple from the touch point and a haptic tick. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'soft', size = 'md', loading, className = '', children, disabled, onClick, onPointerDown, type = 'button', ...rest }, ref,
) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const off = disabled || loading;
  return (
    <motion.button
      ref={ref}
      type={type}
      whileTap={off ? undefined : { scale: 0.94 }}
      whileHover={off ? undefined : { y: -1 }}
      transition={{ type: 'spring', stiffness: 600, damping: 28 }}
      disabled={off}
      onPointerDown={(e) => {
        if (!off) {
          const r = e.currentTarget.getBoundingClientRect();
          const id = Date.now() + Math.random();
          setRipples((x) => [...x.slice(-2), { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
          setTimeout(() => setRipples((x) => x.filter((p) => p.id !== id)), 650);
        }
        onPointerDown?.(e);
      }}
      onClick={(e) => { tick(); onClick?.(e); }}
      className={`relative isolate inline-flex select-none items-center justify-center overflow-hidden whitespace-nowrap transition-[background,filter,opacity,box-shadow] disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      <AnimatePresence>
        {ripples.map((p) => (
          <motion.span key={p.id} aria-hidden className="pointer-events-none absolute -z-10 rounded-full"
            style={{ left: p.x, top: p.y, width: 12, height: 12, marginLeft: -6, marginTop: -6,
              background: variant === 'primary' ? 'rgb(255 255 255 / .45)' : 'rgb(var(--accent) / .35)' }}
            initial={{ scale: 0, opacity: 0.9 }} animate={{ scale: 28, opacity: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }} />
        ))}
      </AnimatePresence>
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : children}
    </motion.button>
  );
});
