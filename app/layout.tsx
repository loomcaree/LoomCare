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
  title: 'Loom Care — Independence, connected',
  description: 'A calm safety pendant that protects independence and keeps the people you love close.',
  openGraph: { title: 'Loom Care — Independence, connected', description: 'A calmer way to stay close.', images: [{ url: '/og.png', width: 1731, height: 909, alt: 'Loom Care pendant' }] },
  twitter: { card: 'summary_large_image', title: 'Loom Care — Independence, connected', description: 'A calmer way to stay close.', images: ['/og.png'] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
