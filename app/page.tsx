import { fetchPosts } from '@/lib/wordpress';
import ArticleList from '@/components/ArticleList';
import { Suspense } from 'react';

interface PostsProps {
  page: number;
}

async function Posts({ page }: PostsProps) {
  const { posts, totalPages } = await fetchPosts(page);

  return <ArticleList posts={posts} currentPage={page} totalPages={totalPages} />;
}

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Get the current page from the URL query parameters
  const pageParam = searchParams.page;
  const currentPage = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1;
  const page = isNaN(currentPage) || currentPage < 1 ? 1 : currentPage;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-orange-500">Unmanned Newsroom</h1>
        <p className="text-sm text-gray-600">Latest tech and AI news, automatically curated</p>
      </header>
      <Suspense fallback={<div className="text-gray-600">Loading posts...</div>}>
        <Posts page={page} />
      </Suspense>
    </main>
  );
}
