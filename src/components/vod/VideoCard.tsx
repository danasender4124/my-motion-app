import React from 'react';
import { VIDEO_CATEGORY_LABEL, type PublicVideo } from '../../lib/queries';

interface Props {
  video: PublicVideo;
  onPlay: (v: PublicVideo) => void;
}

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

const thumbnailFor = (v: PublicVideo): string | null => {
  if (v.thumbnail_url) return v.thumbnail_url;
  if (v.source_type === 'youtube' && v.youtube_id) {
    return `https://img.youtube.com/vi/${v.youtube_id}/maxresdefault.jpg`;
  }
  return null;
};

const PlayIcon: React.FC = () => (
  <div
    className="absolute inset-0 flex items-center justify-center pointer-events-none"
    style={{ background: 'rgba(7,8,12,0.25)' }}
  >
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center"
      style={{ background: 'rgba(255,77,0,0.9)' }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="white">
        <path d="M5 3l14 8-14 8V3z" />
      </svg>
    </div>
  </div>
);

const VideoCard: React.FC<Props> = ({ video, onPlay }) => {
  const thumb = thumbnailFor(video);
  return (
    <button
      type="button"
      onClick={() => onPlay(video)}
      className="text-right rounded-xl overflow-hidden flex flex-col transition-transform hover:scale-[1.02]"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      dir="rtl"
    >
      <div className="relative w-full" style={{ aspectRatio: '16 / 9', background: 'rgba(255,255,255,0.06)' }}>
        {thumb ? (
          <img src={thumb} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" />
        )}
        <PlayIcon />
      </div>
      <div className="p-3 space-y-2">
        <h3 className="text-sm font-bold line-clamp-2" style={{ color: '#F2EDE6' }}>{video.title}</h3>
        <div className="flex items-center justify-between text-xs">
          <span
            className="px-2 py-0.5 rounded-full font-bold"
            style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00' }}
          >
            {VIDEO_CATEGORY_LABEL[video.category]}
          </span>
          <span style={{ color: 'rgba(242,237,230,0.5)' }}>{fmtDate(video.published_at)}</span>
        </div>
      </div>
    </button>
  );
};

export default VideoCard;
