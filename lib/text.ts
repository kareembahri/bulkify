/** Character count that matches Postgres char_length (code points, so Arabic counts correctly). */
export const charLen = (s: string) => Array.from(s).length;
export const clampChars = (s: string, max: number) => (charLen(s) > max ? Array.from(s).slice(0, max).join('') : s);
