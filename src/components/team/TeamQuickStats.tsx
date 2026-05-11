import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TeamSeasonStats } from '../../lib/aggregations';

interface Props { stats: TeamSeasonStats }

const Cell: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col items-center gap-1 flex-1">
    <span className="text-xs uppercase tracking-wider" style={{ color: 'rgba(242,237,230,0.5)' }}>{label}</span>
    <span className="text-2xl font-black tabular-nums" style={{ color: '#F2EDE6' }}>{value}</span>
  </div>
);

const TeamQuickStats: React.FC<Props> = ({ stats }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  return (
  <div
    className="rounded-2xl p-6 flex items-stretch gap-4"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    dir={dir}
  >
    <Cell label={t('team.record')} value={`${stats.wins}-${stats.losses}`} />
    <Cell label={t('team.rank')} value={stats.position == null ? '—' : `#${stats.position}`} />
    <Cell label={t('team.pf')} value={stats.points_for} />
    <Cell label={t('team.pa')} value={stats.points_against} />
  </div>
  );
};

export default TeamQuickStats;
