import React, { useMemo } from 'react';
import { useApprovedPosts } from '../../lib/queries';
import PostCard from '../news/PostCard';

const News: React.FC = () => {
  const postsQ = useApprovedPosts();
  const posts = useMemo(() => postsQ.data ?? [], [postsQ.data]);

  return (
    <section id="news" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">
      {postsQ.isLoading && (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>טוען...</div>
      )}
      {postsQ.error && (
        <div className="text-center py-12" style={{ color: '#f87171' }}>לא ניתן לטעון חדשות כעת.</div>
      )}
      {posts.length === 0 && !postsQ.isLoading && (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>אין פרסומים עדיין</div>
      )}

      {posts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </section>
  );
};

export default News;