import React from 'react';
import { Link } from 'react-router-dom';
import type { GameWithTeams } from '../../lib/queries';

const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

interface Props { games: GameWithTeams[]; teamId: string }

const TeamSchedule: React.FC<Props> = ({ games, teamId }) => {
  if (games.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }} dir="rtl">
        טרם נקבע לוח משחקים
      </div>
    );
  }
  return (
    <div dir="rtl">
      <h2 className="text-xl font-black mb-4" style={{ color: '#F2EDE6' }}>לוח משחקים</h2>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="grid items-center px-3 py-2 text-[10px] font-black uppercase tracking-wider"
          style={{ gridTemplateColumns: '90px 1fr 100px 50px', background: 'rgba(255,255,255,0.05)', color: 'rgba(242,237,230,0.45)' }}
        >
          <span className="text-right">תאריך</span>
          <span className="text-right">יריבה</span>
          <span className="text-center">תוצאה</span>
          <span className="text-center">משחק</span>
        </div>
        {games.map((g, i) => {
          const isHome = g.home_team_id === teamId;
          const opp = isHome ? g.away_team : g.home_team;
          const myScore = isHome ? g.home_score : g.away_score;
          const oppScore = isHome ? g.away_score : g.home_score;
          const won = myScore != null && oppScore != null && myScore > oppScore;
          const lost = myScore != null && oppScore != null && myScore < oppScore;
          return (
            <div
              key={g.id}
              className="grid items-center px-3 py-2 text-sm"
              style={{
                gridTemplateColumns: '90px 1fr 100px 50px',
                background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span className="text-right" style={{ color: 'rgba(242,237,230,0.7)' }}>{formatDate(g.date)}</span>
              <div className="flex items-center gap-2 min-w-0">
                {opp?.logo && <img src={opp.logo} alt={opp.name} style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />}
                <span className="truncate" style={{ color: '#F2EDE6' }}>{opp?.name ?? '—'}</span>
              </div>
              <span className="text-center font-black tabular-nums" style={{ color: won ? '#4ade80' : lost ? '#f87171' : 'rgba(242,237,230,0.4)' }}>
                {g.status === 'played' && myScore != null && oppScore != null
                  ? `${won ? 'נצ׳' : lost ? 'הפ׳' : 'ת׳'} ${myScore}-${oppScore}`
                  : 'טרם שוחק'}
              </span>
              <div className="text-center">
                {g.status === 'played' ? (
                  <Link to={`/match/${g.id}`} style={{ color: '#FF4D00' }} title="פרטי משחק">↗</Link>
                ) : (
                  <span style={{ color: 'rgba(242,237,230,0.25)' }}>↗</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamSchedule;
