import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { GameWithTeams } from '../../lib/queries';
import { teamName } from '../../lib/displayName';

const formatDate = (iso: string | null): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const TeamBlock: React.FC<{ team: GameWithTeams['home_team']; align: 'right' | 'left' }> = ({ team, align }) => {
  const inner = (
    <>
      {/* White circular chip — crops the square backgrounds baked into logo
          files, matching the header-strip treatment */}
      <div
        className="w-20 h-20 rounded-full shrink-0 flex items-center justify-center overflow-hidden"
        style={{
          background: '#fff',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 4px 18px rgba(3,6,18,0.45)',
          padding: 5,
          boxSizing: 'border-box',
        }}
      >
        {team?.logo
          ? <img src={team.logo} alt={team.name} className="w-full h-full object-contain" style={{ borderRadius: '50%' }} />
          : <span className="text-xs" style={{ color: 'rgba(120,120,120,0.7)' }}>—</span>}
      </div>
      <div
        className="text-base font-bold text-center truncate w-full"
        style={{ color: '#F2EDE6', textAlign: align }}
      >
        {teamName(team)}
      </div>
    </>
  );
  if (team?.id) {
    return (
      <Link to={`/team/${team.id}`} className="flex flex-col items-center gap-3 flex-1 min-w-0">
        {inner}
      </Link>
    );
  }
  return <div className="flex flex-col items-center gap-3 flex-1 min-w-0">{inner}</div>;
};

interface Props { game: GameWithTeams; live?: boolean }

const MatchHeader: React.FC<Props> = ({ game, live }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const homeWon = game.home_score != null && game.away_score != null && game.home_score > game.away_score;
  const awayWon = game.home_score != null && game.away_score != null && game.away_score > game.home_score;
  const meta = [
    game.round, formatDate(game.date), game.time?.slice(0, 5), game.hall,
  ].filter(Boolean).join(' · ');

  return (
    <div dir={dir} className="space-y-4">
      <Link
        to="/results"
        className="text-sm flex items-center gap-1"
        style={{ color: 'rgba(242,237,230,0.5)' }}
      >
        {t('match.back')}
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
              <span style={{ color: 'rgba(242,237,230,0.4)' }}>-</span>
              <span style={{ color: awayWon ? '#FF4D00' : '#F2EDE6' }}>{game.away_score}</span>
            </div>
          ) : live ? (
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2"
              style={{ background: 'rgba(220,38,38,0.18)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)' }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ef4444' }} />
              {t('match.live_chip')}
            </span>
          ) : (
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00' }}
            >
              {game.status === 'scheduled' ? t('match.scheduled') : t('match.cancelled')}
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
