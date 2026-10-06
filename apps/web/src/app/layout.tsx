import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Backstage — Producción de eventos',
    template: '%s | Backstage',
  },
  description:
    'Tu espacio para organizar conciertos, coordinar la producción y preparar cada evento.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
