import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_COOKIE = 'bulkify-locale';

// No locale in the URL: the language lives in a cookie (and in the user's profile,
// which re-sets the cookie on sign-in, so it is remembered per user).
export default getRequestConfig(async () => {
  const fromCookie = (await cookies()).get(LOCALE_COOKIE)?.value;
  let locale: Locale = 'en';
  if (fromCookie === 'ar' || fromCookie === 'en') locale = fromCookie;
  else if ((await headers()).get('accept-language')?.toLowerCase().startsWith('ar')) locale = 'ar';
  return { locale, messages: (await import(`../messages/${locale}.json`)).default };
});
