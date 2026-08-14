import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLeagueStandings } from '../../lib/queries';
import { teamName } from '../../lib/displayName';
import SectionTitle from './SectionTitle';
import { SkeletonTable } from './Skeleton';

const COLS = '2.5rem 1fr 3.5rem 3.5rem 3.5rem 4rem 4rem 4.5rem 3.5rem 4rem';

const Standings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  // Live table for the active season — all zeros (alphabetical) until the
  // first tip-off, then self-updating as results are entered in the admin.
  const standingsQ = useLeagueStandings();
  const rows = standingsQ.data ?? [];
  // Rank accents mean nothing while everyone is 0-0.
  const hasPlayed = rows.some((r) => r.wins + r.losses > 0);

  return (
    <section id="standings" className="pt-7 pb-16 md:pt-9 md:pb-24 px-4 md:px-8 max-w-7xl mx-auto" dir={dir}>
      <SectionTitle>{t('standings.title')}</SectionTitle>

      {standingsQ.isLoading ? (
        <SkeletonTable rows={10} />
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="min-w-[680px] overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
            <div
              className="grid items-center px-4 py-3 text-sm font-black text-white"
              style={{ gridTemplateColumns: COLS, background: 'var(--grad-orange)', boxShadow: 'var(--sheen-top)', gap: '0.5rem' }}
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
              <span className="text-center">{t('standings.col_pct')}</span>
            </div>

            {rows.map((r, i) => {
              const isTop = hasPlayed && i === 0;
              const isUpperHalf = hasPlayed && i < 6;
              const diff = r.points_for - r.points_against;
              const pts = r.wins * 2 + r.losses;
              const pct = r.wins + r.losses > 0 ? Math.round((r.wins / (r.wins + r.losses)) * 100) : 0;
              const evenBg = 'rgba(255,255,255,0.04)';
              const oddBg = 'rgba(255,255,255,0.01)';
              return (
                <React.Fragment key={r.team.id}>
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
                            loading="lazy"
                            style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }}
                          />
                        )}
                        <span
                          className="text-sm font-semibold truncate"
                          style={{ color: isTop ? '#F2EDE6' : 'rgba(242,237,230,0.85)' }}
                        >
                          {teamName(r.team)}
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
                      <span
                        className="text-center text-sm tabular-nums"
                        style={{ color: 'rgba(242,237,230,0.65)' }}
                      >
                        {`${pct}%`}
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
