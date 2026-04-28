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

const SectionTabs: React.FC<SectionTabsProps> = ({ tabs, active, onChange, suffix }) => (
  <div className="flex flex-row-reverse items-center gap-2">
    {tabs.map(tab => (
      <button
        key={tab.id}
        type="button"
        aria-pressed={active === tab.id}
        onClick={() => onChange(tab.id)}
        className="px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200"
        style={{
          background: active === tab.id ? '#FF4D00' : 'rgba(255,255,255,0.07)',
          color: active === tab.id ? '#fff' : 'rgba(242,237,230,0.55)',
          border: active === tab.id ? '1px solid transparent' : '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {tab.label}
      </button>
    ))}
    {suffix}
  </div>
);

export default SectionTabs;
