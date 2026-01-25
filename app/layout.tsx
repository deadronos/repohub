import type { Metadata } from 'next';
import './globals.css';
import ParticleBackgroundLazy from '@/components/ParticleBackgroundLazy';
import { Analytics } from '@vercel/analytics/next';

// Note: Google Fonts via `next/font/google` are not used in production builds here
// because Turbopack may attempt an HTTP/2 fetch that fails in some environments.
// We provide CSS fallbacks in `globals.css` instead.


export const metadata: Metadata = {
  title: 'Project Hub | Digital Portfolio',
  description: 'A curated collection of web experiments, games, and repositories.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ParticleBackgroundLazy />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
