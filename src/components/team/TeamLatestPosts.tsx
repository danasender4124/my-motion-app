import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTeamLatestPosts } from '../../lib/queries';
import PostCard from '../news/PostCard';
import SectionTitle from '../ui/SectionTitle';

interface Props {
  teamId: string;
  /** Sidebar-strip mode: one column of stacked cards. */
  compact?: boolean;
}

const TeamLatestPosts: React.FC<Props> = ({ teamId, compact }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const { data } = useTeamLatestPosts(teamId, compact ? 4 : 5);
  const posts = data ?? [];
  if (posts.length === 0) return null;

  return (
    <div dir={dir}>
      <div className="flex items-center justify-between">
        <SectionTitle small={compact}>{t('team.latest_posts')}</SectionTitle>
        <Link to={`/news?team=${teamId}`} className="text-sm mb-5" style={{ color: '#FF4D00' }}>
          {t('team.all_news')}
        </Link>
      </div>
      <div className={compact ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'}>
        {posts.map((p) => <PostCard key={p.id} post={p} compact={compact} />)}
      </div>
    </div>
  );
};

export default TeamLatestPosts;
