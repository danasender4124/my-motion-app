import React from 'react';
import { useGameVideos } from '../../lib/queries';
import VideoGrid from '../vod/VideoGrid';

interface Props { gameId: string }

const MatchVideos: React.FC<Props> = ({ gameId }) => {
  const { data } = useGameVideos(gameId);
  if (!data || data.length === 0) return null;

  return (
    <section className="space-y-4" dir="rtl">
      <h2 className="text-xl font-black" style={{ color: '#F2EDE6' }}>סרטונים מהמשחק</h2>
      <VideoGrid videos={data} />
    </section>
  );
};

export default MatchVideos;
