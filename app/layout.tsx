import type { Metadata, Viewport } from 'next';
import { themeBootScript } from '@/lib/theme';
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-500.css';
import '@fontsource/barlow/latin-600.css';
import '@fontsource/barlow/latin-700.css';
import '@fontsource/barlow-condensed/latin-600.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/barlow-condensed/latin-800.css';
import './globals.css';
import './stars.css';

export const metadata: Metadata = {
  title: 'RB — Tu entrenamiento, en progreso',
  description: 'Registra tus entrenamientos, mide tu progreso y entrena con intención.',
  applicationName: 'RB Fitness',
  appleWebApp: { capable: true, title: 'RB Fitness', statusBarStyle: 'black-translucent' },
  icons: { icon: '/rb-icon-192.png', apple: '/rb-icon-192.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: light)', color: '#e8e8e8' },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // data-theme is set by the inline script before paint; suppressHydrationWarning keeps React quiet about it.
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script id="rb-theme-boot" dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
