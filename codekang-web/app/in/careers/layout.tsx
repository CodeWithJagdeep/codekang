import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers — Join the CodeKang Team',
  description: 'Help us build the worlds first autonomous software engineer. Explore open roles in AI, engineering, and product.',
  openGraph: {
    title: 'Careers at CodeKang — Build the Future',
    description: 'We are looking for ambitious engineers to help us redefine software development.',
    url: 'https://codekang.com/in/careers',
    type: 'website',
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
