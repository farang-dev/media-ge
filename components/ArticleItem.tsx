import { Post } from '@/lib/wordpress';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface ArticleItemProps {
  post: Post;
  index: number;
}

export default function ArticleItem({ post, index }: ArticleItemProps) {
  const timeAgo = formatDistanceToNow(new Date(post.date), { addSuffix: true });
  const author = post._embedded?.author?.[0]?.name || 'Anonymous';

  return (
    <article className="flex gap-2 py-4 border-b border-gray-100">
      <span className="text-gray-500 w-6 text-right flex-shrink-0">{index}.</span>
      <div className="flex-grow">
        <Link
          href={`/post/${post.slug}`}
          className="text-gray-900 hover:underline font-medium block mb-1"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        {/* Debug info */}
        <div className="text-xs text-gray-400">
          Slug: {post.slug}
        </div>
        <div
          className="text-sm text-gray-600 mb-2"
          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
        />
        <div className="text-xs text-gray-500">
          {timeAgo} by {author}
        </div>
      </div>
    </article>
  );
}
