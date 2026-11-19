import type { Metadata, Viewport } from 'next';
import { Inter_Tight, Readex_Pro, Space_Grotesk } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Aurora } from '@/components/ui/Aurora';
import { Providers } from './providers';
import './globals.css';

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const sans = Inter_Tight({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const arabic = Readex_Pro({ subsets: ['arabic', 'latin'], variable: '--font-arabic', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Bulkify', template: '%s · Bulkify' },
  description: 'Bulkify: train, eat, progress. Gym and nutrition tracking in English and Arabic.',
  applicationName: 'Bulkify',
  appleWebApp: { capable: true, title: 'Bulkify', statusBarStyle: 'black-translucent' },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }, { url: '/icons/favicon-32.png', sizes: '32x32' }],
    apple: '/icons/apple-touch-icon.png',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#06080b' },
    { media: '(prefers-color-scheme: light)', color: '#f0f3ee' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// Applies the saved theme before first paint (no flash).
const themeScript = `try{var t=localStorage.getItem('bulkify-theme');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      data-theme="dark"
      className={`${display.variable} ${sans.variable} ${arabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Aurora />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
