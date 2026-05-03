import React from 'react';
import { Link } from 'react-router-dom';
import type { TeamLeaders, LeaderRow } from '../../lib/queries';

const initials = (first: string, last: string) =>
  (first?.[0] ?? '') + (last?.[0] ?? '');

const Card: React.FC<{ label: string; row: LeaderRow | null }> = ({ label, row }) => (
  <div
    className="rounded-xl p-4 flex flex-col items-center gap-2 flex-1"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
  >
    <span className="text-xs uppercase tracking-wider" style={{ color: 'rgba(242,237,230,0.5)' }}>{label}</span>
    {row ? (
      <Link to={`/player/${row.player_id}`} className="flex flex-col items-center gap-2">
        <div
          className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          {row.photo
            ? <img src={row.photo} alt={`${row.first_name} ${row.last_name}`} className="w-full h-full object-cover" />
            : <span className="text-sm font-black" style={{ color: 'rgba(242,237,230,0.55)' }}>{initials(row.first_name, row.last_name)}</span>}
        </div>
        <span className="text-sm font-semibold" style={{ color: '#F2EDE6' }}>{row.first_name} {row.last_name}</span>
        <span className="text-2xl font-black tabular-nums" style={{ color: '#FF4D00' }}>{row.avg.toFixed(1)}</span>
      </Link>
    ) : (
      <span className="text-sm py-6" style={{ color: 'rgba(242,237,230,0.4)' }}>—</span>
    )}
  </div>
);

interface Props { leaders: TeamLeaders }

const TeamLeaders: React.FC<Props> = ({ leaders }) => {
  if (!leaders.ppg && !leaders.rpg && !leaders.apg) return null;
  return (
    <div dir="rtl">
      <h2 className="text-xl font-black mb-4" style={{ color: '#F2EDE6' }}>מובילות הקבוצה</h2>
      <div className="flex gap-3">
        <Card label="נקודות" row={leaders.ppg} />
        <Card label="ריבאונדים" row={leaders.rpg} />
        <Card label="אסיסטים" row={leaders.apg} />
      </div>
    </div>
  );
};

export default TeamLeaders;
