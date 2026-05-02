import React from 'react';
import type { PlayerGameStat } from '../../lib/queries';

const fg = (m: number | null, a: number | null) => (m == null || a == null ? '—' : `${m}-${a}`);
const safe = (n: number | null) => (n == null ? '—' : n);

const sumKey = (rows: PlayerGameStat[], key: keyof PlayerGameStat): number =>
  rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);

const COLS = '40px 1.6fr 50px 50px 70px 70px 70px 50px 50px 50px 50px 50px 50px 50px 60px';

interface Props {
  teamName: string;
  teamLogo: string | null;
  teamColor: string | null;
  rows: PlayerGameStat[];
}

// Returns black for light hex backgrounds, white for dark — using YIQ luminance.
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

const BoxScoreTable: React.FC<Props> = ({ teamName, teamLogo, teamColor, rows }) => {
  const header = '# שחקנית דק׳ נק׳ 2נק 3נק עונשין רבד רבת אס חט חס איב עב מדד'.split(' ');
  const accent = teamColor || '#FF4D00';
  const titleTextColor = contrastText(accent);

  const Cell: React.FC<{ children: React.ReactNode; bold?: boolean }> = ({ children, bold }) => (
    <span className={`text-center tabular-nums ${bold ? 'font-black' : ''}`} style={{ color: bold ? '#F2EDE6' : 'rgba(242,237,230,0.7)' }}>
      {children}
    </span>
  );

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }} dir="rtl">
      {/* Team title bar */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: accent }}>
        {teamLogo && (
          <div className="w-8 h-8 rounded shrink-0 bg-white/20 flex items-center justify-center overflow-hidden">
            <img src={teamLogo} alt={teamName} className="w-full h-full object-contain" />
          </div>
        )}
        <span className="font-black" style={{ color: titleTextColor }}>{teamName}</span>
      </div>

      {/* Header row */}
      <div
        className="grid items-center px-3 py-2 text-[10px] font-black uppercase tracking-wider overflow-x-auto"
        style={{ gridTemplateColumns: COLS, background: 'rgba(255,255,255,0.05)', color: 'rgba(242,237,230,0.45)', minWidth: '900px' }}
      >
        {header.map((h, i) => (
          <span key={i} className={i === 1 ? 'text-right' : 'text-center'}>{h}</span>
        ))}
      </div>

      {/* Player rows */}
      <div className="overflow-x-auto">
      {rows.map((s, i) => (
        <div
          key={s.id}
          className="grid items-center px-3 py-2 text-sm"
          style={{
            gridTemplateColumns: COLS,
            background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            minWidth: '900px',
          }}
        >
          <Cell>{/* jersey not stored in player_game_stats — leave dash */}—</Cell>
          <span className="text-right truncate" style={{ color: '#F2EDE6' }}>
            {s.player ? `${s.player.first_name} ${s.player.last_name}` : '—'}
          </span>
          <Cell>{safe(s.minutes)}</Cell>
          <Cell bold>{safe(s.points)}</Cell>
          <Cell>{fg(s.fg2_made, s.fg2_attempted)}</Cell>
          <Cell>{fg(s.fg3_made, s.fg3_attempted)}</Cell>
          <Cell>{fg(s.ft_made, s.ft_attempted)}</Cell>
          <Cell>{safe(s.defensive_rebounds)}</Cell>
          <Cell>{safe(s.offensive_rebounds)}</Cell>
          <Cell>{safe(s.assists)}</Cell>
          <Cell>{safe(s.steals)}</Cell>
          <Cell>{safe(s.blocks)}</Cell>
          <Cell>{safe(s.turnovers)}</Cell>
          <Cell>{safe(s.fouls)}</Cell>
          <Cell bold>{safe(s.efficiency)}</Cell>
        </div>
      ))}

      {/* Totals */}
      {rows.length > 0 && (
        <div
          className="grid items-center px-3 py-3 text-sm font-black"
          style={{
            gridTemplateColumns: COLS,
            background: 'rgba(255,77,0,0.07)',
            borderTop: '2px solid rgba(255,77,0,0.4)',
            minWidth: '900px',
          }}
        >
          <span></span>
          <span className="text-right" style={{ color: '#F2EDE6' }}>סה״כ</span>
          <Cell bold>{sumKey(rows, 'minutes')}</Cell>
          <Cell bold>{sumKey(rows, 'points')}</Cell>
          <span className="text-center tabular-nums">{sumKey(rows, 'fg2_made')}-{sumKey(rows, 'fg2_attempted')}</span>
          <span className="text-center tabular-nums">{sumKey(rows, 'fg3_made')}-{sumKey(rows, 'fg3_attempted')}</span>
          <span className="text-center tabular-nums">{sumKey(rows, 'ft_made')}-{sumKey(rows, 'ft_attempted')}</span>
          <Cell bold>{sumKey(rows, 'defensive_rebounds')}</Cell>
          <Cell bold>{sumKey(rows, 'offensive_rebounds')}</Cell>
          <Cell bold>{sumKey(rows, 'assists')}</Cell>
          <Cell bold>{sumKey(rows, 'steals')}</Cell>
          <Cell bold>{sumKey(rows, 'blocks')}</Cell>
          <Cell bold>{sumKey(rows, 'turnovers')}</Cell>
          <Cell bold>{sumKey(rows, 'fouls')}</Cell>
          <Cell bold>{sumKey(rows, 'efficiency')}</Cell>
        </div>
      )}
      </div>
    </div>
  );
};

export default BoxScoreTable;
