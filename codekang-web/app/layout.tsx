import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | CodeKang',
    default: 'CodeKang — AI Code Review & Issue Fixing Platform',
  },
  description:
    'AI-powered code review, advanced automated issue fixing, and smart mentoring platform for developers.',
  keywords: [
    'AI code review',
    'automated bug fixing',
    'developer platform',
    'code analysis',
    'AI programming assistant',
    'software development',
  ],
  authors: [{ name: 'CodeKang Team' }],
  creator: 'CodeKang',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://codekang.com',
    title: 'CodeKang — AI Code Review & Issue Fixing Platform',
    description:
      'AI-powered code review, advanced automated issue fixing, and smart mentoring platform for developers.',
    siteName: 'CodeKang',
    images: [
      {
        url: 'https://codekang.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CodeKang Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeKang — AI Code Review',
    description: 'AI-powered code review and issue fixing platform',
    creator: '@codekang',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/brandlogo/favicon-white.png',
    shortcut: '/brandlogo/favicon-white.png',
    apple: '/brandlogo/favicon-white.png',
  },
};

export const viewport = {
  themeColor: '#121214',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
