import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApprovedPosts } from '../../lib/queries';
import PostCard from '../news/PostCard';
import { SkeletonCardGrid } from './Skeleton';

const News: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const postsQ = useApprovedPosts();
  const posts = useMemo(() => postsQ.data ?? [], [postsQ.data]);

  return (
    <section
      id="news"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: 'clamp(48px, 6vw, 96px)',
        paddingBottom: 'clamp(48px, 6vw, 96px)',
        paddingLeft: 'clamp(48px, 6vw, 96px)',
        paddingRight: 'clamp(48px, 6vw, 96px)',
        boxSizing: 'border-box',
      }}
      dir={dir}
    >
      {postsQ.isLoading && <SkeletonCardGrid cards={6} cardHeight={280} />}
      {postsQ.error && (
        <div className="text-center py-12" style={{ color: '#f87171' }}>{t('news.error')}</div>
      )}
      {posts.length === 0 && !postsQ.isLoading && (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>{t('news.no_posts')}</div>
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
