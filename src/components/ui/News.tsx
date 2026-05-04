import React, { useMemo } from 'react';
import { useApprovedPosts } from '../../lib/queries';
import PostCard from '../news/PostCard';

const News: React.FC = () => {
  const postsQ = useApprovedPosts();
  const posts = useMemo(() => postsQ.data ?? [], [postsQ.data]);

  return (
    <section
      id="news"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: 'clamp(80px, 8vw, 120px)',
        paddingBottom: 'clamp(80px, 8vw, 120px)',
        paddingLeft: 'clamp(48px, 6vw, 96px)',
        paddingRight: 'clamp(48px, 6vw, 96px)',
        boxSizing: 'border-box',
      }}
      dir="rtl"
    >
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </section>
  );
};

export default News;
