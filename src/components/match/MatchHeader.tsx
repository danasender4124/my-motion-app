import React from 'react';
import { Link } from 'react-router-dom';
import type { GameWithTeams } from '../../lib/queries';

const formatDate = (iso: string | null): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const TeamBlock: React.FC<{ team: GameWithTeams['home_team']; align: 'right' | 'left' }> = ({ team, align }) => (
  <div className={`flex flex-col items-center gap-3 flex-1 min-w-0`}>
    <div
      className="w-20 h-20 rounded shrink-0 flex items-center justify-center overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {team?.logo
        ? <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
        : <span className="text-xs" style={{ color: 'rgba(242,237,230,0.4)' }}>—</span>}
    </div>
    <div
      className="text-base font-bold text-center truncate w-full"
      style={{ color: '#F2EDE6', textAlign: align }}
    >
      {team?.name ?? '—'}
    </div>
  </div>
);

interface Props { game: GameWithTeams }

const MatchHeader: React.FC<Props> = ({ game }) => {
  const homeWon = game.home_score != null && game.away_score != null && game.home_score > game.away_score;
  const awayWon = game.home_score != null && game.away_score != null && game.away_score > game.home_score;
  const meta = [
    game.round, formatDate(game.date), game.time?.slice(0, 5), game.hall,
  ].filter(Boolean).join(' · ');

  return (
    <div dir="rtl" className="space-y-4">
      <Link
        to="/results"
        className="text-sm flex items-center gap-1"
        style={{ color: 'rgba(242,237,230,0.5)' }}
      >
        ← חזרה למשחקים
      </Link>
      <div
        className="rounded-2xl p-8 flex items-center gap-6"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <TeamBlock team={game.home_team} align="right" />
        <div className="flex flex-col items-center gap-2 shrink-0">
          {game.status === 'played' && game.home_score != null && game.away_score != null ? (
            <div className="text-5xl font-black tabular-nums flex items-center gap-3">
              <span style={{ color: homeWon ? '#FF4D00' : '#F2EDE6' }}>{game.home_score}</span>
              <span style={{ color: 'rgba(242,237,230,0.3)' }}>-</span>
              <span style={{ color: awayWon ? '#FF4D00' : '#F2EDE6' }}>{game.away_score}</span>
            </div>
          ) : (
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00' }}
            >
              {game.status === 'scheduled' ? 'מתוכנן' : 'לא שוחק'}
            </span>
          )}
          {meta && (
            <div className="text-xs text-center" style={{ color: 'rgba(242,237,230,0.5)' }}>{meta}</div>
          )}
        </div>
        <TeamBlock team={game.away_team} align="left" />
      </div>
    </div>
  );
};

export default MatchHeader;
