import React from 'react';
import { useTranslation } from 'react-i18next';
import { type VideoCategory } from '../../lib/queries';

export type CategoryValue = VideoCategory | 'all';

interface Props {
  active: CategoryValue;
  onChange: (next: CategoryValue) => void;
}

const ORDER: CategoryValue[] = ['all', 'highlights', 'interview', 'recap', 'other'];

const CategoryFilter: React.FC<Props> = ({ active, onChange }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  return (
  <div className="flex flex-wrap gap-2" dir={dir}>
    {ORDER.map((c) => {
      const isActive = c === active;
      const label = t(`vod.${c}`);
      return (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="px-3 py-1.5 rounded-full text-sm font-bold transition-colors"
          style={{
            background: isActive ? '#FF4D00' : 'rgba(255,255,255,0.06)',
            color: isActive ? '#fff' : 'rgba(242,237,230,0.7)',
            border: '1px solid ' + (isActive ? '#FF4D00' : 'rgba(255,255,255,0.08)'),
          }}
        >
          {label}
        </button>
      );
    })}
  </div>
  );
};

export default CategoryFilter;
