import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTeamLatestPosts } from '../../lib/queries';
import PostCard from '../news/PostCard';

interface Props { teamId: string }

const TeamLatestPosts: React.FC<Props> = ({ teamId }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const { data } = useTeamLatestPosts(teamId, 5);
  const posts = data ?? [];
  if (posts.length === 0) return null;

  return (
    <div dir={dir} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black" style={{ color: '#F2EDE6' }}>{t('team.latest_posts')}</h2>
        <Link to={`/news?team=${teamId}`} className="text-sm" style={{ color: '#FF4D00' }}>
          {t('team.all_news')}
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {posts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
};

export default TeamLatestPosts;
