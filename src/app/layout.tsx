import '@/styles/globals.css';

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Drive',
  description: 'Personal drive',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body>{children}</body>
    </html>
  );
}
