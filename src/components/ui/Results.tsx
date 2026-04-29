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

// ─── Grid column template ─────────────────────────────────────────────────────
// RTL order (right → left): תאריך | שעה | אולם | צפיה | מחזור | מארחת | אורחת | פרטים
const COLS = '108px 62px 1fr 80px 64px 1.6fr 1.6fr 52px';

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
        /* ── Results: score cards ─────────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {RECENT_RESULTS.map((g, i) => {
            const homeWon = g.homeScore > g.awayScore;
            return (
              <motion.div
                key={g.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="relative rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}
              >
                <div className="h-1 w-full" style={{ background: '#FF4D00' }} />
                <div
                  className="flex items-center justify-between text-xs font-medium"
                  style={{ color: 'rgba(242,237,230,0.4)', padding: '20px 24px 8px' }}
                >
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                    style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00' }}
                  >
                    {g.round}
                  </span>
                  <span>{g.date}</span>
                </div>
                <div style={{ padding: '8px 24px 24px' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-bold" style={{ color: homeWon ? '#F2EDE6' : 'rgba(242,237,230,0.45)' }}>{g.home}</span>
                    <span className="text-2xl font-black tabular-nums" style={{ color: homeWon ? '#FF4D00' : 'rgba(242,237,230,0.35)' }}>{g.homeScore}</span>
                  </div>
                  <div className="mb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold" style={{ color: !homeWon ? '#F2EDE6' : 'rgba(242,237,230,0.45)' }}>{g.away}</span>
                    <span className="text-2xl font-black tabular-nums" style={{ color: !homeWon ? '#FF4D00' : 'rgba(242,237,230,0.35)' }}>{g.awayScore}</span>
                  </div>
                </div>
                <div className="absolute top-0 bottom-0 right-0 w-1 rounded-l" style={{ background: 'rgba(255,77,0,0.25)' }} />
              </motion.div>
            );
          })}
        </div>

      ) : (
        /* ── Schedule: full table ─────────────────────────────────────────── */
        <div className="w-full overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>

          {/* Header row */}
          <div
            className="grid items-center px-4 py-3 text-sm font-black text-white"
            style={{ gridTemplateColumns: COLS, background: '#FF4D00' }}
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

          {/* Game rows */}
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
                  gridTemplateColumns: COLS,
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
      )}
    </section>
  );
};

export default Results;
