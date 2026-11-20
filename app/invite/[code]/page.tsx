'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Splash } from '@/components/Splash';
import { useAuth } from '@/lib/auth';
import { savePendingInvite } from '@/lib/invite';

/** Landing page of a friend invite link: remembers the code, then opens Friends (signing in first if needed). */
export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => { savePendingInvite(String(code ?? '')); }, [code]);
  useEffect(() => {
    if (status === 'ready') router.replace('/friends');
    else if (status === 'signedOut' || status === 'noenv' || status === 'error') router.replace('/login');
  }, [status, router]);

  return <Splash />;
}
