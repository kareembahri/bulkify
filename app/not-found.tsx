import Link from 'next/link';
import { Mark } from '@/components/ui/Brand';

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <Mark className="mx-auto mb-6 size-16" />
        <p className="num font-display text-6xl font-semibold text-accent">404</p>
        <Link href="/" className="mt-6 inline-block rounded-2xl bg-accent px-5 py-3 font-semibold text-on-accent">Bulkify</Link>
      </div>
    </div>
  );
}
