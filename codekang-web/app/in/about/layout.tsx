import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About CodeKang — Our Journey to Autonomy',
  description: 'Learn about the mission, vision, and team behind CodeKang. We are building the future of autonomous software engineering.',
  openGraph: {
    title: 'About CodeKang — Engineering a New Partner',
    description: 'The story of how we built an AI that understands code better than humans.',
    url: 'https://codekang.com/in/about',
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
