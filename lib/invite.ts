'use client';
// Friend invite links: https://<site>/invite/123456
// Opening one stores the code until the user is signed in and set up, then the
// Friends page fills it into the "add friend" box and sends the request.

const KEY = 'bulkify-invite';
const VALID = /^[0-9]{6}$/;

export const inviteUrl = (code: string) => `${window.location.origin}/invite/${code}`;

export function savePendingInvite(code: string) {
  if (!VALID.test(code)) return;
  try { localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() })); } catch { /* private mode */ }
}

/** The stored invite code (valid for 7 days), without removing it. */
export function peekPendingInvite(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { code, at } = JSON.parse(raw) as { code: string; at: number };
    if (!VALID.test(code) || Date.now() - at > 7 * 86_400_000) { localStorage.removeItem(KEY); return null; }
    return code;
  } catch { return null; }
}

/** Returns the stored invite code once and forgets it. */
export function takePendingInvite(): string | null {
  const code = peekPendingInvite();
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  return code;
}
