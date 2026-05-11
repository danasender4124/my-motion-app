import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTeams } from '../../lib/queries';
import { STANDINGS_OVERRIDE } from '../../lib/standings-override';

const COLS = '2.5rem 1fr 3.5rem 3.5rem 3.5rem 4rem 4rem 4.5rem 3.5rem';

const Standings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const teamsQ = useTeams();
  const teams = teamsQ.data ?? [];

  // Match each override entry to a real team (by name substring) so we keep logos + click-through
  // Order is preserved (no sorting) — STANDINGS_OVERRIDE already in final order.
  const rows = STANDINGS_OVERRIDE
    .map((ov) => {
      const team = teams.find((t) => t.name.includes(ov.match));
      if (!team) return null;
      return { team, wins: ov.wins, losses: ov.losses, points_for: ov.points_for, points_against: ov.points_against };
    })
    .filter((r): r is { team: typeof teams[number]; wins: number; losses: number; points_for: number; points_against: number } => r !== null);

  return (
    <section id="standings" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir={dir}>
      <div className="flex justify-end mb-6">
        <span
          className="text-xs font-medium px-3 py-1"
          style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00', border: '1px solid rgba(255,77,0,0.3)' }}
        >
          {t('standings.title')}
        </span>
      </div>

      {teamsQ.isLoading ? (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>{t('common.loading')}</div>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="min-w-[680px] overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
            <div
              className="grid items-center px-4 py-3 text-sm font-black text-white"
              style={{ gridTemplateColumns: COLS, background: '#FF4D00', gap: '0.5rem' }}
            >
              <span className="text-center">{t('standings.col_rank')}</span>
              <span>{t('standings.col_team')}</span>
              <span className="text-center">{t('standings.col_played')}</span>
              <span className="text-center">{t('standings.col_won')}</span>
              <span className="text-center">{t('standings.col_lost')}</span>
              <span className="text-center">{t('standings.col_pf')}</span>
              <span className="text-center">{t('standings.col_pa')}</span>
              <span className="text-center">{t('standings.col_diff')}</span>
              <span className="text-center">{t('standings.col_pts')}</span>
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
                      <span>{t('standings.lower_bracket')}</span>
                      <span style={{ color: 'rgba(242,237,230,0.4)', fontWeight: 500 }}>{t('standings.lower_bracket_note')}</span>
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
