import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { GameWithTeams } from '../../lib/queries';
import { teamName } from '../../lib/displayName';
import SectionTitle from '../ui/SectionTitle';

const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const formatTime = (t: string | null): string => (t ?? '').slice(0, 5);

interface Props { games: GameWithTeams[]; teamId: string }

const TeamSchedule: React.FC<Props> = ({ games, teamId }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcoming = games.filter((g) => g.status === 'scheduled')
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  const past = games.filter((g) => g.status === 'played')
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

  // Archived seasons have no upcoming games — land on the results tab instead
  // of an empty "upcoming" view.
  useEffect(() => {
    if (upcoming.length === 0 && past.length > 0) setTab('past');
    else if (upcoming.length > 0) setTab('upcoming');
  }, [upcoming.length, past.length]);

  if (games.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }} dir={dir}>
        {t('team.sched_no_schedule')}
      </div>
    );
  }

  const visible = tab === 'upcoming' ? upcoming : past;

  return (
    <div dir={dir}>
      <SectionTitle>{t('team.schedule')}</SectionTitle>

      {/* Sub-tabs — same segmented pill language as the site-wide tabs */}
      <div
        className="inline-flex items-center gap-1 p-1 rounded-full mb-4"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {([['upcoming', `${t('team.sched_upcoming')} (${upcoming.length})`], ['past', `${t('team.sched_past')} (${past.length})`]] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="px-4 py-1.5 rounded-full text-sm transition-all duration-200 active:scale-[0.98]"
            style={{
              background: tab === id ? 'var(--grad-orange)' : 'transparent',
              color: tab === id ? '#fff' : 'rgba(242,237,230,0.6)',
              fontWeight: tab === id ? 800 : 500,
              boxShadow: tab === id ? 'var(--sheen-top), 0 4px 12px rgba(214,60,0,0.3)' : 'none',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>
          {tab === 'upcoming' ? t('team.sched_no_upcoming') : t('team.sched_no_past')}
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
            <span className="text-right">{t('team.col_date')}</span>
            {tab === 'upcoming' && <span className="text-center">{t('team.col_time')}</span>}
            <span className="text-right">{t('team.col_opp')}</span>
            {tab === 'past' && <span className="text-center">{t('team.col_score')}</span>}
            <span className="text-center">{t('team.col_match')}</span>
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
                  {isHome && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00' }}>{t('team.venue_home')}</span>}
                  {!isHome && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(242,237,230,0.5)' }}>{t('team.venue_away')}</span>}
                  {opp?.logo
                    ? <img src={opp.logo} alt={opp.name} loading="lazy" style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />
                    : <span style={{ width: 22, height: 22, flexShrink: 0, borderRadius: 4, background: 'rgba(255,255,255,0.06)', display: 'inline-block' }} />}
                  <span className="truncate" style={{ color: '#F2EDE6' }}>{teamName(opp)}</span>
                </div>
                {tab === 'past' && (
                  <span
                    className="text-center font-black tabular-nums"
                    style={{ color: won ? '#4ade80' : lost ? '#f87171' : 'rgba(242,237,230,0.4)' }}
                  >
                    {myScore != null && oppScore != null ? `${won ? t('team.result_won') : lost ? t('team.result_lost') : t('team.result_tie')} ${myScore}-${oppScore}` : t('team.not_played')}
                  </span>
                )}
                <div className="text-center">
                  {tab === 'past' && g.status === 'played' ? (
                    <Link to={`/match/${g.id}`} style={{ color: '#FF4D00' }} title={t('team.game_details')}>↗</Link>
                  ) : (
                    <span style={{ color: 'rgba(242,237,230,0.4)' }}>↗</span>
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
