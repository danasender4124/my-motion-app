import React from 'react';
import type { GameWithTeams } from '../../lib/queries';

interface Props { game: GameWithTeams }

const QuarterScoresTable: React.FC<Props> = ({ game }) => {
  if (!game.quarter_scores || game.quarter_scores.length === 0) return null;
  const qs = game.quarter_scores;

  const cols = `1.5fr ${qs.map(() => '1fr').join(' ')} 1fr`;

  const Header: React.FC = () => (
    <div
      className="grid items-center px-4 py-3 text-xs font-black tracking-wider uppercase"
      style={{ gridTemplateColumns: cols, background: 'rgba(255,255,255,0.05)', color: 'rgba(242,237,230,0.4)' }}
    >
      <span>קבוצה</span>
      {qs.map((q) => <span key={q.q} className="text-center">רבע {q.q}</span>)}
      <span className="text-center">סה״כ</span>
    </div>
  );

  const Row: React.FC<{ name: string; quarters: (number | null)[]; total: number | null; isWinner: boolean }> = ({ name, quarters, total, isWinner }) => (
    <div
      className="grid items-center px-4 py-3"
      style={{ gridTemplateColumns: cols, background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <span className="font-bold" style={{ color: '#F2EDE6' }}>{name}</span>
      {quarters.map((v, i) => (
        <span key={i} className="text-center tabular-nums" style={{ color: 'rgba(242,237,230,0.7)' }}>
          {v ?? '—'}
        </span>
      ))}
      <span className="text-center font-black tabular-nums" style={{ color: isWinner ? '#FF4D00' : '#F2EDE6' }}>
        {total ?? '—'}
      </span>
    </div>
  );

  const homeWon = (game.home_score ?? 0) > (game.away_score ?? 0);
  const awayWon = (game.away_score ?? 0) > (game.home_score ?? 0);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      dir="rtl"
    >
      <Header />
      <Row name={game.home_team?.name ?? '—'} quarters={qs.map((q) => q.home)} total={game.home_score} isWinner={homeWon} />
      <Row name={game.away_team?.name ?? '—'} quarters={qs.map((q) => q.away)} total={game.away_score} isWinner={awayWon} />
    </div>
  );
};

export default QuarterScoresTable;
