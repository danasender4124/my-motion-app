import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGameLineupPublic } from '../../lib/queries';

const initials = (first: string, last: string) =>
  (first?.[0] ?? '') + (last?.[0] ?? '');

const TeamLineupColumn: React.FC<{
  gameId: string;
  teamId: string;
  teamName: string;
  teamLogo: string | null;
  seasonId: string | null;
}> = ({ gameId, teamId, teamName, teamLogo, seasonId }) => {
  const { t } = useTranslation();
  const lineupQ = useGameLineupPublic(gameId, teamId, seasonId);

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {teamLogo ? (
          <img src={teamLogo} alt={teamName} className="w-10 h-10 object-contain" />
        ) : (
          <div className="w-10 h-10 rounded bg-white/5" />
        )}
        <div className="font-bold text-lg" style={{ color: '#F2EDE6' }}>{teamName}</div>
      </div>

      {lineupQ.isLoading ? (
        <div className="text-sm" style={{ color: 'rgba(242,237,230,0.4)' }}>{t('match.loading_lineup')}</div>
      ) : !lineupQ.data?.submitted_at ? (
        <div
          className="text-sm py-3 text-center rounded"
          style={{ background: 'rgba(255,77,0,0.08)', color: '#FF4D00', border: '1px solid rgba(255,77,0,0.2)' }}
        >
          {t('match.no_lineup')}
        </div>
      ) : (
        <>
          <div className="text-xs font-bold mb-3" style={{ color: '#4ade80' }}>
            {t('match.lineup_published', { count: lineupQ.data.players.length })}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {lineupQ.data.players.map((p) => (
              <div
                key={p.id}
                className="rounded-xl p-2 flex flex-col items-center gap-1.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div
                  className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  {p.photo
                    ? <img src={p.photo} alt={`${p.first_name} ${p.last_name}`} className="w-full h-full object-cover" />
                    : <span className="text-sm font-black" style={{ color: 'rgba(242,237,230,0.5)' }}>{initials(p.first_name, p.last_name)}</span>}
                </div>
                {p.jersey_number != null && (
                  <div className="text-xs font-black" style={{ color: '#FF4D00' }}>#{p.jersey_number}</div>
                )}
                <div className="text-[11px] text-center truncate w-full" style={{ color: '#F2EDE6' }}>
                  {p.first_name} {p.last_name}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface Props {
  gameId: string;
  homeTeamId: string;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamLogo: string | null;
  seasonId: string | null;
}

const MatchLineups: React.FC<Props> = ({
  gameId,
  homeTeamId,
  homeTeamName,
  homeTeamLogo,
  awayTeamId,
  awayTeamName,
  awayTeamLogo,
  seasonId,
}) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  return (
    <section dir={dir}>
      <h2 className="text-xl font-black mb-4" style={{ color: '#F2EDE6' }}>{t('match.lineups_title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TeamLineupColumn
          gameId={gameId}
          teamId={homeTeamId}
          teamName={homeTeamName}
          teamLogo={homeTeamLogo}
          seasonId={seasonId}
        />
        <TeamLineupColumn
          gameId={gameId}
          teamId={awayTeamId}
          teamName={awayTeamName}
          teamLogo={awayTeamLogo}
          seasonId={seasonId}
        />
      </div>
    </section>
  );
};

export default MatchLineups;
