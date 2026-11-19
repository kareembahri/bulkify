import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Bulkify',
    short_name: 'Bulkify',
    description: 'Gym and nutrition tracking: English and Arabic.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#06080b',
    theme_color: '#06080b',
    categories: ['health', 'fitness', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Start workout', url: '/workout', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Add meal', url: '/food?add=1', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
}
