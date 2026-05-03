import React, { useState } from 'react';
import VideoCard from './VideoCard';
import VideoPlayerModal from './VideoPlayerModal';
import type { PublicVideo } from '../../lib/queries';

interface Props { videos: PublicVideo[] }

const VideoGrid: React.FC<Props> = ({ videos }) => {
  const [active, setActive] = useState<PublicVideo | null>(null);
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" dir="rtl">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} onPlay={setActive} />
        ))}
      </div>
      {active && <VideoPlayerModal video={active} onClose={() => setActive(null)} />}
    </>
  );
};

export default VideoGrid;
