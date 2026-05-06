import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useGameMediaPublic, type PublicGameMediaItem } from '../../lib/queries';

const mediaUrl = (path: string) =>
  supabase.storage.from('game-media').getPublicUrl(path).data.publicUrl;

const PhotoLightbox: React.FC<{ photos: PublicGameMediaItem[]; index: number; onClose: () => void; onNav: (i: number) => void }> = ({ photos, index, onClose, onNav }) => {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const photo = photos[index];
  if (!photo?.storage_path) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,8,12,0.92)' }}
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 left-4 text-white text-2xl font-black">×</button>
      <img
        src={mediaUrl(photo.storage_path)}
        alt=""
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onNav((index + 1) % photos.length); }}
            className="absolute right-4 text-white text-3xl font-black"
          >→</button>
          <button
            onClick={(e) => { e.stopPropagation(); onNav((index - 1 + photos.length) % photos.length); }}
            className="absolute left-4 text-white text-3xl font-black"
          >←</button>
        </>
      )}
    </div>
  );
};

interface Props { gameId: string }

const MatchMedia: React.FC<Props> = ({ gameId }) => {
  const { data } = useGameMediaPublic(gameId);
  const items = data ?? [];
  const photos = items.filter((m) => m.type === 'photo' && m.storage_path);
  const videos = items.filter((m) => m.type === 'video');
  const [lbIndex, setLbIndex] = useState<number | null>(null);

  if (photos.length === 0 && videos.length === 0) return null;

  return (
    <div dir="rtl" className="space-y-6">
      {photos.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-black" style={{ color: '#F2EDE6' }}>תמונות מהמשחק</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setLbIndex(i)}
                className="rounded-lg overflow-hidden"
              >
                <img
                  src={p.storage_path ? mediaUrl(p.storage_path) : ''}
                  alt=""
                  className="w-full h-32 object-cover hover:opacity-90 transition-opacity"
                />
              </button>
            ))}
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-black" style={{ color: '#F2EDE6' }}>סרטונים מהמשחק</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((v) => (
              <div key={v.id} style={{ aspectRatio: '16 / 9' }} className="rounded-xl overflow-hidden">
                {v.youtube_id ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${v.youtube_id}`}
                    title="סרטון מהמשחק"
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : v.storage_path ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video src={mediaUrl(v.storage_path)} controls className="w-full h-full" />
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {lbIndex !== null && (
        <PhotoLightbox
          photos={photos}
          index={lbIndex}
          onClose={() => setLbIndex(null)}
          onNav={(i) => setLbIndex(i)}
        />
      )}
    </div>
  );
};

export default MatchMedia;
