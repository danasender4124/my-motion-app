import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TeamLeaders, LeaderRow } from '../../lib/queries';

const initials = (first: string, last: string) =>
  (first?.[0] ?? '') + (last?.[0] ?? '');

const Card: React.FC<{ label: string; suffix: string; row: LeaderRow | null }> = ({ label, suffix, row }) => (
  <div
    className="rounded-2xl overflow-hidden flex flex-col flex-1 min-w-[160px] transition-transform hover:-translate-y-0.5"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
  >
    <div
      className="px-4 py-2 text-xs font-black uppercase tracking-wider text-center"
      style={{ background: 'rgba(255,77,0,0.14)', color: '#FF4D00', borderBottom: '1px solid rgba(255,77,0,0.2)' }}
    >
      {label}
    </div>
    {row ? (
      <Link to={`/player/${row.player_id}`} className="flex flex-col items-center gap-2.5 px-4 py-5">
        <div
          className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(255,77,0,0.35)' }}
        >
          {row.photo
            ? <img src={row.photo} alt={`${row.first_name} ${row.last_name}`} loading="lazy" className="w-full h-full object-cover" style={{ objectPosition: 'center top' }} />
            : <span className="text-lg font-black" style={{ color: 'rgba(242,237,230,0.55)' }}>{initials(row.first_name, row.last_name)}</span>}
        </div>
        <span className="text-sm font-bold text-center leading-tight" style={{ color: '#F2EDE6' }}>
          {row.first_name} {row.last_name}
        </span>
        <span className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black tabular-nums" style={{ color: '#FF4D00' }}>{row.avg.toFixed(1)}</span>
          <span className="text-[11px]" style={{ color: 'rgba(242,237,230,0.45)' }}>{suffix}</span>
        </span>
      </Link>
    ) : (
      <span className="text-sm py-10 text-center" style={{ color: 'rgba(242,237,230,0.4)' }}>—</span>
    )}
  </div>
);

interface Props { leaders: TeamLeaders }

const TeamLeadersSection: React.FC<Props> = ({ leaders }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  if (!leaders.ppg && !leaders.rpg && !leaders.apg) return null;
  return (
    <div dir={dir}>
      <h2 className="text-xl font-black mb-4" style={{ color: '#F2EDE6' }}>{t('team.leaders')}</h2>
      <div className="flex flex-wrap gap-3">
        <Card label={t('team.leader_points')}   suffix={t('team.per_game')} row={leaders.ppg} />
        <Card label={t('team.leader_rebounds')} suffix={t('team.per_game')} row={leaders.rpg} />
        <Card label={t('team.leader_assists')}  suffix={t('team.per_game')} row={leaders.apg} />
      </div>
    </div>
  );
};

export default TeamLeadersSection;
