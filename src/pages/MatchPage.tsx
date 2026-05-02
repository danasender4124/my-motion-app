import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMatch, useMatchStats, useTeamJerseys } from '../lib/queries';
import MatchHeader from '../components/match/MatchHeader';
import QuarterScoresTable from '../components/match/QuarterScoresTable';
import BoxScoreTable from '../components/match/BoxScoreTable';

const MatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const matchQ = useMatch(id);
  const statsQ = useMatchStats(id);
  const homeJerseysQ = useTeamJerseys(matchQ.data?.season_id, matchQ.data?.home_team_id);
  const awayJerseysQ = useTeamJerseys(matchQ.data?.season_id, matchQ.data?.away_team_id);

  if (matchQ.isLoading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center" style={{ background: '#07080C' }}>
        <span style={{ color: 'rgba(242,237,230,0.5)' }}>טוען...</span>
      </div>
    );
  }
  if (matchQ.error || !matchQ.data) {
    return (
      <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#07080C' }}>
        <span style={{ color: '#F2EDE6' }}>המשחק לא נמצא</span>
        <Link to="/results" style={{ color: '#FF4D00' }}>חזרה למשחקים</Link>
      </div>
    );
  }

  const game = matchQ.data;
  const stats = statsQ.data ?? [];
  const homeStats = stats.filter((s) => s.team_id === game.home_team_id);
  const awayStats = stats.filter((s) => s.team_id === game.away_team_id);

  return (
    <div dir="rtl" className="min-h-screen py-12 px-4 md:px-8" style={{ background: '#07080C' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <MatchHeader game={game} />

        {game.status === 'played' ? (
          <>
            <QuarterScoresTable game={game} />
            {homeStats.length > 0 && (
              <BoxScoreTable
                teamName={game.home_team?.name ?? ''}
                teamLogo={game.home_team?.logo ?? null}
                teamColor={game.home_team?.home_color ?? null}
                rows={homeStats}
                jerseyByPlayerId={homeJerseysQ.data ?? new Map()}
              />
            )}
            {awayStats.length > 0 && (
              <BoxScoreTable
                teamName={game.away_team?.name ?? ''}
                teamLogo={game.away_team?.logo ?? null}
                teamColor={game.away_team?.away_color ?? null}
                rows={awayStats}
                jerseyByPlayerId={awayJerseysQ.data ?? new Map()}
              />
            )}
          </>
        ) : (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(242,237,230,0.6)' }}
          >
            המשחק טרם שוחק.
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchPage;
