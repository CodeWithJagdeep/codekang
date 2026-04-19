import { Metadata } from 'next';
import ClientPage from './client-page';

export async function generateMetadata({
  params,
}: {
  params: { repoId: string };
}): Promise<Metadata> {
  const repoId = params.repoId;
  return {
    title: `${repoId} — CodeKang`,
    description: `Review pull requests, issues, and AI insights for the repository ${repoId} on CodeKang.`,
  };
}

export default function RepositoryPage({
  params,
}: {
  params: { repoId: string };
}) {
  return <ClientPage params={params} />;
}
