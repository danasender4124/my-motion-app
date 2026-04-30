import React from 'react';
import { motion } from 'framer-motion';
import { TEAMS } from '../../data/league';

// # | קבוצה | מש' | ניצ' | הפ' | קלעה | ספגה | הפרש | נק'
const COLS = '2.5rem 1fr 3.5rem 3.5rem 3.5rem 4rem 4rem 4.5rem 3.5rem';

const Standings: React.FC = () => {
  const sorted = [...TEAMS].sort((a, b) => {
    const ptsA = a.wins * 2 + a.losses;
    const ptsB = b.wins * 2 + b.losses;
    if (ptsB !== ptsA) return ptsB - ptsA;
    return (b.pf - b.pa) - (a.pf - a.pa);
  });

  return (
    <section id="standings" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">

      {/* Season badge */}
      <div className="flex justify-end mb-6">
        <span
          className="text-xs font-medium px-3 py-1"
          style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00', border: '1px solid rgba(255,77,0,0.3)' }}
        >
          עונה 2025 · פלייאוף
        </span>
      </div>

      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="min-w-[680px] overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>

          {/* Orange header */}
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

          {/* Rows */}
          {sorted.map((team, i) => {
            const isTop     = i === 0;
            const isPlayoff = i < 4;
            const diff      = team.pf - team.pa;
            const pts       = team.wins * 2 + team.losses;
            const evenBg    = 'rgba(255,255,255,0.04)';
            const oddBg     = 'rgba(255,255,255,0.01)';
            const hoverBg   = 'rgba(255,77,0,0.07)';

            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: [0.25, 1, 0.5, 1] }}
                className="grid items-center px-4 py-3 cursor-default"
                style={{
                  gridTemplateColumns: COLS,
                  gap: '0.5rem',
                  background: i % 2 === 0 ? evenBg : oddBg,
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  borderRight: isTop ? '3px solid #FF4D00' : '3px solid transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? evenBg : oddBg)}
              >
                {/* # */}
                <span
                  className="text-center text-sm font-black tabular-nums"
                  style={{ color: isTop ? '#FF4D00' : isPlayoff ? '#FFB300' : 'rgba(242,237,230,0.35)' }}
                >
                  {i + 1}
                </span>

                {/* קבוצה — logo + name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={team.logo}
                    alt={team.name}
                    style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }}
                  />
                  <span
                    className="text-sm font-semibold truncate"
                    style={{ color: isTop ? '#F2EDE6' : 'rgba(242,237,230,0.85)' }}
                  >
                    {team.name}
                  </span>
                </div>

                {/* מש' */}
                <span className="text-center text-sm tabular-nums" style={{ color: 'rgba(242,237,230,0.55)' }}>
                  {team.wins + team.losses}
                </span>

                {/* ניצ' */}
                <span className="text-center text-sm font-bold tabular-nums" style={{ color: '#F2EDE6' }}>
                  {team.wins}
                </span>

                {/* הפ' */}
                <span className="text-center text-sm tabular-nums" style={{ color: 'rgba(242,237,230,0.55)' }}>
                  {team.losses}
                </span>

                {/* קלעה */}
                <span className="text-center text-sm tabular-nums" style={{ color: 'rgba(242,237,230,0.65)' }}>
                  {team.pf}
                </span>

                {/* ספגה */}
                <span className="text-center text-sm tabular-nums" style={{ color: 'rgba(242,237,230,0.65)' }}>
                  {team.pa}
                </span>

                {/* הפרש */}
                <span
                  className="text-center text-sm font-semibold tabular-nums"
                  style={{ color: diff > 0 ? '#4ade80' : diff < 0 ? '#f87171' : 'rgba(242,237,230,0.55)' }}
                >
                  {diff > 0 ? '+' : ''}{diff}
                </span>

                {/* נק' */}
                <span
                  className="text-center text-sm font-black tabular-nums"
                  style={{ color: isTop ? '#FF4D00' : '#F2EDE6' }}
                >
                  {pts}
                </span>
              </motion.div>
            );
          })}

        </div>
      </div>
    </section>
  );
};

export default Standings;
