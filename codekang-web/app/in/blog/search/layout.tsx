import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Results',
  description: 'Search for articles, technical deep dives, and research on the CodeWithJagdeep blog.',
  robots: {
    index: false,
    follow: true,
  }
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
