import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const slug = (await params).slug;
  const title = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${title} | CodeKang Blog`,
    description: `Read about ${title} and other technical insights on the CodeKang engineering blog.`,
    openGraph: {
      title: `${title} — CodeKang Engineering`,
      description: `Technical deep dive into ${title}.`,
      url: `https://codekang.com/in/blog/${slug}`,
      type: 'article',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — CodeKang Journal`,
      description: `Technical deep dive into ${title}.`,
      images: ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200'],
    },
  };
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
