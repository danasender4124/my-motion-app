import React from 'react';
import { motion } from 'framer-motion';
import { TEAMS } from '../../data/league';

const Standings: React.FC = () => {
  const sorted = [...TEAMS].sort((a, b) => b.wins - a.wins || (b.pf - b.pa) - (a.pf - a.pa));

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
        <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00', border: '1px solid rgba(255,77,0,0.3)' }}>
          עונה 2025 · פלייאוף
        </span>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Table header */}
        <div
          className="grid text-xs font-bold uppercase tracking-wider px-4 py-4"
          style={{
            gridTemplateColumns: '2rem 1fr 2.5rem 2.5rem 2.5rem 3.5rem',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(242,237,230,0.4)',
            gap: '0.5rem',
          }}
        >
          <span className="text-center">#</span>
          <span>קבוצה</span>
          <span className="text-center">מ</span>
          <span className="text-center">נ</span>
          <span className="text-center">ה</span>
          <span className="text-center">יחס</span>
        </div>

        {/* Rows */}
        {sorted.map((team, i) => {
          const isPlayoff = i < 4;
          const isTop = i === 0;
          const ratio = ((team.pf - team.pa) > 0 ? '+' : '') + (team.pf - team.pa);

          return (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04, ease: [0.25, 1, 0.5, 1] }}
              className="grid items-center px-4 py-5 transition-colors duration-150 cursor-pointer"
              style={{
                gridTemplateColumns: '2rem 1fr 2.5rem 2.5rem 2.5rem 3.5rem',
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
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: team.color }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: isTop ? '#F2EDE6' : 'rgba(242,237,230,0.8)' }}
                >
                  {team.name}
                </span>
                {isPlayoff && i > 0 && (
                  <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(255,179,0,0.15)', color: '#FFB300' }}>
                    פלייאוף
                  </span>
                )}
                {isTop && (
                  <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(255,77,0,0.2)', color: '#FF4D00' }}>
                    מובילה
                  </span>
                )}
              </div>

              {/* Games played */}
              <span className="text-center text-sm" style={{ color: 'rgba(242,237,230,0.55)' }}>
                {team.wins + team.losses}
              </span>

              {/* Wins */}
              <span className="text-center text-sm font-bold" style={{ color: '#F2EDE6' }}>
                {team.wins}
              </span>

              {/* Losses */}
              <span className="text-center text-sm" style={{ color: 'rgba(242,237,230,0.55)' }}>
                {team.losses}
              </span>

              {/* Ratio */}
              <span
                className="text-center text-xs font-semibold"
                style={{ color: (team.pf - team.pa) > 0 ? '#4ade80' : '#f87171' }}
              >
                {ratio}
              </span>
            </motion.div>
          );
        })}

        {/* Legend */}
        <div
          className="flex flex-wrap items-center gap-4 px-4 py-3 text-xs"
          style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(242,237,230,0.35)' }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full" style={{ background: '#FF4D00' }} />
            <span>מובילה</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full" style={{ background: '#FFB300' }} />
            <span>זכאיות לפלייאוף (מקומות 1–4)</span>
          </div>
          <span>מ=משחקים · נ=ניצחונות · ה=הפסדים</span>
        </div>
      </div>
    </section>
  );
};

export default Standings;
