import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RowaKit Next.js Consumer — Smoke Test',
  description: 'Validate RowaKit compatibility with Next.js App Router',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
