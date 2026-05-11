import React from 'react';
import { useTranslation } from 'react-i18next';
import type { SeasonAverages } from '../../lib/queries';

const Stat: React.FC<{ value: number | string; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center px-4">
    <span className="text-3xl font-black tabular-nums" style={{ color: '#F2EDE6' }}>{value}</span>
    <span className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(242,237,230,0.45)' }}>{label}</span>
  </div>
);

interface Props { averages: SeasonAverages }

const SeasonAveragesCard: React.FC<Props> = ({ averages }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  return (
  <div
    className="rounded-2xl p-6"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    dir={dir}
  >
    <div className="flex items-center justify-around flex-wrap gap-4">
      <Stat value={averages.ppg} label={t('player.pts')} />
      <Stat value={averages.rpg} label={t('player.reb')} />
      <Stat value={averages.apg} label={t('player.ast')} />
      <Stat value={averages.spg} label={t('player.stl')} />
      <Stat value={averages.eff_avg} label={t('player.eff')} />
    </div>
    <div
      className="mt-3 pt-3 text-center text-sm"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(242,237,230,0.5)' }}
    >
      {t('player.games_played')}: {averages.games} · {t('player.avg_minutes')}: {averages.mpg}
    </div>
  </div>
  );
};

export default SeasonAveragesCard;
