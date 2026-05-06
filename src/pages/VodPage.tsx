import React, { useMemo, useState } from 'react';
import { usePublishedVideos, usePublishedGameVideos, type PublicVideo, type VideoCategory } from '../lib/queries';
import CategoryFilter, { type CategoryValue } from '../components/vod/CategoryFilter';
import VideoGrid from '../components/vod/VideoGrid';

const fmtDate = (iso: string | null): string => {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

const VodPage: React.FC = () => {
  const [category, setCategory] = useState<CategoryValue>('all');
  const baseQ = usePublishedVideos(category);
  const gameVidsQ = usePublishedGameVideos();

  const merged: PublicVideo[] = useMemo(() => {
    const base = baseQ.data ?? [];
    if (category !== 'all') return base; // game videos have no category — only show on 'all'
    const fromGames: PublicVideo[] = (gameVidsQ.data ?? []).map((g) => {
      const home = g.game?.home_team?.name ?? '—';
      const away = g.game?.away_team?.name ?? '—';
      const date = fmtDate(g.game?.date ?? null);
      const title = date ? `${home} vs ${away} · ${date}` : `${home} vs ${away}`;
      const v: PublicVideo = {
        id: `gm-${g.id}`,
        title,
        description: g.caption,
        category: 'highlights' as VideoCategory,
        source_type: g.youtube_id ? 'youtube' : 'upload',
        youtube_id: g.youtube_id,
        storage_path: g.storage_path,
        thumbnail_url: null,
        game_id: g.game_id,
        published_at: g.created_at,
        created_at: g.created_at,
      };
      return v;
    });
    return [...base, ...fromGames].sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    );
  }, [baseQ.data, gameVidsQ.data, category]);

  const isLoading = baseQ.isLoading || gameVidsQ.isLoading;
  const error = baseQ.error || gameVidsQ.error;

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6" dir="rtl">
      <h1 className="text-3xl font-black" style={{ color: '#F2EDE6' }}>VOD</h1>
      <CategoryFilter active={category} onChange={setCategory} />

      {isLoading && (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>טוען...</div>
      )}
      {error && (
        <div className="text-center py-12" style={{ color: '#f87171' }}>לא ניתן לטעון סרטונים כעת.</div>
      )}
      {merged.length === 0 && !isLoading && (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>
          אין סרטונים עדיין
        </div>
      )}
      {merged.length > 0 && <VideoGrid videos={merged} />}
    </main>
  );
};

export default VodPage;
