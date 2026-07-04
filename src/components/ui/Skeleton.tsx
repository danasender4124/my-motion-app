import React from 'react';

// Shimmer building blocks for loading states on the dark theme.
// Replaces bare "טוען..." text with structure-preserving placeholders.

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
};

export const SkeletonBlock: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
  <div className={`rounded ${className}`} style={{ ...shimmerStyle, ...style }} aria-hidden="true" />
);

/** Table-like skeleton: header bar + N rows. */
export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <div
    className="w-full overflow-hidden rounded-lg"
    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
    role="status"
    aria-label="טוען נתונים"
  >
    <SkeletonBlock className="h-10 w-full" style={{ borderRadius: 0 }} />
    <div className="space-y-px">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-7 w-7 rounded-full" />
          <SkeletonBlock className="h-4 flex-1" />
          <SkeletonBlock className="h-4 w-14" />
        </div>
      ))}
    </div>
  </div>
);

/** Card-grid skeleton for stats/news/vod sections. */
export const SkeletonCardGrid: React.FC<{ cards?: number; cardHeight?: number }> = ({ cards = 6, cardHeight = 180 }) => (
  <div
    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
    role="status"
    aria-label="טוען נתונים"
  >
    {Array.from({ length: cards }).map((_, i) => (
      <SkeletonBlock key={i} className="rounded-xl w-full" style={{ height: cardHeight }} />
    ))}
  </div>
);

export default SkeletonBlock;
