import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TOP_SCORERS } from '../../data/league';
import SectionTabs, { Tab } from './SectionTabs';

type StatKey = 'ppg' | 'rpg' | 'apg';

const STAT_TABS: Tab[] = [
  { id: 'apg', label: 'אסיסטים' },
  { id: 'rpg', label: 'ריבאונדים' },
  { id: 'ppg', label: 'נקודות' },
];

const STAT_LABELS: Record<StatKey, string> = {
  ppg: 'נקודות למשחק',
  rpg: 'ריבאונדים למשחק',
  apg: 'אסיסטים למשחק',
};

const Stats: React.FC = () => {
  const [stat, setStat] = useState<StatKey>('ppg');

  const sorted = [...TOP_SCORERS].sort((a, b) => b[stat] - a[stat]);
  const maxVal = sorted[0][stat];

  return (
    <section id="stats" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-center mb-10">
        <SectionTabs
          tabs={STAT_TABS}
          active={stat}
          onChange={(id) => setStat(id as StatKey)}
        />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-4 py-4 text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(242,237,230,0.4)' }}>
          {STAT_LABELS[stat]} · עונה סדירה
        </div>

        {sorted.map((player, i) => (
          <motion.div
            key={player.name}
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: [0.25, 1, 0.5, 1] }}
            className="flex items-center gap-4 px-4 py-5"
            style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
          >
            {/* Rank */}
            <span
              className="text-lg font-black w-6 text-center shrink-0"
              style={{ color: i === 0 ? '#FF4D00' : 'rgba(242,237,230,0.3)' }}
            >
              {i + 1}
            </span>

            {/* Info */}
            <div className="flex flex-col min-w-0 shrink-0" style={{ width: '140px' }}>
              <span className="text-sm font-bold truncate" style={{ color: '#F2EDE6' }}>{player.name}</span>
              <span className="text-xs truncate" style={{ color: 'rgba(242,237,230,0.4)' }}>{player.team}</span>
            </div>

            {/* Bar */}
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: '6px', background: 'rgba(255,255,255,0.07)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: i === 0 ? '#FF4D00' : '#FFB300' }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(player[stat] / maxVal) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.05 + 0.2, ease: [0.25, 1, 0.5, 1] }}
                />
              </div>
              <span
                className="text-base font-black tabular-nums shrink-0"
                style={{ color: i === 0 ? '#FF4D00' : '#F2EDE6', minWidth: '3rem', textAlign: 'left' }}
              >
                {player[stat].toFixed(1)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
