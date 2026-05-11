import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGameVideos } from '../../lib/queries';
import VideoGrid from '../vod/VideoGrid';

interface Props { gameId: string }

const MatchVideos: React.FC<Props> = ({ gameId }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const { data } = useGameVideos(gameId);
  if (!data || data.length === 0) return null;

  return (
    <section className="space-y-4" dir={dir}>
      <h2 className="text-xl font-black" style={{ color: '#F2EDE6' }}>{t('match.videos_title')}</h2>
      <VideoGrid videos={data} />
    </section>
  );
};

export default MatchVideos;
