import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brand Kit — Press & Assets',
  description: 'Download CodeKang logos, brand guidelines, and assets for press and media usage.',
  openGraph: {
    title: 'CodeKang Brand Kit',
    description: 'Official assets and brand guidelines for CodeKang.',
    url: 'https://codekang.com/in/brand-kit',
    type: 'website',
  },
};

export default function BrandKitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
