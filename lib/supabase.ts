import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Must be referenced literally so Next.js inlines them at build time.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseEnv = Boolean(URL && KEY);

let client: SupabaseClient | null = null;

/** Browser Supabase client (anon key only; RLS protects every row). */
export function sb(): SupabaseClient {
  if (!client) {
    if (!URL || !KEY) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
    client = createClient(URL, KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'bulkify-auth' },
    });
  }
  return client;
}

/** Throws the Supabase error (if any) and returns data. */
export function must<T>(res: { data: T; error: { message: string; code?: string } | null }): T {
  if (res.error) {
    const e = new Error(res.error.message) as Error & { code?: string };
    e.code = res.error.code;
    throw e;
  }
  return res.data;
}
