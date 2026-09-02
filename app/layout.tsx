import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist', subsets: ['latin'] });

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Loom Care — Independence, protected',
  description: 'A discreet fall-detection pendant built for independence, safety, and complete family peace of mind.',
  openGraph: { title: 'Loom Care — Independence, protected', description: 'Zero-tech-burden safety for the people you love.', images: [{ url: '/og.png', width: 1731, height: 909, alt: 'Loom Care pendant' }] },
  twitter: { card: 'summary_large_image', title: 'Loom Care — Independence, protected', description: 'Zero-tech-burden safety for the people you love.', images: ['/og.png'] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
