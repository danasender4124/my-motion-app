import React from 'react';
import { Link } from 'react-router-dom';
import type { LeagueLeaderRow } from '../../lib/queries';

interface Props {
  label: string;
  rows: LeagueLeaderRow[];
  /** Format the numeric value for display. Defaults to one decimal. */
  formatValue?: (n: number) => string;
}

const defaultFormat = (n: number) => n.toFixed(1);

const LeaderCard: React.FC<Props> = ({ label, rows, formatValue = defaultFormat }) => (
  <div
    className="rounded-xl overflow-hidden flex flex-col"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    dir="rtl"
  >
    <div
      className="px-3 py-2 text-sm font-black text-center"
      style={{ background: '#FF4D00', color: '#fff' }}
    >
      {label}
    </div>
    {rows.length === 0 ? (
      <div className="px-3 py-6 text-center text-xs" style={{ color: 'rgba(242,237,230,0.4)' }}>
        אין נתונים מספיקים
      </div>
    ) : (
      <ul className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {rows.map((r, i) => (
          <li
            key={r.player_id}
            className="flex items-center gap-2 px-3 py-2 text-sm"
            style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined }}
          >
            <Link
              to={`/player/${r.player_id}`}
              className="flex-1 truncate"
              style={{ color: i === 0 ? '#FF4D00' : 'rgba(242,237,230,0.85)', fontWeight: i === 0 ? 700 : 500 }}
            >
              {r.first_name} {r.last_name}
            </Link>
            <span
              className="tabular-nums shrink-0"
              style={{ color: i === 0 ? '#FF4D00' : '#F2EDE6', fontWeight: 800 }}
            >
              {formatValue(r.value)}
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default LeaderCard;
