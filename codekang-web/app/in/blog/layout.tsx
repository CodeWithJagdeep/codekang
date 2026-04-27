import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog & Technical Journal',
  description: 'Deep dives into AI code review, autonomous engineering, and the future of software development from the CodeKang team.',
  openGraph: {
    title: 'CodeKang Journal — Engineering the Future',
    description: 'Inside the engine: Technical insights, research, and stories from the CodeKang engineering team.',
    url: 'https://codekang.com/in/blog',
    type: 'website',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
