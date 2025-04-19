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
    <main className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8 bg-white p-6 rounded-lg shadow-sm border-l-4 border-georgian-red">
        <h1 className="text-3xl font-bold text-georgian-red">🇬🇪 ジョージア ニュース</h1>
        <p className="text-sm text-gray-600 mt-2">ジョージアで起きている最新のニュースや社会の動き、政治・経済に関する話題を、日本語でお届けします。</p>
      </header>
      <Suspense fallback={<div className="p-8 text-center text-gray-600 bg-white rounded-lg shadow-sm">記事を読み込み中...</div>}>
        <Posts page={page} />
      </Suspense>
    </main>
  );
}
