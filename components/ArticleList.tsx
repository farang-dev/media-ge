import { Post } from '@/lib/wordpress';
import ArticleItem from './ArticleItem';
import Pagination from './Pagination';

interface ArticleListProps {
  posts: Post[];
  currentPage: number;
  totalPages: number;
}

export default function ArticleList({ posts, currentPage, totalPages }: ArticleListProps) {
  return (
    <>
      <div className="space-y-2 bg-white rounded-lg shadow-sm p-4">
        {posts.map((post, index) => (
          <ArticleItem
            key={post.id}
            post={post}
            index={((currentPage - 1) * 20) + index + 1}
          />
        ))}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </>
  );
}
