import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecentResults, useUpcomingGames, useSeasonsWithAnyGames, pickDefaultSeasonId } from '../../lib/queries';
import { teamName } from '../../lib/displayName';

const fmtShort = (iso: string | null) => {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
};

/**
 * Broadcast-style strip under the main nav, pulled live from the DB for the
 * default (active) season: the latest played round's scores — or, before the
 * season's first tip-off, the next round's fixtures with date + time.
 * Renders nothing while loading or when the season has no games at all.
 */
const ScoreTicker: React.FC = () => {
  const { t, i18n } = useTranslation();
  const direction: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';

  const { data: seasons = [] } = useSeasonsWithAnyGames();
  const seasonId = pickDefaultSeasonId(seasons);
  const { data: results = [] } = useRecentResults(seasonId);
  const { data: upcoming = [] } = useUpcomingGames(seasonId);

  // Results arrive date-desc (first row = latest round), upcoming date-asc
  // (first row = next round) — either way the first row's round is the one.
  const played = results.length > 0;
  const source = played ? results : upcoming;
  const firstRound = source[0]?.round ?? null;
  const roundGames = firstRound ? source.filter((g) => g.round === firstRound) : source.slice(0, 8);
  if (roundGames.length === 0) return null;

  // Duplicate for a seamless marquee loop
  const items = [...roundGames, ...roundGames];

  return (
    <div
      className="w-full overflow-hidden"
      style={{ background: '#FF4D00', height: '36px', direction }}
      aria-label={played ? t('results.tab_results') : t('results.tab_upcoming')}
    >
      <div
        className="flex items-center gap-0 h-full score-ticker-track"
        style={{ whiteSpace: 'nowrap', width: 'max-content' }}
      >
        {items.map((game, i) => {
          const homeWon = played && (game.home_score ?? 0) > (game.away_score ?? 0);
          const awayWon = played && !homeWon;
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
                {played
                  ? `${game.home_score}–${game.away_score}`
                  : [fmtShort(game.date), (game.time || '').slice(0, 5)].filter(Boolean).join(' · ')}
              </span>
              <span style={{ fontWeight: awayWon ? 800 : 400 }}>{game.away_team ? teamName(game.away_team) : ''}</span>
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
