import type { Config } from 'tailwindcss';

const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'), surface: v('surface'), ink: v('ink'), muted: v('muted'), line: v('line'),
        accent: v('accent'), 'on-accent': v('on-accent'), cyan: v('cyan'), violet: v('violet'),
        bad: v('bad'), good: v('good'), warn: v('warn'),
      },
      fontFamily: {
        display: ['var(--font-display)', 'var(--font-arabic)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'var(--font-arabic)', 'system-ui', 'sans-serif'],
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        glow: '0 0 0 1px rgb(var(--accent) / .35), 0 10px 40px -10px rgb(var(--accent) / .55)',
        'glow-bad': '0 0 0 1px rgb(var(--bad) / .35), 0 10px 40px -12px rgb(var(--bad) / .6)',
        lift: '0 24px 60px -24px rgb(0 0 0 / .45)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        prglow: {
          '0%,100%': { boxShadow: '0 0 0 0 rgb(var(--accent) / 0)' },
          '50%': { boxShadow: '0 0 24px 2px rgb(var(--accent) / .55)' },
        },
        breathe: { '0%,100%': { opacity: '.55', transform: 'scale(1)' }, '50%': { opacity: '1', transform: 'scale(1.06)' } },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        prglow: 'prglow 2.6s ease-in-out infinite',
        breathe: 'breathe 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
