import React from 'react';
import { Link } from 'react-router-dom';
import type { TeamProfile } from '../../lib/queries';

const contrastText = (hex: string): string => {
  const m = hex.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return '#fff';
  const v = parseInt(m[1], 16);
  const r = (v >> 16) & 255;
  const g = (v >> 8) & 255;
  const b = v & 255;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? '#07080C' : '#fff';
};

const initials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
};

interface Props { team: TeamProfile }

const TeamHeader: React.FC<Props> = ({ team }) => {
  const accent = team.home_color || '#FF4D00';
  const titleColor = contrastText(accent);

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
        style={{ background: accent, border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="w-24 h-24 rounded-full shrink-0 flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.2)', color: titleColor }}
        >
          {team.logo
            ? <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
            : <span className="text-2xl font-black">{initials(team.name)}</span>}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-3xl font-black truncate" style={{ color: titleColor }}>{team.name}</h1>
          {(team.city || team.hall_address) && (
            <div className="text-sm" style={{ color: titleColor, opacity: 0.85 }}>
              {[team.city, team.hall_address].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamHeader;
