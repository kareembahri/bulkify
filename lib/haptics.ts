/** A short "click" on devices that support vibration (Android). Silent elsewhere. */
export function tick(ms = 8) {
  try { if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(ms); } catch { /* ignore */ }
}
