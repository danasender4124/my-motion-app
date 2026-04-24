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

const Results: React.FC = () => {
  const [tab, setTab] = useState<'results' | 'schedule'>('results');

  return (
    <section id="results" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-10">
        <h2
          className="text-2xl md:text-3xl font-black border-r-4 pr-4"
          style={{ color: '#F2EDE6', borderColor: '#FF4D00' }}
        >
          משחקים
        </h2>
        <SectionTabs
          tabs={[
            { id: 'results', label: 'תוצאות' },
            { id: 'schedule', label: 'לוח משחקים' },
          ]}
          active={tab}
          onChange={(id) => setTab(id as 'results' | 'schedule')}
          suffix={
            <span
              className="px-4 py-2 rounded-lg text-sm font-bold"
              style={{
                background: 'rgba(255,255,255,0.07)',
                color: 'rgba(242,237,230,0.55)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              מחזור 22 ▾
            </span>
          }
        />
      </div>

      {/* Games grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tab === 'results'
          ? RECENT_RESULTS.map((g, i) => {
              const homeWon = g.homeScore > g.awayScore;
              return (
                <motion.div
                  key={g.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  whileHover={{ y: -2 }}
                  className="relative rounded-2xl overflow-hidden cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {/* Date strip */}
                  <div
                    className="px-5 py-3 flex items-center justify-between text-xs"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(242,237,230,0.45)' }}
                  >
                    <span>{g.round}</span>
                    <span>{g.date}</span>
                  </div>

                  {/* Score */}
                  <div className="px-5 py-6 flex items-center justify-between gap-3">
                    {/* Home */}
                    <div className="flex-1 text-right">
                      <p className="text-sm font-bold" style={{ color: homeWon ? '#F2EDE6' : 'rgba(242,237,230,0.5)' }}>
                        {g.home}
                      </p>
                    </div>

                    {/* Score box */}
                    <div className="flex items-center gap-1.5 font-black text-xl tabular-nums">
                      <span style={{ color: homeWon ? '#FF4D00' : 'rgba(242,237,230,0.5)' }}>{g.homeScore}</span>
                      <span style={{ color: 'rgba(242,237,230,0.2)', fontSize: '14px' }}>–</span>
                      <span style={{ color: !homeWon ? '#FF4D00' : 'rgba(242,237,230,0.5)' }}>{g.awayScore}</span>
                    </div>

                    {/* Away */}
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold" style={{ color: !homeWon ? '#F2EDE6' : 'rgba(242,237,230,0.5)' }}>
                        {g.away}
                      </p>
                    </div>
                  </div>

                  {/* Winner bar */}
                  <div
                    className="h-0.5"
                    style={{
                      background: 'linear-gradient(to left, transparent, #FF4D00, transparent)',
                      opacity: 0.5,
                    }}
                  />
                </motion.div>
              );
            })
          : UPCOMING_GAMES.map((g, i) => (
              <motion.div
                key={g.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div
                  className="px-5 py-3 flex items-center justify-between text-xs"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(242,237,230,0.45)' }}
                >
                  <span>{g.round}</span>
                  <span>{g.date} · {g.time}</span>
                </div>
                <div className="px-5 py-6 flex items-center justify-between gap-3">
                  <p className="flex-1 text-right text-sm font-bold" style={{ color: '#F2EDE6' }}>{g.home}</p>
                  <div
                    className="px-3 py-1 rounded-lg text-xs font-black"
                    style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00', border: '1px solid rgba(255,77,0,0.3)' }}
                  >
                    {g.time}
                  </div>
                  <p className="flex-1 text-left text-sm font-bold" style={{ color: '#F2EDE6' }}>{g.away}</p>
                </div>
              </motion.div>
            ))
        }
      </div>
    </section>
  );
};

export default Results;
