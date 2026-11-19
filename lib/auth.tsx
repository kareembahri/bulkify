'use client';
import type { Session } from '@supabase/supabase-js';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { clearQueries } from './query';
import { hasSupabaseEnv, must, sb } from './supabase';
import type { Profile } from './types';

type Status = 'loading' | 'signedOut' | 'ready' | 'noenv' | 'error';
type Ctx = {
  status: Status;
  session: Session | null;
  profile: Profile | null;
  recovery: boolean;
  error: string | null;
  updateProfile: (patch: Partial<Omit<Profile, 'id'>>) => Promise<void>;
  setLanguage: (l: 'en' | 'ar') => Promise<void>;
  setTheme: (t: 'dark' | 'light') => void;
  signOut: () => Promise<void>;
  retry: () => void;
};

const AuthContext = createContext<Ctx | null>(null);
const COOKIE = 'bulkify-locale';

export const setLocaleCookie = (l: 'en' | 'ar') => {
  document.cookie = `${COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
};
export const applyTheme = (t: 'dark' | 'light') => {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('bulkify-theme', t); } catch { /* private mode */ }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale() as 'en' | 'ar';
  const router = useRouter();
  const [status, setStatus] = useState<Status>(hasSupabaseEnv ? 'loading' : 'noenv');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recovery, setRecovery] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const loadedFor = useRef<string | null>(null);

  // First sign-in creates the Bulkify profile (+ default weekly program).
  const ensureProfile = useCallback(async (s: Session) => {
    if (loadedFor.current === s.user.id) return;
    loadedFor.current = s.user.id;
    try {
      const p = must(await sb().rpc('bulkify_ensure_profile', {
        p_language: localeRef.current, p_name: (s.user.user_metadata?.name as string | undefined) ?? '',
      })) as Profile;
      setProfile(p);
      setStatus('ready');
      applyTheme(p.theme);
      if (p.language !== localeRef.current) { setLocaleCookie(p.language); router.refresh(); }
    } catch (e) {
      loadedFor.current = null;
      setError((e as Error).message);
      setStatus('error');
    }
  }, [router]);

  useEffect(() => {
    if (!hasSupabaseEnv) return;
    const client = sb();
    let alive = true;
    client.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      if (data.session) ensureProfile(data.session); else setStatus('signedOut');
    });
    const { data: sub } = client.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      setSession(s);
      // Defer: never await Supabase calls inside this callback.
      setTimeout(() => {
        if (!alive) return;
        if (s) ensureProfile(s);
        else { loadedFor.current = null; setProfile(null); clearQueries(); setStatus('signedOut'); }
      }, 0);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [ensureProfile, attempt]);

  const updateProfile = useCallback(async (patch: Partial<Omit<Profile, 'id'>>) => {
    if (!profile) return;
    const prev = profile;
    setProfile({ ...profile, ...patch });
    try {
      const p = must(await sb().from('bulkify_profiles').update(patch).eq('id', profile.id).select('*').single()) as Profile;
      setProfile(p);
    } catch (e) { setProfile(prev); throw e; }
  }, [profile]);

  const setLanguage = useCallback(async (l: 'en' | 'ar') => {
    setLocaleCookie(l);
    router.refresh();
    if (profile) await updateProfile({ language: l }).catch(() => {});
  }, [profile, router, updateProfile]);

  const setTheme = useCallback((t: 'dark' | 'light') => {
    applyTheme(t);
    if (profile) updateProfile({ theme: t }).catch(() => {});
  }, [profile, updateProfile]);

  const signOut = useCallback(async () => {
    await sb().auth.signOut();
    clearQueries();
    router.replace('/login');
  }, [router]);

  const retry = useCallback(() => { setError(null); setStatus('loading'); loadedFor.current = null; setAttempt((a) => a + 1); }, []);

  const value = useMemo<Ctx>(() => ({ status, session, profile, recovery, error, updateProfile, setLanguage, setTheme, signOut, retry }),
    [status, session, profile, recovery, error, updateProfile, setLanguage, setTheme, signOut, retry]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth outside AuthProvider');
  return c;
}

/** For screens inside the signed-in shell: profile is guaranteed there. */
export function useProfile() {
  const { profile, session } = useAuth();
  return { profile: profile!, userId: session?.user.id ?? '' };
}
