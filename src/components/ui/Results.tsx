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
        <motion.h2
          className="text-2xl md:text-3xl font-black border-r-4 pr-4"
          style={{ color: '#F2EDE6', borderColor: '#FF4D00' }}
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          משחקים
        </motion.h2>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  whileHover={{ y: -3, scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="relative rounded-2xl overflow-hidden cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Top accent bar */}
                  <div className="h-1 w-full" style={{ background: '#FF4D00' }} />

                  {/* Round + date */}
                  <div
                    className="px-5 pt-4 pb-2 flex items-center justify-between text-xs font-medium"
                    style={{ color: 'rgba(242,237,230,0.4)' }}
                  >
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00' }}
                    >
                      {g.round}
                    </span>
                    <span>{g.date}</span>
                  </div>

                  {/* Teams + Score */}
                  <div className="px-5 pb-5 pt-2">
                    {/* Home team */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-base font-bold leading-tight"
                        style={{ color: homeWon ? '#F2EDE6' : 'rgba(242,237,230,0.45)' }}
                      >
                        {g.home}
                      </span>
                      <span
                        className="text-2xl font-black tabular-nums"
                        style={{ color: homeWon ? '#FF4D00' : 'rgba(242,237,230,0.35)' }}
                      >
                        {g.homeScore}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="mb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />

                    {/* Away team */}
                    <div className="flex items-center justify-between">
                      <span
                        className="text-base font-bold leading-tight"
                        style={{ color: !homeWon ? '#F2EDE6' : 'rgba(242,237,230,0.45)' }}
                      >
                        {g.away}
                      </span>
                      <span
                        className="text-2xl font-black tabular-nums"
                        style={{ color: !homeWon ? '#FF4D00' : 'rgba(242,237,230,0.35)' }}
                      >
                        {g.awayScore}
                      </span>
                    </div>
                  </div>

                  {/* Winner indicator */}
                  <div
                    className="absolute top-0 bottom-0 right-0 w-1 rounded-l"
                    style={{
                      background: 'rgba(255,77,0,0.25)',
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
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}
              >
                {/* Top accent bar */}
                <div className="h-1 w-full" style={{ background: 'rgba(255,77,0,0.4)' }} />

                {/* Round + date */}
                <div className="px-5 pt-4 pb-2 flex items-center justify-between text-xs font-medium"
                  style={{ color: 'rgba(242,237,230,0.4)' }}
                >
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                    style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00' }}
                  >
                    {g.round}
                  </span>
                  <span>{g.date}</span>
                </div>

                {/* Teams */}
                <div className="px-5 pb-5 pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-bold" style={{ color: '#F2EDE6' }}>{g.home}</span>
                    <span
                      className="px-3 py-1.5 rounded-lg text-sm font-black"
                      style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00', border: '1px solid rgba(255,77,0,0.25)' }}
                    >
                      {g.time}
                    </span>
                  </div>
                  <div className="mb-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold" style={{ color: '#F2EDE6' }}>{g.away}</span>
                    <span className="text-xs" style={{ color: 'rgba(242,237,230,0.3)' }}>אורחת</span>
                  </div>
                </div>
              </motion.div>
            ))
        }
      </div>
    </section>
  );
};

export default Results;
