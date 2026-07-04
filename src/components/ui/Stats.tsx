import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LeadersGrid from '../stats/LeadersGrid';
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
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!seasonId && defaultSeasonId) setSeasonId(defaultSeasonId);
  }, [defaultSeasonId, seasonId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-season-dropdown]')) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const selected = seasons.find((s) => s.id === seasonId);
  const triggerLabel = selected ? selected.name : t('stats.pick_season');

  const { data, isLoading, error } = useLeagueLeaders(seasonId);

  return (
    <section id="stats" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir={dir}>
      {seasons.length > 0 && (
        <div className="flex justify-center mb-10" data-season-dropdown>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="relative flex items-center px-5 py-2.5 bg-[#f15a24] text-white font-semibold min-w-[200px] justify-center transition-colors hover:bg-[#d44d1d]"
            >
              <span>{triggerLabel}</span>
              <ChevronDown className={`w-4 h-4 absolute right-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <ul
                className="absolute right-0 left-0 top-full mt-1 overflow-hidden shadow-lg z-10 border"
                style={{ background: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                {seasons.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => { setSeasonId(s.id); setOpen(false); }}
                      className={`block w-full text-center px-5 py-2.5 transition-colors ${
                        s.id === seasonId
                          ? 'bg-[#f15a24] text-white'
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {s.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {isLoading && <SkeletonCardGrid cards={10} cardHeight={220} />}
      {error && (
        <div className="text-center py-12" style={{ color: '#f87171' }}>{t('stats.error')}</div>
      )}
      {data && <LeadersGrid leaders={data} />}
    </section>
  );
};

export default Stats;
