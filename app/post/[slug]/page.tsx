import { fetchPost } from '@/lib/wordpress';
import FullArticle from '@/components/FullArticle';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

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
  return <FullArticle post={post} />;
}
