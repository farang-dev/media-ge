import { fetchPosts } from '@/lib/wordpress';
import ArticleList from '@/components/ArticleList';
import { Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

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

  // 構造化データの作成
  const JsonLdComponent = dynamic(() => import('@/components/JsonLd'), { ssr: false });

  // ウェブサイトの構造化データ
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': '🇬🇪 ジョージア ニュース',
    'description': '🇬🇪 ジョージア（旧グルジア）の最新ニュース・政治・経済・社会情報を日本語で毎日お届け。信頼性の高いジョージアメディアから厳選した記事を日本語に翻訳してお届けする唯一の日本語ニュースサイト。',
    'url': 'https://www.georgia-news-japan.online/',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': 'https://www.georgia-news-japan.online/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <JsonLdComponent data={websiteSchema} />
      <header className="mb-8 bg-white p-6 rounded-lg shadow-sm border-l-4 border-georgian-red">
        <Link href="/">
          <h1 className="text-3xl font-bold text-georgian-red hover:underline cursor-pointer">🇬🇪 ジョージア ニュース</h1>
        </Link>
        <p className="text-sm text-gray-600 mt-2">ジョージアで起きている最新のニュースや社会の動き、政治・経済に関する話題を、日本語でお届けします。</p>
      </header>
      <Suspense fallback={<div className="p-8 text-center text-gray-600 bg-white rounded-lg shadow-sm">記事を読み込み中...</div>}>
        <Posts page={page} />
      </Suspense>
    </main>
  );
}
