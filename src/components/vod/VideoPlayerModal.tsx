import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import type { PublicVideo } from '../../lib/queries';

interface Props {
  video: PublicVideo;
  onClose: () => void;
}

const uploadUrlFor = (path: string): string =>
  supabase.storage.from('videos').getPublicUrl(path).data.publicUrl;

const VideoPlayerModal: React.FC<Props> = ({ video, onClose }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,8,12,0.85)' }}
      onClick={onClose}
      dir={dir}
    >
      <div
        className="w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background: '#0E1018', border: '1px solid rgba(255,255,255,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ background: 'var(--grad-orange)', boxShadow: 'var(--sheen-top)' }}>
          <span className="font-black text-white truncate">{video.title}</span>
          <button
            onClick={onClose}
            aria-label={t('vod.close')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xl font-black shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            ×
          </button>
        </div>
        <div style={{ aspectRatio: '16 / 9', background: '#000' }}>
          {video.source_type === 'youtube' && video.youtube_id ? (
            <iframe
              src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1&rel=0`}
              title={video.title}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : video.source_type === 'upload' && video.storage_path ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video
              src={uploadUrlFor(video.storage_path)}
              controls
              autoPlay
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: 'rgba(242,237,230,0.5)' }}>
              {t('vod.cannot_play')}
            </div>
          )}
        </div>
        {video.description && (
          <div className="px-4 py-3 text-sm" style={{ color: 'rgba(242,237,230,0.7)' }}>
            {video.description}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayerModal;
