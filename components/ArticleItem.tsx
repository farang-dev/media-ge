import { Post } from '@/lib/wordpress';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { memo } from 'react';

interface ArticleItemProps {
  post: Post;
  index: number;
}

// パフォーマンス最適化のためにmemoを使用
const ArticleItem = memo(function ArticleItem({ post, index }: ArticleItemProps) {
  const timeAgo = formatDistanceToNow(new Date(post.date), { addSuffix: true });
  const author = post._embedded?.author?.[0]?.name || 'Anonymous';

  // Function to strip HTML tags, decode HTML entities, and truncate text
  const truncateExcerpt = (html: string, maxLength: number = 180): string => {
    // Remove HTML tags
    let text = html.replace(/<[^>]*>/g, '');

    // Decode common HTML entities
    text = text.replace(/&nbsp;/g, ' ')
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'")
               .replace(/&#8230;/g, '...')
               .replace(/&hellip;/g, '...')
               .replace(/&#8211;/g, '–')
               .replace(/&ndash;/g, '–')
               .replace(/&#8212;/g, '—')
               .replace(/&mdash;/g, '—');

    // Decode all numeric HTML entities (like &#8230;)
    text = text.replace(/&#(\d+);/g, (_, dec) => {
      return String.fromCharCode(dec);
    });

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

  // 記事の公開日
  const publishDate = new Date(post.date).toISOString();

  return (
    <article className="flex gap-2 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors" itemScope itemType="https://schema.org/NewsArticle">
      <span className="text-gray-500 w-6 text-right flex-shrink-0">{index}.</span>
      <div className="flex-grow">
        <Link
          href={`/post/${post.slug}`}
          className="text-gray-900 hover:text-georgian-red hover:underline font-medium block mb-2"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          itemProp="headline"
        />
        <div
          className="text-sm text-gray-600 mb-1 line-clamp-3 h-auto max-h-16 overflow-hidden"
          itemProp="description"
        >
          {excerpt}
        </div>
        {post.source && (
          <div className="text-xs text-gray-500 mb-0.5">
            メディアソース: <span itemProp="publisher">{post.source}</span>
          </div>
        )}
        <div className="text-xs text-gray-500">
          <time itemProp="datePublished" dateTime={publishDate}>{timeAgo}</time> by <span itemProp="author">{author}</span>
          <meta itemProp="mainEntityOfPage" content={`https://www.georgia-news-japan.online/post/${post.slug}`} />
        </div>
      </div>
    </article>
  );
});

export default ArticleItem;
