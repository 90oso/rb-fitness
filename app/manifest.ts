import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RB Fitness — Entrena con intención',
    short_name: 'RB',
    description: 'Tu entrenador de progreso personal',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0F17',
    theme_color: '#0B0F17',
    icons: [
      { src: '/rb-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/rb-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }
    ]
  };
}
