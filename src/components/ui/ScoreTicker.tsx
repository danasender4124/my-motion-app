import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { RECENT_RESULTS } from '../../data/league';

const ScoreTicker: React.FC = () => {
  const { t, i18n } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);
  const direction: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';

  // Duplicate items for seamless loop
  const items = [...RECENT_RESULTS, ...RECENT_RESULTS];

  return (
    <div
      className="w-full overflow-hidden"
      style={{ background: '#FF4D00', height: '36px', direction }}
    >
      <div
        ref={trackRef}
        className="flex items-center gap-0 h-full"
        style={{
          animation: 'ticker 28s linear infinite',
          whiteSpace: 'nowrap',
          width: 'max-content',
        }}
      >
        {items.map((game, i) => {
          const homeWon = game.homeScore > game.awayScore;
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-6 border-r"
              style={{
                borderColor: 'rgba(255,255,255,0.25)',
                height: '36px',
                fontSize: '13px',
                color: '#fff',
                fontWeight: 500,
              }}
            >
              <span style={{ fontWeight: homeWon ? 800 : 400 }}>{game.home}</span>
              <span
                className="px-2 py-0.5 rounded text-xs font-black tabular-nums"
                style={{ background: 'rgba(0,0,0,0.2)', letterSpacing: '0.05em' }}
              >
                {game.homeScore}–{game.awayScore}
              </span>
              <span style={{ fontWeight: !homeWon ? 800 : 400 }}>{game.away}</span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px' }}>
                {t('results.col_round')} {game.round}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default ScoreTicker;
