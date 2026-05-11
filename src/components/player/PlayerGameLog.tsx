import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { PlayerStatRow } from '../../lib/queries';

const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const COLS = '110px 1fr 110px 50px 50px 50px 50px 50px 50px';

interface Props {
  rows: PlayerStatRow[];
  playerTeamId?: string | null;
}

const PlayerGameLog: React.FC<Props> = ({ rows, playerTeamId }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  if (rows.length === 0) {
    return (
      <div
        className="rounded-2xl py-12 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.10)', color: 'rgba(242,237,230,0.5)' }}
        dir={dir}
      >
        {t('player.no_stats')}
      </div>
    );
  }

  const Header: React.FC = () => (
    <div
      className="grid items-center px-4 py-3 text-xs font-black uppercase tracking-wider"
      style={{ gridTemplateColumns: COLS, background: 'rgba(255,255,255,0.05)', color: 'rgba(242,237,230,0.45)' }}
    >
      <span>{t('player.date')}</span>
      <span>{t('player.opponent')}</span>
      <span>{t('player.score')}</span>
      <span className="text-center">{t('player.min')}</span>
      <span className="text-center">{t('player.pts')}</span>
      <span className="text-center">{t('player.reb')}</span>
      <span className="text-center">{t('player.ast')}</span>
      <span className="text-center">{t('player.eff')}</span>
      <span className="text-center">{t('player.game')}</span>
    </div>
  );

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      dir={dir}
    >
      <Header />
      {rows.map((r, i) => {
        const game = r.game;
        const opp = playerTeamId
          ? (game?.home_team_id === playerTeamId ? game?.away_team : game?.home_team)
          : game?.away_team;
        const teamScore = playerTeamId && game
          ? (game.home_team_id === playerTeamId ? game.home_score : game.away_score)
          : null;
        const oppScore = playerTeamId && game
          ? (game.home_team_id === playerTeamId ? game.away_score : game.home_score)
          : null;
        const result = teamScore != null && oppScore != null
          ? `${teamScore > oppScore ? t('player.result_won') : t('player.result_lost')} ${teamScore}-${oppScore}`
          : '—';
        const resultColor = teamScore != null && oppScore != null
          ? (teamScore > oppScore ? '#4ade80' : '#f87171')
          : 'rgba(242,237,230,0.5)';
        return (
          <div
            key={r.game_id}
            className="grid items-center px-4 py-3 text-sm"
            style={{
              gridTemplateColumns: COLS,
              background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <span className="tabular-nums" style={{ color: 'rgba(242,237,230,0.7)' }}>{formatDate(game?.date ?? null)}</span>
            <span style={{ color: '#F2EDE6' }}>{opp?.name ?? '—'}</span>
            <span className="tabular-nums" style={{ color: resultColor }}>{result}</span>
            <span className="text-center tabular-nums" style={{ color: 'rgba(242,237,230,0.7)' }}>{r.minutes ?? '—'}</span>
            <span className="text-center tabular-nums font-bold" style={{ color: '#F2EDE6' }}>{r.points ?? '—'}</span>
            <span className="text-center tabular-nums" style={{ color: 'rgba(242,237,230,0.7)' }}>{r.rebounds ?? '—'}</span>
            <span className="text-center tabular-nums" style={{ color: 'rgba(242,237,230,0.7)' }}>{r.assists ?? '—'}</span>
            <span className="text-center tabular-nums" style={{ color: 'rgba(242,237,230,0.7)' }}>{r.efficiency ?? '—'}</span>
            <span className="text-center">
              <Link
                to={`/match/${r.game_id}`}
                className="inline-flex items-center justify-center w-7 h-7 rounded"
                style={{ color: '#FF4D00', background: 'rgba(255,77,0,0.12)' }}
                aria-label={t('player.watch_game')}
              >
                ↗
              </Link>
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default PlayerGameLog;
