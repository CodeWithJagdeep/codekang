import type { Metadata } from 'next';
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google';
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

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://codekang.com'),
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
    'autonomous engineering',
    'code mentoring',
  ],
  authors: [{ name: 'CodeKang Team' }],
  creator: 'CodeKang',
  publisher: 'CodeKang',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CodeKang — The Future of Code Review',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeKang — AI Code Review & Issue Fixing',
    description: 'Autonomous AI agents that review your code and fix bugs automatically.',
    creator: '@codekang',
    images: ['/og-image.jpg'],
  },
  robots:
    process.env.NEXT_PUBLIC_APP_ENV === 'staging'
      ? { index: false, follow: false }
      : {
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
    icon: '/favicon/favicon.ico',
    shortcut: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '96x96',
        url: '/favicon/favicon-96x96.png',
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        url: '/favicon/favicon.svg',
      },
    ],
  },
  manifest: '/favicon/site.webmanifest',
};

export const viewport = {
  themeColor: '#fcfcfc',
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
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
