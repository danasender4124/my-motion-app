import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePlayer, usePlayerStats, usePlayerSeasons, pickDefaultSeasonId, calcAverages } from '../lib/queries';
import PlayerHeader from '../components/player/PlayerHeader';
import SeasonAveragesCard from '../components/player/SeasonAveragesCard';
import PlayerGameLog from '../components/player/PlayerGameLog';
import SeasonPicker from '../components/ui/SeasonPicker';

const PlayerPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const { id } = useParams<{ id: string }>();

  // Season selector — seasons the player took part in, default the latest
  // where she has recorded stats (so arriving from the stats page shows data).
  const { data: playerSeasons = [] } = usePlayerSeasons(id);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const defaultSeasonId = pickDefaultSeasonId(playerSeasons);
  useEffect(() => {
    if (!seasonId && defaultSeasonId) setSeasonId(defaultSeasonId);
  }, [defaultSeasonId, seasonId]);

  const playerQ = usePlayer(id, seasonId);
  const statsQ = usePlayerStats(id, seasonId);

  if (playerQ.isLoading) {
    return (
      <div dir={dir} className="min-h-screen flex items-center justify-center" style={{ background: '#07080C' }}>
        <span style={{ color: 'rgba(242,237,230,0.5)' }}>{t('common.loading')}</span>
      </div>
    );
  }
  if (playerQ.error || !playerQ.data) {
    return (
      <div dir={dir} className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#07080C' }}>
        <span style={{ color: '#F2EDE6' }}>{t('player.not_found')}</span>
        <Link to="/results" style={{ color: '#FF4D00' }}>{t('player.back')}</Link>
      </div>
    );
  }

  const player = playerQ.data;
  const stats = statsQ.data ?? [];
  const averages = calcAverages(stats);

  return (
    <div dir={dir} className="min-h-screen pt-4 pb-16 px-4 md:px-8" style={{ background: '#07080C' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        {playerSeasons.length > 1 && (
          <SeasonPicker
            seasons={playerSeasons}
            value={seasonId}
            onChange={setSeasonId}
            placeholder={t('stats.pick_season')}
            label={t('team.season_label')}
            align="end"
          />
        )}
        <PlayerHeader player={player} />
        <SeasonAveragesCard averages={averages} />
        <PlayerGameLog rows={stats} playerTeamId={player.current_team?.id ?? null} />
      </div>
    </div>
  );
};

export default PlayerPage;
