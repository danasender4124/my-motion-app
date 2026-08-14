import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMatch, useMatchStats, useTeamJerseys } from '../lib/queries';
import { teamName } from '../lib/displayName';
import MatchHeader from '../components/match/MatchHeader';
import QuarterScoresTable from '../components/match/QuarterScoresTable';
import BoxScoreTable from '../components/match/BoxScoreTable';
import MatchVideos from '../components/match/MatchVideos';
import MatchMedia from '../components/match/MatchMedia';
import MatchLineups from '../components/match/MatchLineups';

// From tip-off until this long after it, a game with no final result yet is
// treated as live (results are typed in only after the final buzzer).
const LIVE_WINDOW_MS = 2.5 * 60 * 60 * 1000;

const isLiveNow = (game: { status: string; date: string | null; time: string | null }): boolean => {
  if (game.status !== 'scheduled' || !game.date || !game.time) return false;
  const start = new Date(`${game.date}T${game.time.slice(0, 5)}:00`).getTime();
  const now = Date.now();
  return now >= start && now - start <= LIVE_WINDOW_MS;
};

const MatchPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const { id } = useParams<{ id: string }>();
  const matchQ = useMatch(id);
  const statsQ = useMatchStats(id);
  const homeJerseysQ = useTeamJerseys(matchQ.data?.season_id, matchQ.data?.home_team_id);
  const awayJerseysQ = useTeamJerseys(matchQ.data?.season_id, matchQ.data?.away_team_id);

  if (matchQ.isLoading) {
    return (
      <div dir={dir} className="min-h-screen flex items-center justify-center" style={{ background: '#07080C' }}>
        <span style={{ color: 'rgba(242,237,230,0.5)' }}>{t('common.loading')}</span>
      </div>
    );
  }
  if (matchQ.error || !matchQ.data) {
    return (
      <div dir={dir} className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#07080C' }}>
        <span style={{ color: '#F2EDE6' }}>{t('match.not_found')}</span>
        <Link to="/results" style={{ color: '#FF4D00' }}>{t('match.back')}</Link>
      </div>
    );
  }

  const game = matchQ.data;
  const stats = statsQ.data ?? [];
  const homeStats = stats.filter((s) => s.team_id === game.home_team_id);
  const awayStats = stats.filter((s) => s.team_id === game.away_team_id);
  const referees = (game.referees ?? []).filter((r) => r && r.trim().length > 0);
  const live = isLiveNow(game);

  return (
    <div dir={dir} className="min-h-screen py-12 px-4 md:px-8" style={{ background: '#07080C' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <MatchHeader game={game} live={live} />

        {referees.length > 0 && (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="text-xs mb-2" style={{ color: 'rgba(242,237,230,0.5)' }}>{t('match.referees')}</div>
            <div className="font-medium" style={{ color: '#F2EDE6' }}>{referees.join('  ·  ')}</div>
          </div>
        )}

        {game.status === 'played' ? (
          <>
            <QuarterScoresTable game={game} />
            {homeStats.length > 0 && (
              <BoxScoreTable
                teamName={game.home_team ? teamName(game.home_team) : ''}
                teamLogo={game.home_team?.logo ?? null}
                teamColor={game.home_team?.home_color ?? null}
                rows={homeStats}
                jerseyByPlayerId={homeJerseysQ.data ?? new Map()}
              />
            )}
            {awayStats.length > 0 && (
              <BoxScoreTable
                teamName={game.away_team ? teamName(game.away_team) : ''}
                teamLogo={game.away_team?.logo ?? null}
                teamColor={game.away_team?.away_color ?? null}
                rows={awayStats}
                jerseyByPlayerId={awayJerseysQ.data ?? new Map()}
              />
            )}
          </>
        ) : (
          <>
            {live && (
              <a
                href={game.watch_url || 'https://tv.wbpl.co.il'}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl p-6 text-center transition-transform hover:scale-[1.01]"
                style={{
                  background: 'linear-gradient(135deg, rgba(220,38,38,0.16) 0%, rgba(255,77,0,0.12) 100%)',
                  border: '1px solid rgba(239,68,68,0.45)',
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#ef4444' }} />
                  <span className="font-black text-lg" style={{ color: '#f87171' }}>{t('match.live_now')}</span>
                </div>
                <span
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white"
                  style={{ background: 'var(--grad-orange)', boxShadow: 'var(--sheen-top), 0 4px 14px rgba(214,60,0,0.35)' }}
                >
                  {t('match.watch_live')}
                </span>
                <div className="text-xs mt-3" style={{ color: 'rgba(242,237,230,0.55)' }}>
                  {t('match.watch_live_note')}
                </div>
              </a>
            )}
            {game.home_team && game.away_team && (
              <MatchLineups
                gameId={game.id}
                seasonId={game.season_id ?? null}
                homeTeamId={game.home_team_id}
                homeTeamName={teamName(game.home_team)}
                homeTeamLogo={game.home_team.logo}
                awayTeamId={game.away_team_id}
                awayTeamName={teamName(game.away_team)}
                awayTeamLogo={game.away_team.logo}
              />
            )}
          </>
        )}

        <MatchMedia gameId={game.id} />
        <MatchVideos gameId={game.id} />
      </div>
    </div>
  );
};

export default MatchPage;
