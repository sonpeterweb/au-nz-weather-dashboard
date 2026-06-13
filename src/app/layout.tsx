import { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import * as React from 'react';

import '@/styles/globals.css';

import { ThemeScript } from '@/components/ThemeScript';

import { siteConfig } from '@/constant/config';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon/favicon.ico',
    shortcut: '/favicon/favicon-16x16.png',
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: '/favicon/site.webmanifest',
  openGraph: {
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.title,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/images/og.jpg',
        width: 1200,
        height: 630,
        alt: `${siteConfig.title} — AU/NZ weather monitoring dashboard`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: ['/images/og.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang='en'
      data-theme='light'
      className={plusJakartaSans.variable}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className='font-primary antialiased'>{children}</body>
    </html>
  );
}
