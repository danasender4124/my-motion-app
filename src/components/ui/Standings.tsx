import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTeams } from '../../lib/queries';
import { computeTeamSeasonStats } from '../../lib/aggregations';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { GameWithTeams } from '../../lib/queries';

const COLS = '2.5rem 1fr 3.5rem 3.5rem 3.5rem 4rem 4rem 4.5rem 3.5rem';

const SELECT_GAME =
  '*, home_team:teams!games_home_team_id_fkey(id, name, logo, home_color, away_color),' +
  ' away_team:teams!games_away_team_id_fkey(id, name, logo, home_color, away_color)';

const useAllSeasonGames = () =>
  useQuery({
    queryKey: ['games', 'season-all'],
    queryFn: async (): Promise<GameWithTeams[]> => {
      const { data: activeSeason } = await supabase
        .from('seasons').select('id').eq('status', 'active').maybeSingle();
      const seasonId = (activeSeason as { id: string } | null)?.id ?? null;
      if (!seasonId) return [];
      const { data, error } = await supabase
        .from('games').select(SELECT_GAME).eq('season_id', seasonId);
      if (error) throw error;
      return (data ?? []) as unknown as GameWithTeams[];
    },
    staleTime: 1000 * 60 * 5,
  });

const Standings: React.FC = () => {
  const teamsQ = useTeams();
  const gamesQ = useAllSeasonGames();

  const teams = teamsQ.data ?? [];
  // Cut-off: include only games played on or before 2026-03-30 (end of regular season + early playoffs)
  const STANDINGS_CUTOFF = '2026-03-30';
  const games = (gamesQ.data ?? []).filter((g) => (g.date ?? '') <= STANDINGS_CUTOFF);
  const allTeamIds = teams.map((t) => t.id);

  const rows = teams
    .map((t) => {
      const teamGames = games.filter((g) => g.home_team_id === t.id || g.away_team_id === t.id);
      const stats = computeTeamSeasonStats(t.id, teamGames, allTeamIds, games);
      return { team: t, ...stats };
    })
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return (b.points_for - b.points_against) - (a.points_for - a.points_against);
    });

  return (
    <section id="standings" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-end mb-6">
        <span
          className="text-xs font-medium px-3 py-1"
          style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00', border: '1px solid rgba(255,77,0,0.3)' }}
        >
          טבלת הליגה
        </span>
      </div>

      {teamsQ.isLoading || gamesQ.isLoading ? (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>טוען...</div>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="min-w-[680px] overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
            <div
              className="grid items-center px-4 py-3 text-sm font-black text-white"
              style={{ gridTemplateColumns: COLS, background: '#FF4D00', gap: '0.5rem' }}
            >
              <span className="text-center">#</span>
              <span>קבוצה</span>
              <span className="text-center">מש׳</span>
              <span className="text-center">ניצ׳</span>
              <span className="text-center">הפ׳</span>
              <span className="text-center">קלעה</span>
              <span className="text-center">ספגה</span>
              <span className="text-center">הפרש</span>
              <span className="text-center">נק׳</span>
            </div>

            {rows.map((r, i) => {
              const isTop = i === 0;
              const isUpperHalf = i < 6;
              const diff = r.points_for - r.points_against;
              const pts = r.wins * 2 + r.losses;
              const evenBg = 'rgba(255,255,255,0.04)';
              const oddBg = 'rgba(255,255,255,0.01)';
              return (
                <React.Fragment key={r.team.id}>
                  {i === 6 && (
                    <div
                      className="flex items-center gap-3 px-4 py-2 text-xs font-black uppercase tracking-wider"
                      style={{
                        background: 'rgba(255,77,0,0.10)',
                        color: '#FF4D00',
                        borderTop: '2px solid #FF4D00',
                        borderBottom: '2px solid #FF4D00',
                      }}
                    >
                      <span>בית תחתון</span>
                      <span style={{ color: 'rgba(242,237,230,0.4)', fontWeight: 500 }}>· מקומות 7-10</span>
                    </div>
                  )}
                  <Link to={`/team/${r.team.id}`}>
                    <motion.div
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.04, ease: [0.25, 1, 0.5, 1] }}
                      className="grid items-center px-4 py-3 cursor-pointer"
                      style={{
                        gridTemplateColumns: COLS,
                        gap: '0.5rem',
                        background: i % 2 === 0 ? evenBg : oddBg,
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        borderRight: isTop ? '3px solid #FF4D00' : '3px solid transparent',
                      }}
                      whileHover={{ background: 'rgba(255,77,0,0.07)' }}
                    >
                      <span
                        className="text-center text-sm font-black tabular-nums"
                        style={{ color: isTop ? '#FF4D00' : isUpperHalf ? '#FFB300' : 'rgba(242,237,230,0.5)' }}
                      >
                        {i + 1}
                      </span>
                      <div className="flex items-center gap-2.5 min-w-0">
                        {r.team.logo && (
                          <img
                            src={r.team.logo}
                            alt={r.team.name}
                            style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }}
                          />
                        )}
                        <span
                          className="text-sm font-semibold truncate"
                          style={{ color: isTop ? '#F2EDE6' : 'rgba(242,237,230,0.85)' }}
                        >
                          {r.team.name}
                        </span>
                      </div>
                      <span className="text-center text-sm tabular-nums" style={{ color: 'rgba(242,237,230,0.55)' }}>
                        {r.wins + r.losses}
                      </span>
                      <span className="text-center text-sm font-bold tabular-nums" style={{ color: '#F2EDE6' }}>
                        {r.wins}
                      </span>
                      <span className="text-center text-sm tabular-nums" style={{ color: 'rgba(242,237,230,0.55)' }}>
                        {r.losses}
                      </span>
                      <span className="text-center text-sm tabular-nums" style={{ color: 'rgba(242,237,230,0.65)' }}>
                        {r.points_for}
                      </span>
                      <span className="text-center text-sm tabular-nums" style={{ color: 'rgba(242,237,230,0.65)' }}>
                        {r.points_against}
                      </span>
                      <span
                        className="text-center text-sm font-semibold tabular-nums"
                        style={{ color: diff > 0 ? '#4ade80' : diff < 0 ? '#f87171' : 'rgba(242,237,230,0.55)' }}
                      >
                        {diff > 0 ? '+' : ''}{diff}
                      </span>
                      <span
                        className="text-center text-sm font-black tabular-nums"
                        style={{ color: isTop ? '#FF4D00' : '#F2EDE6' }}
                      >
                        {pts}
                      </span>
                    </motion.div>
                  </Link>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default Standings;
