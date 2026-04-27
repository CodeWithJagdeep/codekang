import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security & Trust — Your Code is Safe with CodeKang',
  description: 'Learn about CodeKangs security protocols, data isolation, and compliance standards.',
  openGraph: {
    title: 'Security at CodeKang — Zero-Trust Engineering',
    description: 'We treat your code with the highest security standards. Learn more about our protection layers.',
    url: 'https://codekang.com/in/security',
    type: 'website',
  },
};

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
