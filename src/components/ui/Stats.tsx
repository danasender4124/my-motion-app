import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LeadersGrid from '../stats/LeadersGrid';
import SeasonPicker from './SeasonPicker';
import { SkeletonCardGrid } from './Skeleton';
import { useLeagueLeaders, useSeasonsWithGames } from '../../lib/queries';

const Stats: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const { data: seasons = [] } = useSeasonsWithGames();

  const defaultSeasonId = useMemo(() => {
    const active = seasons.find((s) => s.status === 'active');
    return active?.id ?? seasons[0]?.id ?? null;
  }, [seasons]);

  const [seasonId, setSeasonId] = useState<string | null>(null);
  useEffect(() => {
    if (!seasonId && defaultSeasonId) setSeasonId(defaultSeasonId);
  }, [defaultSeasonId, seasonId]);

  const { data, isLoading, error } = useLeagueLeaders(seasonId);

  return (
    <section id="stats" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir={dir}>
      <div className="flex justify-center mb-10">
        <SeasonPicker
          seasons={seasons}
          value={seasonId}
          onChange={setSeasonId}
          placeholder={t('stats.pick_season')}
        />
      </div>

      {isLoading && <SkeletonCardGrid cards={10} cardHeight={220} />}
      {error && (
        <div className="text-center py-12" style={{ color: '#f87171' }}>{t('stats.error')}</div>
      )}
      {data && <LeadersGrid leaders={data} />}
    </section>
  );
};

export default Stats;
