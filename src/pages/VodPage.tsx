import React, { useState } from 'react';
import { usePublishedVideos } from '../lib/queries';
import CategoryFilter, { type CategoryValue } from '../components/vod/CategoryFilter';
import VideoGrid from '../components/vod/VideoGrid';

const VodPage: React.FC = () => {
  const [category, setCategory] = useState<CategoryValue>('all');
  const { data, isLoading, error } = usePublishedVideos(category);

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
      {data && data.length === 0 && (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>
          אין סרטונים עדיין
        </div>
      )}
      {data && data.length > 0 && <VideoGrid videos={data} />}
    </main>
  );
};

export default VodPage;
