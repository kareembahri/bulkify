// Renders the Bulkify mark into every icon size. `npm run icons` (needs sharp, a devDependency).
// The mark: a geometric "B" whose waist is a barbell bar. Original design, no font used.
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const LIME_A = '#E8FF8A', LIME_B = '#B6F23A', INK = '#07090D';

export const glyph = (fill) => `
  <rect x="17" y="13" width="8.5" height="38" rx="2.4" fill="${fill}"/>
  <path d="M22 13h12.1a8.25 8.25 0 0 1 0 16.5H22z" fill="${fill}"/>
  <path d="M22 34.5h13.9a8.25 8.25 0 0 1 0 16.5H22z" fill="${fill}"/>
  <rect x="9" y="30.6" width="46" height="2.8" rx="1.4" fill="${fill}"/>
  <rect x="7" y="27.6" width="3.2" height="8.8" rx="1.2" fill="${fill}"/>
  <rect x="53.8" y="27.6" width="3.2" height="8.8" rx="1.2" fill="${fill}"/>`;

const svg = ({ size = 512, radius = 14, pad = 0, bg = true } = {}) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="g" gradientUnits="userSpaceOnUse" x1="8" y1="10" x2="56" y2="54"><stop offset="0" stop-color="${LIME_A}"/><stop offset="1" stop-color="${LIME_B}"/></linearGradient>
    <radialGradient id="r" cx=".3" cy=".2" r="1"><stop offset="0" stop-color="#1A2230"/><stop offset="1" stop-color="${INK}"/></radialGradient>
  </defs>
  ${bg ? `<rect width="64" height="64" rx="${radius}" fill="url(#r)"/>
  <rect x=".5" y=".5" width="63" height="63" rx="${radius}" fill="none" stroke="${LIME_B}" stroke-opacity=".28"/>` : ''}
  <g transform="translate(${pad} ${pad}) scale(${(64 - pad * 2) / 64})">${glyph('url(#g)')}</g>
</svg>`;

mkdirSync('public/icons', { recursive: true });
const out = [
  ['public/icons/icon-192.png', svg({ size: 192 }), 192],
  ['public/icons/icon-512.png', svg({ size: 512 }), 512],
  ['public/icons/maskable-512.png', svg({ size: 512, radius: 0, pad: 9 }), 512],
  ['public/icons/apple-touch-icon.png', svg({ size: 180, radius: 0, pad: 5 }), 180],
  ['public/icons/favicon-32.png', svg({ size: 32 }), 32],
];
for (const [file, s, size] of out) await sharp(Buffer.from(s)).resize(size, size).png().toFile(file);
writeFileSync('app/icon.svg', svg({ size: 64 }).trim());
console.log('Bulkify icons written');
