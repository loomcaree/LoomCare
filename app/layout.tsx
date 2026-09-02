import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/use-auth';

const geistSans = Geist({ variable: '--font-geist', subsets: ['latin'] });

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Loom Care — Let them live freely',
  description: 'A simple pendant that notices falls, remembers medicines, and brings family closer—quietly.',
  openGraph: { title: 'Loom Care — Let them live freely', description: 'Care that stays quietly close.', images: [{ url: '/og.png', width: 1731, height: 909, alt: 'Loom Care' }] },
  twitter: { card: 'summary_large_image', title: 'Loom Care — Let them live freely', description: 'Care that stays quietly close.', images: ['/og.png'] },
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
