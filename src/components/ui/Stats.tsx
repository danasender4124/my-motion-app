import React, { useState, useMemo, useEffect } from 'react';
import SectionTabs, { Tab } from './SectionTabs';
import LeadersGrid from '../stats/LeadersGrid';
import { useLeagueLeaders, useSeasonsWithGames } from '../../lib/queries';

const Stats: React.FC = () => {
  const { data: seasons = [] } = useSeasonsWithGames();

  const tabs: Tab[] = useMemo(
    () => seasons.map((s) => ({ id: s.id, label: s.name })),
    [seasons]
  );

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
    <section id="stats" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">
      {tabs.length > 1 && (
        <div className="flex justify-center mb-10">
          <SectionTabs
            tabs={tabs}
            active={seasonId ?? ''}
            onChange={(id) => setSeasonId(id)}
          />
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>טוען...</div>
      )}
      {error && (
        <div className="text-center py-12" style={{ color: '#f87171' }}>לא ניתן לטעון סטטיסטיקות כעת.</div>
      )}
      {data && <LeadersGrid leaders={data} />}
    </section>
  );
};

export default Stats;
