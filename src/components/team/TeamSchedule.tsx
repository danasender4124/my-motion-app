import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { GameWithTeams } from '../../lib/queries';

const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const formatTime = (t: string | null): string => (t ?? '').slice(0, 5);

interface Props { games: GameWithTeams[]; teamId: string }

const TeamSchedule: React.FC<Props> = ({ games, teamId }) => {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcoming = games.filter((g) => g.status === 'scheduled')
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  const past = games.filter((g) => g.status === 'played')
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

  if (games.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }} dir="rtl">
        טרם נקבע לוח משחקים
      </div>
    );
  }

  const visible = tab === 'upcoming' ? upcoming : past;

  return (
    <div dir="rtl">
      <h2 className="text-xl font-black mb-4" style={{ color: '#F2EDE6' }}>לוח משחקים</h2>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('upcoming')}
          className="px-4 py-1.5 rounded-full text-sm font-bold transition-colors"
          style={{
            background: tab === 'upcoming' ? '#FF4D00' : 'rgba(255,255,255,0.06)',
            color: tab === 'upcoming' ? '#fff' : 'rgba(242,237,230,0.6)',
            border: '1px solid ' + (tab === 'upcoming' ? '#FF4D00' : 'rgba(255,255,255,0.1)'),
          }}
        >
          משחקים עתידיים ({upcoming.length})
        </button>
        <button
          onClick={() => setTab('past')}
          className="px-4 py-1.5 rounded-full text-sm font-bold transition-colors"
          style={{
            background: tab === 'past' ? '#FF4D00' : 'rgba(255,255,255,0.06)',
            color: tab === 'past' ? '#fff' : 'rgba(242,237,230,0.6)',
            border: '1px solid ' + (tab === 'past' ? '#FF4D00' : 'rgba(255,255,255,0.1)'),
          }}
        >
          משחקים שהסתיימו ({past.length})
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>
          {tab === 'upcoming' ? 'אין משחקים עתידיים' : 'טרם התקיימו משחקים'}
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="grid items-center px-3 py-2 text-[10px] font-black uppercase tracking-wider"
            style={{
              gridTemplateColumns: tab === 'upcoming' ? '90px 60px 1fr 50px' : '90px 1fr 100px 50px',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(242,237,230,0.45)',
            }}
          >
            <span className="text-right">תאריך</span>
            {tab === 'upcoming' && <span className="text-center">שעה</span>}
            <span className="text-right">יריבה</span>
            {tab === 'past' && <span className="text-center">תוצאה</span>}
            <span className="text-center">משחק</span>
          </div>
          {visible.map((g, i) => {
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
                  gridTemplateColumns: tab === 'upcoming' ? '90px 60px 1fr 50px' : '90px 1fr 100px 50px',
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span className="text-right" style={{ color: 'rgba(242,237,230,0.7)' }}>{formatDate(g.date)}</span>
                {tab === 'upcoming' && (
                  <span className="text-center font-black" style={{ color: '#FF4D00' }}>{formatTime(g.time)}</span>
                )}
                <div className="flex items-center gap-2 min-w-0">
                  {isHome && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00' }}>בית</span>}
                  {!isHome && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(242,237,230,0.5)' }}>חוץ</span>}
                  {opp?.logo && <img src={opp.logo} alt={opp.name} style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />}
                  <span className="truncate" style={{ color: '#F2EDE6' }}>{opp?.name ?? '—'}</span>
                </div>
                {tab === 'past' && (
                  <span
                    className="text-center font-black tabular-nums"
                    style={{ color: won ? '#4ade80' : lost ? '#f87171' : 'rgba(242,237,230,0.4)' }}
                  >
                    {myScore != null && oppScore != null ? `${won ? 'נצ׳' : lost ? 'הפ׳' : 'ת׳'} ${myScore}-${oppScore}` : 'טרם שוחק'}
                  </span>
                )}
                <div className="text-center">
                  {tab === 'past' && g.status === 'played' ? (
                    <Link to={`/match/${g.id}`} style={{ color: '#FF4D00' }} title="פרטי משחק">↗</Link>
                  ) : (
                    <span style={{ color: 'rgba(242,237,230,0.25)' }}>↗</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamSchedule;
