import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tipjen Admin',
  description: 'Admin panel Tipjen',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
