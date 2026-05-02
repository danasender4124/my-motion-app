import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePlayer, usePlayerStats, calcAverages } from '../lib/queries';
import PlayerHeader from '../components/player/PlayerHeader';
import SeasonAveragesCard from '../components/player/SeasonAveragesCard';
import PlayerGameLog from '../components/player/PlayerGameLog';

const PlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const playerQ = usePlayer(id);
  const statsQ = usePlayerStats(id);

  if (playerQ.isLoading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center" style={{ background: '#07080C' }}>
        <span style={{ color: 'rgba(242,237,230,0.5)' }}>טוען...</span>
      </div>
    );
  }
  if (playerQ.error || !playerQ.data) {
    return (
      <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#07080C' }}>
        <span style={{ color: '#F2EDE6' }}>השחקנית לא נמצאה</span>
        <Link to="/results" style={{ color: '#FF4D00' }}>חזרה</Link>
      </div>
    );
  }

  const player = playerQ.data;
  const stats = statsQ.data ?? [];
  const averages = calcAverages(stats);

  return (
    <div dir="rtl" className="min-h-screen py-12 px-4 md:px-8" style={{ background: '#07080C' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <PlayerHeader player={player} />
        <SeasonAveragesCard averages={averages} />
        <PlayerGameLog rows={stats} playerTeamId={player.current_team?.id ?? null} />
      </div>
    </div>
  );
};

export default PlayerPage;
