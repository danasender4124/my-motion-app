import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRecentResults, useUpcomingGames, useSeasonsWithAnyGames, pickDefaultSeasonId, type GameWithTeams } from '../../lib/queries';
import { teamName } from '../../lib/displayName';
import SectionTabs from './SectionTabs';
import SeasonPicker from './SeasonPicker';
import { SkeletonTable } from './Skeleton';

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.25, 1, 0.5, 1] },
  }),
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const TvIcon: React.FC<{ size?: number }> = ({ size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="15" rx="2" />
    <polyline points="17 2 12 7 7 2" />
  </svg>
);

const ListIcon: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="8" y1="6"  x2="21" y2="6"  />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6"  x2="3.01" y2="6"  />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

// doc + table-lines icon
const StatsIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="16" y2="17"/>
    <line x1="8" y1="9"  x2="11" y2="9"/>
  </svg>
);

// ─── Grid column templates ────────────────────────────────────────────────────
// Schedule: תאריך | שעה | אולם | צפיה | מחזור | מארחת | אורחת | פרטים
const SCHED_COLS = '108px 62px 1fr 80px 78px 1.6fr 1.6fr 52px';

/**
 * Round badge: league rounds ("מחזור 7") render as a compact numbered disc;
 * cup stages carry their full name ("מוקדמות גביע ווינר אתנה") and render as
 * a rounded chip that wraps to as many lines as the label needs.
 */
const RoundBadge: React.FC<{ round: string }> = ({ round }) => {
  const num = round.match(/^מחזור\s+(\d+)$/)?.[1];
  return (
    <span
      className={`inline-flex items-center justify-center font-black ${
        num ? 'w-8 h-8 rounded-full text-xs' : 'px-2 py-1 rounded-xl text-[10px] leading-tight text-center'
      }`}
      style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00' }}
    >
      {num ?? round}
    </span>
  );
};
// Results:  תאריך | שעה | אולם | מארחת | אורחת | סטטיסטיקה | תוצאה
const RES_COLS   = '108px 62px 1fr 1.6fr 1.6fr 80px 110px';

// ─── Data adapter ─────────────────────────────────────────────────────────────
type GameRow = {
  id: string;
  date: string;
  time: string;
  round: string;
  venue: string;
  statsUrl: string;
  watchUrl: string;
  home: string;
  homeLogo?: string;
  homeId?: string;
  homeScore: number | null;
  away: string;
  awayLogo?: string;
  awayId?: string;
  awayScore: number | null;
};

const fmtDate = (iso: string | null) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const adapt = (g: GameWithTeams): GameRow => ({
  id: g.id,
  date: fmtDate(g.date),
  time: (g.time || '').slice(0, 5),
  round: g.round || '',
  venue: g.hall || '',
  statsUrl: '/match/' + g.id,
  watchUrl: g.watch_url || '',
  home: g.home_team ? teamName(g.home_team) : '',
  homeLogo: g.home_team?.logo || undefined,
  homeId: g.home_team?.id,
  homeScore: g.home_score,
  away: g.away_team ? teamName(g.away_team) : '',
  awayLogo: g.away_team?.logo || undefined,
  awayId: g.away_team?.id,
  awayScore: g.away_score,
});

