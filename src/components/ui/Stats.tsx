import React, { useState } from 'react';
import SectionTabs, { Tab } from './SectionTabs';
import LeadersGrid from '../stats/LeadersGrid';
import { useLeagueLeaders, type SeasonStage } from '../../lib/queries';

const STAGE_TABS: Tab[] = [
  { id: 'regular', label: 'עונה סדירה' },
  { id: 'all',     label: 'כל העונה' },
];

const Stats: React.FC = () => {
  const [stage, setStage] = useState<SeasonStage>('regular');
  const { data, isLoading, error } = useLeagueLeaders(stage);

  return (
    <section id="stats" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-center mb-10">
        <SectionTabs
          tabs={STAGE_TABS}
          active={stage}
          onChange={(id) => setStage(id as SeasonStage)}
        />
      </div>

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
