import { Post } from '@/lib/wordpress';
import Link from 'next/link';

interface RelatedArticlesProps {
  posts: Post[];
}

export default function RelatedArticles({ posts }: RelatedArticlesProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 pt-6 border-t border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Related Articles</h2>
      <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded shadow-sm hover:shadow-md transition-shadow">
            <Link
              href={`/post/${post.slug}`}
              className="block"
            >
              <h3
                className="font-medium text-gray-900 mb-2 hover:text-red-600 transition-colors"
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />
              <div
                className="text-sm text-gray-600 line-clamp-2"
                dangerouslySetInnerHTML={{
                  __html: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
                }}
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
