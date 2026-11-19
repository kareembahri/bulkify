// Fast bilingual fuzzy search (runs locally, no external API).

const AR_DIACRITICS = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(AR_DIACRITICS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function editDistanceAtMost1(a: string, b: string): boolean {
  if (a === b) return true;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (la > lb) i++; else if (lb > la) j++; else { i++; j++; }
  }
  return edits + (la - i) + (lb - j) <= 1;
}

/** Score one normalized token against a normalized haystack (0 = no match). */
function tokenScore(tok: string, hay: string, words: string[]): number {
  if (!tok) return 1;
  if (hay.startsWith(tok)) return 10;
  if (words.some((w) => w.startsWith(tok))) return 8;
  if (hay.includes(tok)) return 6;
  if (tok.length >= 4 && words.some((w) => editDistanceAtMost1(tok, w.slice(0, tok.length)) || editDistanceAtMost1(tok, w))) return 4;
  // subsequence (e.g. "bbp" → "barbell bench press" initials)
  if (tok.length >= 2) {
    const initials = words.map((w) => w[0]).join('');
    if (initials.includes(tok)) return 5;
  }
  return 0;
}

export type Indexed<T> = { item: T; hay: string; words: string[] };

export function buildIndex<T>(items: T[], text: (t: T) => string): Indexed<T>[] {
  return items.map((item) => { const hay = normalize(text(item)); return { item, hay, words: hay.split(' ') }; });
}

export function search<T>(index: Indexed<T>[], query: string, limit = 200): T[] {
  const tokens = normalize(query).split(' ').filter(Boolean);
  if (!tokens.length) return index.slice(0, limit).map((x) => x.item);
  const scored: { item: T; s: number }[] = [];
  for (const x of index) {
    let s = 0;
    for (const t of tokens) { const ts = tokenScore(t, x.hay, x.words); if (!ts) { s = 0; break; } s += ts; }
    if (s) scored.push({ item: x.item, s: s - x.hay.length / 200 });
  }
  return scored.sort((a, b) => b.s - a.s).slice(0, limit).map((x) => x.item);
}
