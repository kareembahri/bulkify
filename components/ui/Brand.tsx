/** The Bulkify mark: a geometric "B" whose waist is a barbell. Matches public/icons. */
export function Mark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="bk-g" gradientUnits="userSpaceOnUse" x1="8" y1="10" x2="56" y2="54">
          <stop offset="0" stopColor="#E8FF8A" /><stop offset="1" stopColor="#B6F23A" />
        </linearGradient>
        <radialGradient id="bk-r" cx=".3" cy=".2" r="1"><stop offset="0" stopColor="#1A2230" /><stop offset="1" stopColor="#07090D" /></radialGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#bk-r)" />
      <rect x=".5" y=".5" width="63" height="63" rx="15" fill="none" stroke="#B6F23A" strokeOpacity=".3" />
      <g fill="url(#bk-g)">
        <rect x="17" y="13" width="8.5" height="38" rx="2.4" />
        <path d="M22 13h12.1a8.25 8.25 0 0 1 0 16.5H22z" />
        <path d="M22 34.5h13.9a8.25 8.25 0 0 1 0 16.5H22z" />
        <rect x="9" y="30.6" width="46" height="2.8" rx="1.4" />
        <rect x="7" y="27.6" width="3.2" height="8.8" rx="1.2" />
        <rect x="53.8" y="27.6" width="3.2" height="8.8" rx="1.2" />
      </g>
    </svg>
  );
}

/** Wordmark: always Latin "Bulkify", also in the Arabic UI. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span dir="ltr" className={`inline-flex items-center gap-2.5 ${className}`}>
      <Mark className="size-8 drop-shadow-[0_0_14px_rgb(198_255_61/0.35)]" />
      <span className="font-display text-[1.35rem] font-semibold tracking-[-0.04em]">
        Bulk<span className="text-accent">ify</span>
      </span>
    </span>
  );
}
