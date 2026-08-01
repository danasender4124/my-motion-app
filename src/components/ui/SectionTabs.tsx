import React from 'react';

export interface Tab {
  id: string;
  label: string;
}

interface SectionTabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  suffix?: React.ReactNode; // optional extra element on the right (e.g. round label)
}

// Segmented control: one quiet track, the active tab is a gradient pill.
// Softer than two competing solid buttons.
const SectionTabs: React.FC<SectionTabsProps> = ({ tabs, active, onChange, suffix }) => (
  <div className="flex flex-row-reverse items-center gap-3">
    <div
      className="flex flex-row-reverse items-center gap-1 p-1 rounded-full"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(tab.id)}
            className="px-6 py-2 text-sm rounded-full transition-all duration-200 active:scale-[0.98]"
            style={{
              background: isActive ? 'var(--grad-orange)' : 'transparent',
              color: isActive ? '#fff' : 'rgba(242,237,230,0.6)',
              fontWeight: isActive ? 800 : 500,
              boxShadow: isActive ? 'var(--sheen-top), 0 4px 14px rgba(214,60,0,0.35)' : 'none',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
    {suffix}
  </div>
);

export default SectionTabs;
