'use client';
import { clearQueries } from './query';
import { must, sb } from './supabase';

export type DeleteResult = 'ok' | 'wrong' | 'locked' | 'noPassword';

/** Deletes all of the signed-in user's Bulkify data after checking the password on the server. */
export async function deleteWithPassword(password: string): Promise<DeleteResult> {
  return must(await sb().rpc('bulkify_delete_account', { p_password: password })) as DeleteResult;
}

/**
 * Emails a one-time sign-in link that opens /delete-account. Opening it proves
 * the user owns the inbox; the page then lets them delete within 15 minutes.
 */
export async function emailDeleteLink(email: string) {
  const { error } = await sb().auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/delete-account` },
  });
  if (error) throw error;
}

/** Used on /delete-account after the emailed link signed the user in. */
export async function deleteWithEmailLink(): Promise<'ok' | 'expired'> {
  return must(await sb().rpc('bulkify_delete_account_by_email')) as 'ok' | 'expired';
}

/** Signs out locally after the data is gone. */
export async function finishDeletion() {
  clearQueries();
  await sb().auth.signOut().catch(() => {});
}
