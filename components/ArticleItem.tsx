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

  // Function to strip HTML tags and truncate text
  const truncateExcerpt = (html: string, maxLength: number = 100): string => {
    // Remove HTML tags
    const text = html.replace(/<[^>]*>/g, '');
    // Truncate to maxLength
    if (text.length <= maxLength) return text;
    // Try to find a sentence break
    const firstSentence = text.split('.')[0];
    if (firstSentence && firstSentence.length <= maxLength) {
      return firstSentence + '.';
    }
    // Otherwise truncate at word boundary
    return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  };

  // Create a consistent excerpt
  const excerpt = truncateExcerpt(post.excerpt.rendered);

  return (
    <article className="flex gap-2 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <span className="text-gray-500 w-6 text-right flex-shrink-0">{index}.</span>
      <div className="flex-grow">
        <Link
          href={`/post/${post.slug}`}
          className="text-gray-900 hover:text-georgian-red hover:underline font-medium block mb-2"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <div
          className="text-sm text-gray-600 mb-2 line-clamp-2 h-10 overflow-hidden"
        >
          {excerpt}
        </div>
        <div className="text-xs text-gray-500">
          {timeAgo} by {author}
        </div>
      </div>
    </article>
  );
}
