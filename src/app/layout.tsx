import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Bicho Battler',
  description: 'Criá tu bicho, hacelo evolucionar y peleá. Remagotchi × Digimon, a la argentina.',
  manifest: '/manifest.webmanifest',
};

export const viewport = {
  themeColor: '#1b2233',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
