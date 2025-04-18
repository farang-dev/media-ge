import { fetchPost, fetchRelatedPosts } from '@/lib/wordpress';
import FullArticle from '@/components/FullArticle';
import RelatedArticles from '@/components/RelatedArticles';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';

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
  const metaTitle = post.meta?.yoast_title || post.title.rendered;
  const metaDescription = post.meta?.yoast_description || post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 155) + '...';

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: 'article',
      publishedTime: post.date,
      authors: [post._embedded?.author?.[0]?.name || 'Anonymous']
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription
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

  return (
    <>
      <FullArticle post={post} />
      <div className="max-w-3xl mx-auto px-4">
        <RelatedArticles posts={relatedPosts} />
        <div className="mt-8 pb-8">
          <Link href="/" className="text-red-600 hover:underline inline-block">
            ← Back to all articles
          </Link>
        </div>
      </div>
    </>
  );
}
