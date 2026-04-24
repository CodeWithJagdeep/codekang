import { Metadata } from 'next';
import ClientPage from './client-page';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Repository — CodeKang',
    description: 'Review pull requests, issues, and AI insights for this repository on CodeKang.',
  };
}

export default async function RepositoryPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  return <ClientPage params={{ repoId }} />;
}
