import { fetchPost, fetchRelatedPosts } from '@/lib/wordpress';
import FullArticle from '@/components/FullArticle';
import RelatedArticles from '@/components/RelatedArticles';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';

interface PostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await fetchPost(params.slug);

  if (!post) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.'
    };
  }

  // Check if the post has meta title and description
  // タイトルにキーワードを追加して最適化
  const metaTitle = post.meta?.yoast_title || `${post.title.rendered} | 🇬🇪ジョージア（グルジア）ニュース`;
  // 抜粋から HTML タグを削除し、適切な長さに調整
  let cleanExcerpt = post.excerpt.rendered.replace(/<[^>]*>/g, '').trim();
  // 文字数を最適化（検索結果で切れにくい長さに）
  const metaDescription = post.meta?.yoast_description ||
    (cleanExcerpt.length > 120 ? cleanExcerpt.substring(0, 120) + '...' : cleanExcerpt) +
    ' | 🇬🇪ジョージアニュース';

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'article',
      publishedTime: post.date,
      authors: [post._embedded?.author?.[0]?.name || 'Anonymous'],
      images: [
        {
          url: 'https://www.georgia-news-japan.online/og-image.jpg',
          width: 1200,
          height: 630,
          alt: '🇬🇪 ジョージア ニュース',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: ['https://www.georgia-news-japan.online/og-image.jpg'],
    }
  };
}

export default async function PostPage({ params }: PostPageProps) {
  console.log('PostPage component rendering with params:', params);

  // Log the slug we're trying to fetch
  console.log(`Attempting to fetch post with slug: "${params.slug}"`);

  const post = await fetchPost(params.slug);

  if (!post) {
    console.log(`Post not found for slug: "${params.slug}", redirecting to 404 page`);
    notFound();
  }

  console.log(`Successfully fetched post: "${post.title.rendered}"`);

  // Fetch related articles
  const relatedPosts = await fetchRelatedPosts(post.id, 3);
  console.log(`Fetched ${relatedPosts.length} related posts`);

  // 抜粋から HTML タグを削除し、適切な長さに調整
  const cleanExcerpt = post.excerpt.rendered.replace(/<[^>]*>/g, '').trim();

  // 構造化データの作成
  const JsonLdComponent = dynamic(() => import('@/components/JsonLd'), { ssr: false });

  // 記事の公開日と更新日
  const datePublished = new Date(post.date).toISOString();
  // 更新日がない場合は公開日を使用
  const dateModified = new Date(post.date).toISOString();

  // 著者情報
  const author = post._embedded?.author?.[0]?.name || 'ジョージアニュース編集部';

  // 構造化データ
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': post.title.rendered,
    'description': cleanExcerpt,
    'image': 'https://www.georgia-news-japan.online/og-image.jpg',
    'datePublished': datePublished,
    'dateModified': dateModified,
    'author': {
      '@type': 'Person',
      'name': author
    },
    'publisher': {
      '@type': 'Organization',
      'name': '🇬🇪 ジョージア ニュース',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://www.georgia-news-japan.online/favicon.ico'
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://www.georgia-news-japan.online/post/${params.slug}`
    }
  };

  return (
    <>
      <JsonLdComponent data={articleSchema} />
      <FullArticle post={post} />
      <div className="max-w-3xl mx-auto px-4">
        <RelatedArticles posts={relatedPosts} />
        <div className="mt-8 pb-8">
          <Link href="/" className="text-georgian-red hover:underline inline-block">
            ← Back to all articles
          </Link>
        </div>
      </div>
    </>
  );
}