// ─── Main Component ───────────────────────────────────────────────────────────
const Results: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const [tab, setTab] = useState<'results' | 'schedule' | null>(null);

  // Season selector — every season with games, newest first; default is the
  // most recent season that has *played* games (empty active season is skipped).
  const { data: seasons = [] } = useSeasonsWithAnyGames();
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const defaultSeasonId = pickDefaultSeasonId(seasons);
  useEffect(() => {
    if (!seasonId && defaultSeasonId) setSeasonId(defaultSeasonId);
  }, [defaultSeasonId, seasonId]);

  const recentQ = useRecentResults(seasonId);
  const upcomingQ = useUpcomingGames(seasonId);

  const recent = (recentQ.data ?? []).map(adapt);
  const upcoming = (upcomingQ.data ?? []).map(adapt);

  // Until the user picks a tab herself: results when the season has any, the
  // upcoming fixtures otherwise — a fresh season opens on its schedule instead
  // of an empty results table.
  const activeTab: 'results' | 'schedule' =
    tab ?? (recentQ.data && recent.length === 0 && upcoming.length > 0 ? 'schedule' : 'results');

  return (
    <section id="results" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir={dir}>

      {/* Season selector */}
      <div className="flex justify-center mb-6">
        <SeasonPicker
          seasons={seasons}
          value={seasonId}
          onChange={setSeasonId}
          placeholder={t('results.pick_season')}
        />
      </div>

      {/* Section header */}
      <div className="flex justify-center mb-10">
        <SectionTabs
          tabs={[
            { id: 'schedule', label: t('results.tab_upcoming') },
            { id: 'results',  label: t('results.tab_results') },
          ]}
          active={activeTab}
          onChange={(id) => setTab(id as 'results' | 'schedule')}
        />
      </div>

      {activeTab === 'results' ? (
        /* ── Results: grouped table ───────────────────────────────────────── */
        <>
          {recentQ.isLoading && (
            <SkeletonTable rows={8} />
          )}
          {recentQ.error && (
            <div className="text-center py-12" style={{ color: '#f87171' }}>
              {t('results.error')}
            </div>
          )}
          {recentQ.data && recent.length === 0 && (
            <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>
              {t('results.no_games_season')}
            </div>
          )}
          {recentQ.data && recent.length > 0 && (() => {
            // Group by round, preserve insertion order
            const grouped: Record<string, GameRow[]> = {};
            recent.forEach(g => {
              if (!grouped[g.round]) grouped[g.round] = [];
              grouped[g.round].push(g);
            });

            // Sub-header shared across all groups
            const SubHeader = () => (
              <div
                className="grid items-center px-4 py-2 text-xs font-bold"
                style={{
                  gridTemplateColumns: RES_COLS,
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(242,237,230,0.5)',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <span>{t('results.col_date')}</span>
                <span>{t('results.col_time')}</span>
                <span>{t('results.col_hall')}</span>
                <span>{t('results.col_home')}</span>
                <span>{t('results.col_away')}</span>
                <span className="text-center">{t('results.col_stats')}</span>
                <span className="text-center">{t('results.col_score')}</span>
              </div>
            );

            let rowIndex = 0;
            return (
              <div className="w-full overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
              <div style={{ minWidth: '700px' }}>
                {Object.entries(grouped).map(([round, games]) => (
                  <div key={round}>
                    {/* Round header — only when the round has a name */}
                    {round && (
                      <div
                        className="flex items-center justify-end px-5 py-2.5"
                        style={{ background: 'var(--grad-orange)', boxShadow: 'var(--sheen-top)' }}
                      >
                        <span className="text-base font-black text-white">{round}</span>
                      </div>
                    )}

                    <SubHeader />

                    {games.map((g) => {
                      const i = rowIndex++;
                      const homeWon = (g.homeScore ?? 0) > (g.awayScore ?? 0);
                      const evenBg  = 'rgba(255,255,255,0.04)';
                      const oddBg   = 'rgba(255,255,255,0.01)';
                      const hoverBg = 'rgba(255,77,0,0.07)';
                      return (
                        <motion.div
                          key={g.id}
                          initial={{ opacity: 0, x: 10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: (i % games.length) * 0.04 }}
                          className="grid items-center px-4 py-3"
                          style={{
                            gridTemplateColumns: RES_COLS,
                            background: i % 2 === 0 ? evenBg : oddBg,
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            cursor: 'default',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                          onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? evenBg : oddBg)}
                        >
                          {/* תאריך */}
                          <span className="text-sm font-semibold" style={{ color: '#F2EDE6' }}>{g.date}</span>

                          {/* שעה */}
                          <span className="text-sm font-black" style={{ color: '#FF4D00' }}>{g.time}</span>

                          {/* אולם */}
                          <span className="text-sm leading-snug" style={{ color: 'rgba(242,237,230,0.6)' }}>{g.venue}</span>

                          {/* מארחת */}
                          {g.homeId ? (
                            <Link to={`/team/${g.homeId}`} className="flex items-center gap-2 min-w-0">
                              <img src={g.homeLogo} alt={g.home} loading="lazy" style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
                              <span className="text-sm font-bold truncate" style={{ color: homeWon ? '#F2EDE6' : 'rgba(242,237,230,0.55)' }}>{g.home}</span>
                            </Link>
                          ) : (
                            <div className="flex items-center gap-2 min-w-0">
                              <img src={g.homeLogo} alt={g.home} loading="lazy" style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
                              <span className="text-sm font-bold truncate" style={{ color: homeWon ? '#F2EDE6' : 'rgba(242,237,230,0.55)' }}>{g.home}</span>
                            </div>
                          )}

                          {/* אורחת */}
                          {g.awayId ? (
                            <Link to={`/team/${g.awayId}`} className="flex items-center gap-2 min-w-0">
                              <img src={g.awayLogo} alt={g.away} loading="lazy" style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
                              <span className="text-sm font-medium truncate" style={{ color: !homeWon ? '#F2EDE6' : 'rgba(242,237,230,0.55)' }}>{g.away}</span>
                            </Link>
                          ) : (
                            <div className="flex items-center gap-2 min-w-0">
                              <img src={g.awayLogo} alt={g.away} loading="lazy" style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
                              <span className="text-sm font-medium truncate" style={{ color: !homeWon ? '#F2EDE6' : 'rgba(242,237,230,0.55)' }}>{g.away}</span>
                            </div>
                          )}

                          {/* סטטיסטיקה */}
                          <div className="flex justify-center">
                            {g.statsUrl ? (
                              <Link
                                to={g.statsUrl}
                                className="flex items-center justify-center w-8 h-8 rounded-lg"
                                style={{ color: '#FF4D00', background: 'rgba(255,77,0,0.14)' }}
                                title={t('results.title_stats')}
                              >
                                <StatsIcon />
                              </Link>
                            ) : (
                              <span
                                className="flex items-center justify-center w-8 h-8 rounded-lg"
                                style={{ color: 'rgba(242,237,230,0.4)' }}
                                title={t('results.title_no_stats')}
                              >
                                <StatsIcon />
                              </span>
                            )}
                          </div>

                          {/* תוצאה */}
                          <div className="flex justify-center">
                            <span className="text-sm font-black tabular-nums px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: '#F2EDE6', letterSpacing: '0.04em' }}>
                              <span style={{ color: homeWon ? '#FF4D00' : 'inherit' }}>{g.homeScore}</span>
                              <span style={{ color: 'rgba(242,237,230,0.4)' }}>–</span>
                              <span style={{ color: !homeWon ? '#FF4D00' : 'inherit' }}>{g.awayScore}</span>
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
              </div>
            );
          })()}
        </>

      ) : (
        /* ── Schedule: full table ─────────────────────────────────────────── */
        <>
          {upcomingQ.isLoading && (
            <SkeletonTable rows={8} />
          )}
          {upcomingQ.error && (
            <div className="text-center py-12" style={{ color: '#f87171' }}>
              {t('results.error')}
            </div>
          )}
          {upcomingQ.data && upcoming.length === 0 && (
            <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>
              {t('results.no_games_season')}
            </div>
          )}
          {upcomingQ.data && upcoming.length > 0 && (
            <div className="w-full overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
            <div style={{ minWidth: '700px' }}>

              {/* Header row */}
              <div
                className="grid items-center px-4 py-3 text-sm font-black text-white"
                style={{ gridTemplateColumns: SCHED_COLS, background: 'var(--grad-orange)', boxShadow: 'var(--sheen-top)' }}
              >
                <span>{t('results.col_date')}</span>
                <span>{t('results.col_time')}</span>
                <span>{t('results.col_hall')}</span>
                <span className="text-center">{t('results.col_watch')}</span>
                <span className="text-center">{t('results.col_round')}</span>
                <span>{t('results.col_home')}</span>
                <span>{t('results.col_away')}</span>
                <span />
              </div>

              {/* Game rows — close minWidth wrapper after last row */}
              {upcoming.map((g, i) => {
                const evenBg  = 'rgba(255,255,255,0.04)';
                const oddBg   = 'rgba(255,255,255,0.01)';
                const hoverBg = 'rgba(255,77,0,0.07)';

                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="grid items-center px-4 py-3"
                    style={{
                      gridTemplateColumns: SCHED_COLS,
                      background: i % 2 === 0 ? evenBg : oddBg,
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? evenBg : oddBg)}
                  >
                    {/* תאריך */}
                    <span className="text-sm font-semibold" style={{ color: '#F2EDE6' }}>
                      {g.date}
                    </span>

                    {/* שעה */}
                    <span className="text-sm font-black" style={{ color: '#FF4D00' }}>
                      {g.time}
                    </span>

                    {/* אולם */}
                    <span className="text-sm leading-snug" style={{ color: 'rgba(242,237,230,0.6)' }}>
                      {g.venue}
                    </span>

                    {/* צפיה — TV icon (linked if watchUrl set) */}
                    <div className="flex justify-center">
                      {g.watchUrl ? (
                        <a
                          href={g.watchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-8 h-8 rounded-lg"
                          style={{ color: '#FF4D00', background: 'rgba(255,77,0,0.14)' }}
                          title={t('results.title_watch')}
                        >
                          <TvIcon />
                        </a>
                      ) : (
                        <span
                          className="flex items-center justify-center w-8 h-8 rounded-lg"
                          style={{ color: 'rgba(242,237,230,0.4)' }}
                          title={t('results.title_no_watch')}
                        >
                          <TvIcon />
                        </span>
                      )}
                    </div>

                    {/* מחזור */}
                    <div className="flex justify-center">
                      <RoundBadge round={g.round} />
                    </div>

                    {/* מארחת — logo + name */}
                    {g.homeId ? (
                      <Link to={`/team/${g.homeId}`} className="flex items-center gap-2 min-w-0">
                        <img src={g.homeLogo} alt={g.home} loading="lazy" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
                        <span className="text-sm font-bold leading-tight truncate" style={{ color: '#F2EDE6' }}>{g.home}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={g.homeLogo} alt={g.home} loading="lazy" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
                        <span className="text-sm font-bold leading-tight truncate" style={{ color: '#F2EDE6' }}>{g.home}</span>
                      </div>
                    )}

                    {/* אורחת — logo + name */}
                    {g.awayId ? (
                      <Link to={`/team/${g.awayId}`} className="flex items-center gap-2 min-w-0">
                        <img src={g.awayLogo} alt={g.away} loading="lazy" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
                        <span className="text-sm font-medium leading-tight truncate" style={{ color: 'rgba(242,237,230,0.75)' }}>{g.away}</span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={g.awayLogo} alt={g.away} loading="lazy" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
                        <span className="text-sm font-medium leading-tight truncate" style={{ color: 'rgba(242,237,230,0.75)' }}>{g.away}</span>
                      </div>
                    )}

                    {/* פרטים */}
                    <div className="flex justify-center">
                      <Link
                        to={`/match/${g.id}`}
                        className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                        style={{ color: '#FF4D00', background: 'rgba(255,77,0,0.14)' }}
                        title={t('results.title_details')}
                      >
                        <ListIcon />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Results;
