import React from 'react';
import { Link } from 'react-router-dom';
import type { TeamProfile } from '../../lib/queries';

const initials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
};

interface Props { team: TeamProfile }

const TeamHeader: React.FC<Props> = ({ team }) => {
  return (
    <div dir="rtl" className="space-y-4">
      <Link
        to="/standings"
        className="text-sm flex items-center gap-1"
        style={{ color: 'rgba(242,237,230,0.5)' }}
      >
        ← חזרה לטבלת הליגה
      </Link>
      <div
        className="rounded-2xl p-8 flex items-center gap-6"
        style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)' }}
      >
        <div
          className="w-24 h-24 rounded-full shrink-0 flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.04)', color: '#07080C' }}
        >
          {team.logo
            ? <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
            : <span className="text-2xl font-black">{initials(team.name)}</span>}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-3xl font-black truncate" style={{ color: '#07080C' }}>{team.name}</h1>
          {(team.city || team.hall_address) && (
            <div className="text-sm" style={{ color: 'rgba(7,8,12,0.6)' }}>
              {[team.city, team.hall_address].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamHeader;
