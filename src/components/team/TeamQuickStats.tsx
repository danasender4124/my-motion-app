import React from 'react';
import type { TeamSeasonStats } from '../../lib/aggregations';

interface Props { stats: TeamSeasonStats }

const Cell: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col items-center gap-1 flex-1">
    <span className="text-xs uppercase tracking-wider" style={{ color: 'rgba(242,237,230,0.5)' }}>{label}</span>
    <span className="text-2xl font-black tabular-nums" style={{ color: '#F2EDE6' }}>{value}</span>
  </div>
);

const TeamQuickStats: React.FC<Props> = ({ stats }) => (
  <div
    className="rounded-2xl p-6 flex items-stretch gap-4"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    dir="rtl"
  >
    <Cell label="מאזן" value={`${stats.wins}-${stats.losses}`} />
    <Cell label="מיקום" value={stats.position == null ? '—' : `#${stats.position}`} />
    <Cell label="קלעה" value={stats.points_for} />
    <Cell label="ספגה" value={stats.points_against} />
  </div>
);

export default TeamQuickStats;
