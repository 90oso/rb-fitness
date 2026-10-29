import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RB — Tu entrenamiento, en progreso',
  description: 'Registra tus entrenamientos, mide tu progreso y entrena con intención.',
  applicationName: 'RB Fitness',
  appleWebApp: { capable: true, title: 'RB Fitness', statusBarStyle: 'black-translucent' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0B0F17' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
