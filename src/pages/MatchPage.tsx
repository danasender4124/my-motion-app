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

  return (
    <div dir={dir} className="min-h-screen py-12 px-4 md:px-8" style={{ background: '#07080C' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <MatchHeader game={game} />

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
            <div
              className="rounded-2xl p-6 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(242,237,230,0.6)' }}
            >
              {t('match.not_played_yet')}
            </div>
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
