import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TeamProfile } from '../../lib/queries';
import type { TeamSeasonStats } from '../../lib/aggregations';

const initials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
};

// Very dark team colors disappear on the dark page background — fall back to
// the brand orange for the accent glow in that case.
const accentFor = (hex: string | null): string => {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return '#FF4D00';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma < 40 ? '#FF4D00' : hex;
};

const StatTile: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div
    className="flex flex-col items-center gap-1 px-4 py-3 flex-1 min-w-[80px]"
    style={{ background: 'rgba(7,8,12,0.55)' }}
  >
    <span className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(242,237,230,0.5)' }}>
      {label}
    </span>
    <span className="text-2xl md:text-3xl font-black tabular-nums" style={{ color: '#F2EDE6' }}>
      {value}
    </span>
  </div>
);

interface Props {
  team: TeamProfile;
  stats?: TeamSeasonStats | null;
}

const TeamHeader: React.FC<Props> = ({ team, stats }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const accent = accentFor(team.home_color);

  return (
    <div dir={dir} className="space-y-4">
      <Link
        to="/standings"
        className="text-sm inline-flex items-center gap-1 transition-colors hover:text-white"
        style={{ color: 'rgba(242,237,230,0.5)' }}
      >
        {t('team.back_to_standings')}
      </Link>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Team-color accent bar */}
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(to left, ${accent}, transparent)` }} />

        {/* Identity row */}
        <div
          className="p-6 md:p-8 flex items-center gap-5 md:gap-7"
          style={{
            background: `radial-gradient(ellipse 60% 120% at ${dir === 'rtl' ? '85%' : '15%'} 0%, ${accent}22 0%, transparent 65%)`,
          }}
        >
          <div
            className="w-20 h-20 md:w-28 md:h-28 rounded-full shrink-0 flex items-center justify-center overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: `2px solid ${accent}55`,
              boxShadow: `0 0 32px ${accent}33`,
            }}
          >
            {team.logo
              ? <img src={team.logo} alt={team.name} className="w-full h-full object-contain p-1.5" />
              : <span className="text-2xl font-black" style={{ color: 'rgba(242,237,230,0.6)' }}>{initials(team.name)}</span>}
          </div>
          <div className="flex flex-col gap-1.5 min-w-0">
            <h1 className="text-2xl md:text-4xl font-black leading-tight" style={{ color: '#F2EDE6' }}>
              {team.name}
            </h1>
            {(team.city || team.hall_address) && (
              <div className="text-sm flex items-center gap-1.5" style={{ color: 'rgba(242,237,230,0.55)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="truncate">{[team.city, team.hall_address].filter(Boolean).join(' · ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Integrated season stats strip */}
        {stats && (
          <div
            className="flex flex-wrap items-stretch gap-px"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.07)',
            }}
          >
            <StatTile label={t('team.record')} value={`${stats.wins}-${stats.losses}`} />
            <StatTile label={t('team.rank')} value={stats.position == null ? '—' : `#${stats.position}`} />
            <StatTile label={t('team.pf')} value={stats.points_for} />
            <StatTile label={t('team.pa')} value={stats.points_against} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamHeader;
