import { Post } from '@/lib/wordpress';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface FullArticleProps {
  post: Post;
}

export default function FullArticle({ post }: FullArticleProps) {
  const timeAgo = formatDistanceToNow(new Date(post.date), { addSuffix: true });
  const author = post._embedded?.author?.[0]?.name || 'Anonymous';

  // Process the content to ensure proper formatting
  let processedContent = post.content.rendered;

  // Remove any remaining related articles section
  processedContent = processedContent.replace(/<p>(?:Read More|Related Articles):[\s\S]*?$/i, '');

  // Remove any remaining about the author section
  processedContent = processedContent.replace(/<p>(?:About the Author)[\s\S]*?$/i, '');

  // Remove any remaining asterisk formatting
  processedContent = processedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  processedContent = processedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="text-georgian-red hover:underline mb-4 inline-block">
        ← Back to all articles
      </Link>

      <h1
        className="text-3xl font-bold mb-4 text-gray-900"
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      />

      <div className="text-sm text-gray-500 mb-8">
        Posted {timeAgo} by {author}
      </div>

      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </article>
  );
}
