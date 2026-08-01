import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecentResults, useSeasonsWithAnyGames, pickDefaultSeasonId } from '../../lib/queries';
import { teamName } from '../../lib/displayName';

/**
 * Broadcast-style score strip under the main nav — the latest played round,
 * pulled live from the DB (season = newest with played games). Renders
 * nothing while loading or when there are no results yet.
 */
const ScoreTicker: React.FC = () => {
  const { t, i18n } = useTranslation();
  const direction: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';

  const { data: seasons = [] } = useSeasonsWithAnyGames();
  const seasonId = pickDefaultSeasonId(seasons);
  const { data: games = [] } = useRecentResults(seasonId);

  // Latest round only (games arrive date-desc; the first row's round is the
  // most recent one).
  const latestRound = games[0]?.round ?? null;
  const roundGames = latestRound ? games.filter((g) => g.round === latestRound) : games.slice(0, 8);
  if (roundGames.length === 0) return null;

  // Duplicate for a seamless marquee loop
  const items = [...roundGames, ...roundGames];

  return (
    <div
      className="w-full overflow-hidden"
      style={{ background: '#FF4D00', height: '36px', direction }}
      aria-label={t('results.tab_results')}
    >
      <div
        className="flex items-center gap-0 h-full score-ticker-track"
        style={{ whiteSpace: 'nowrap', width: 'max-content' }}
      >
        {items.map((game, i) => {
          const homeWon = (game.home_score ?? 0) > (game.away_score ?? 0);
          return (
            <Link
              to={`/match/${game.id}`}
              key={`${game.id}-${i}`}
              className="flex items-center gap-3 px-6 border-r transition-colors hover:bg-black/15"
              style={{
                borderColor: 'rgba(255,255,255,0.25)',
                height: '36px',
                fontSize: '13px',
                color: '#fff',
                fontWeight: 500,
              }}
            >
              <span style={{ fontWeight: homeWon ? 800 : 400 }}>{game.home_team ? teamName(game.home_team) : ''}</span>
              <span
                className="px-2 py-0.5 rounded text-xs font-black tabular-nums"
                style={{ background: 'rgba(0,0,0,0.2)', letterSpacing: '0.05em' }}
              >
                {game.home_score}–{game.away_score}
              </span>
              <span style={{ fontWeight: !homeWon ? 800 : 400 }}>{game.away_team ? teamName(game.away_team) : ''}</span>
              {game.round && (
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px' }}>
                  {game.round}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <style>{`
        .score-ticker-track { animation: ticker 40s linear infinite; }
        .score-ticker-track:hover { animation-play-state: paused; }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default ScoreTicker;
