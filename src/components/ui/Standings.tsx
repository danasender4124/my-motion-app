import React from 'react';
import { motion } from 'framer-motion';
import { TEAMS } from '../../data/league';

const COLS = '2rem 1fr 3rem 3rem 3rem 3rem 4.5rem 4.5rem 4.5rem 3rem';

const Standings: React.FC = () => {
  const sorted = [...TEAMS].sort((a, b) => {
    const ptsA = a.wins * 2 + a.losses;
    const ptsB = b.wins * 2 + b.losses;
    if (ptsB !== ptsA) return ptsB - ptsA;
    return (b.pf - b.pa) - (a.pf - a.pa);
  });

  return (
    <section id="standings" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-10">
        <motion.h2
          className="text-2xl md:text-3xl font-black border-r-4 pr-4"
          style={{ color: '#F2EDE6', borderColor: '#FF4D00' }}
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          טבלת הליגה · עונת 2024/25
        </motion.h2>
        <span
          className="text-xs font-medium px-3 py-1 rounded-full"
          style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00', border: '1px solid rgba(255,77,0,0.3)' }}
        >
          עונה 2025 · פלייאוף
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px] rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Header row */}
          <div
            className="grid text-xs font-bold uppercase tracking-wider px-4 py-4"
            style={{
              gridTemplateColumns: COLS,
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(242,237,230,0.4)',
              gap: '0.5rem',
            }}
          >
            <span className="text-center">#</span>
            <span>קבוצה</span>
            <span className="text-center">מש׳</span>
            <span className="text-center">ניצ׳</span>
            <span className="text-center">הפ׳</span>
            <span className="text-center">טכני</span>
            <span className="text-center">קלעה</span>
            <span className="text-center">ספגה</span>
            <span className="text-center">הפרש</span>
            <span className="text-center">נק׳</span>
          </div>

          {sorted.map((team, i) => {
            const isPlayoff = i < 4;
            const isTop = i === 0;
            const diff = team.pf - team.pa;
            const pts = team.wins * 2 + team.losses;

            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: [0.25, 1, 0.5, 1] }}
                className="grid items-center px-4 py-5 transition-colors duration-150 cursor-pointer"
                style={{
                  gridTemplateColumns: COLS,
                  gap: '0.5rem',
                  background: isTop ? 'rgba(255,77,0,0.08)' : 'transparent',
                  borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  borderRight: isTop ? '3px solid #FF4D00' : '3px solid transparent',
                }}
                whileHover={{ background: 'rgba(255,255,255,0.04)' } as any}
              >
                {/* Rank */}
                <span
                  className="text-center text-sm font-black"
                  style={{ color: isTop ? '#FF4D00' : isPlayoff ? '#FFB300' : 'rgba(242,237,230,0.35)' }}
                >
                  {i + 1}
                </span>

                {/* Team name */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: team.color }} />
                  <span
                    className="text-sm font-semibold truncate"
                    style={{ color: isTop ? '#F2EDE6' : 'rgba(242,237,230,0.8)' }}
                  >
                    {team.name}
                  </span>
                </div>

                {/* Games played */}
                <span className="text-center text-sm tabular-nums" style={{ color: 'rgba(242,237,230,0.55)' }}>
                  {team.wins + team.losses}
                </span>

                {/* Wins */}
                <span className="text-center text-sm font-bold tabular-nums" style={{ color: '#F2EDE6' }}>
                  {team.wins}
                </span>

                {/* Losses */}
                <span className="text-center text-sm tabular-nums" style={{ color: 'rgba(242,237,230,0.55)' }}>
                  {team.losses}
                </span>

                {/* Technical fouls */}
                <span className="text-center text-sm tabular-nums" style={{ color: 'rgba(242,237,230,0.3)' }}>
                  0
                </span>

                {/* Points scored */}
                <span className="text-center text-sm tabular-nums" style={{ color: 'rgba(242,237,230,0.65)' }}>
                  {team.pf}
                </span>

                {/* Points allowed */}
                <span className="text-center text-sm tabular-nums" style={{ color: 'rgba(242,237,230,0.65)' }}>
                  {team.pa}
                </span>

                {/* Differential */}
                <span
                  className="text-center text-sm font-semibold tabular-nums"
                  style={{ color: diff > 0 ? '#4ade80' : diff < 0 ? '#f87171' : 'rgba(242,237,230,0.55)' }}
                >
                  {diff > 0 ? '+' : ''}{diff}
                </span>

                {/* Standing points */}
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
