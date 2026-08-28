import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Into the Infinite — Salon Format',
  description: 'An interactive concept prototype about repetition, scale and perception.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
