import { fetchPost, fetchRelatedPosts } from '@/lib/wordpress';
import FullArticle from '@/components/FullArticle';
import RelatedArticles from '@/components/RelatedArticles';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Footer from '@/components/Footer';

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
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
      },
    },
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
  const post = await fetchPost(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await fetchRelatedPosts(post.id, 3);

  // 構造化データの作成
  const JsonLdComponent = dynamic(() => import('@/components/JsonLd'), { ssr: false });

  // 記事の構造化データ
  const datePublished = new Date(post.date).toISOString();
  const dateModified = new Date(post.modified).toISOString();
  const author = post._embedded?.author?.[0]?.name || 'ジョージアニュース編集部';

  // 記事の内容からHTMLタグを削除
  const articleBody = post.content.rendered.replace(/<[^>]*>/g, '').trim();
  
  // 記事の画像を取得（アイキャッチ画像がある場合はそれを使用、なければデフォルト画像）
  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://www.georgia-news-japan.online/og-image.jpg';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': post.title.rendered,
    'description': post.excerpt.rendered.replace(/<[^>]*>/g, '').trim(),
    'image': [
      featuredImage
    ],
    'articleBody': articleBody,
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
        'url': 'https://www.georgia-news-japan.online/favicon/android-chrome-512x512.png',
        'width': 512,
        'height': 512
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
      <Footer />
    </>
  );
}
