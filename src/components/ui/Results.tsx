import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RECENT_RESULTS, UPCOMING_GAMES } from '../../data/league';
import SectionTabs from './SectionTabs';

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
const SCHED_COLS = '108px 62px 1fr 80px 64px 1.6fr 1.6fr 52px';
// Results:  תאריך | שעה | אולם | מארחת | אורחת | סטטיסטיקה | תוצאה
const RES_COLS   = '108px 62px 1fr 1.6fr 1.6fr 80px 110px';

// ─── Main Component ───────────────────────────────────────────────────────────
const Results: React.FC = () => {
  const [tab, setTab] = useState<'results' | 'schedule'>('schedule');

  return (
    <section id="results" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">

      {/* Section header */}
      <div className="flex justify-center mb-10">
        <SectionTabs
          tabs={[
            { id: 'schedule', label: 'המשחקים הבאים' },
            { id: 'results',  label: 'תוצאות' },
          ]}
          active={tab}
          onChange={(id) => setTab(id as 'results' | 'schedule')}
        />
      </div>

      {tab === 'results' ? (
        /* ── Results: grouped table ───────────────────────────────────────── */
        (() => {
          // Group by round, preserve insertion order
          const grouped: Record<string, typeof RECENT_RESULTS> = {};
          RECENT_RESULTS.forEach(g => {
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
              <span>תאריך</span>
              <span>שעה</span>
              <span>אולם</span>
              <span>מארחת</span>
              <span>אורחת</span>
              <span className="text-center">סטטיסטיקה</span>
              <span className="text-center">תוצאה</span>
            </div>
          );

          let rowIndex = 0;
          return (
            <div className="w-full overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
            <div style={{ minWidth: '700px' }}>
              {Object.entries(grouped).map(([round, games]) => (
                <div key={round}>
                  {/* Round header */}
                  <div
                    className="flex items-center justify-end px-5 py-2.5"
                    style={{ background: '#FF4D00' }}
                  >
                    <span className="text-base font-black text-white">{round}</span>
                  </div>

                  <SubHeader />

                  {games.map((g) => {
                    const i = rowIndex++;
                    const homeWon = g.homeScore > g.awayScore;
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
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={g.homeLogo} alt={g.home} style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
                          <span className="text-sm font-bold truncate" style={{ color: homeWon ? '#F2EDE6' : 'rgba(242,237,230,0.55)' }}>{g.home}</span>
                        </div>

                        {/* אורחת */}
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={g.awayLogo} alt={g.away} style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
                          <span className="text-sm font-medium truncate" style={{ color: !homeWon ? '#F2EDE6' : 'rgba(242,237,230,0.55)' }}>{g.away}</span>
                        </div>

                        {/* סטטיסטיקה */}
                        <div className="flex justify-center">
                          {g.statsUrl ? (
                            <a
                              href={g.statsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-8 h-8 rounded-lg"
                              style={{ color: '#FF4D00', background: 'rgba(255,77,0,0.14)' }}
                              title="סטטיסטיקת משחק"
                            >
                              <StatsIcon />
                            </a>
                          ) : (
                            <span
                              className="flex items-center justify-center w-8 h-8 rounded-lg"
                              style={{ color: 'rgba(242,237,230,0.25)' }}
                              title="סטטיסטיקה טרם זמינה"
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
        })()

      ) : (
        /* ── Schedule: full table ─────────────────────────────────────────── */
        <div className="w-full overflow-x-auto" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
        <div style={{ minWidth: '700px' }}>

          {/* Header row */}
          <div
            className="grid items-center px-4 py-3 text-sm font-black text-white"
            style={{ gridTemplateColumns: SCHED_COLS, background: '#FF4D00' }}
          >
            <span>תאריך</span>
            <span>שעה</span>
            <span>אולם</span>
            <span className="text-center">צפיה</span>
            <span className="text-center">מחזור</span>
            <span>מארחת</span>
            <span>אורחת</span>
            <span />
          </div>

          {/* Game rows — close minWidth wrapper after last row */}
          {UPCOMING_GAMES.map((g, i) => {
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
                      title="צפה במשחק"
                    >
                      <TvIcon />
                    </a>
                  ) : (
                    <span
                      className="flex items-center justify-center w-8 h-8 rounded-lg"
                      style={{ color: 'rgba(242,237,230,0.22)' }}
                      title="קישור צפיה טרם זמין"
                    >
                      <TvIcon />
                    </span>
                  )}
                </div>

                {/* מחזור */}
                <div className="flex justify-center">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black"
                    style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00' }}
                  >
                    {g.round}
                  </span>
                </div>

                {/* מארחת — logo + name */}
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={g.homeLogo}
                    alt={g.home}
                    style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }}
                  />
                  <span className="text-sm font-bold leading-tight truncate" style={{ color: '#F2EDE6' }}>
                    {g.home}
                  </span>
                </div>

                {/* אורחת — logo + name */}
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={g.awayLogo}
                    alt={g.away}
                    style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }}
                  />
                  <span className="text-sm font-medium leading-tight truncate" style={{ color: 'rgba(242,237,230,0.75)' }}>
                    {g.away}
                  </span>
                </div>

                {/* פרטים */}
                <div className="flex justify-center">
                  <button
                    className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                    style={{ color: 'rgba(242,237,230,0.4)', background: 'rgba(255,255,255,0.06)' }}
                    title="פרטי משחק"
                    onMouseEnter={e => {
                      e.currentTarget.style.color = '#FF4D00';
                      e.currentTarget.style.background = 'rgba(255,77,0,0.14)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = 'rgba(242,237,230,0.4)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    }}
                  >
                    <ListIcon />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
        </div>
      )}
    </section>
  );
};

export default Results;
