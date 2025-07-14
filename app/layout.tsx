import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coração da Jornada',
  description: 'Sistema de gestão para o seu centro de formação',
  icons: {
    icon: '/logo-jornada.png',
    apple: '/logo-jornada.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body className="font-sans">{children}</body>
    </html>
  );
}
