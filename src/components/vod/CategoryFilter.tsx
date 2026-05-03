import React from 'react';
import { VIDEO_CATEGORY_LABEL, type VideoCategory } from '../../lib/queries';

export type CategoryValue = VideoCategory | 'all';

interface Props {
  active: CategoryValue;
  onChange: (next: CategoryValue) => void;
}

const ORDER: CategoryValue[] = ['all', 'highlights', 'interview', 'recap', 'other'];
const ALL_LABEL = 'הכל';

const CategoryFilter: React.FC<Props> = ({ active, onChange }) => (
  <div className="flex flex-wrap gap-2" dir="rtl">
    {ORDER.map((c) => {
      const isActive = c === active;
      const label = c === 'all' ? ALL_LABEL : VIDEO_CATEGORY_LABEL[c];
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

export default CategoryFilter;
