import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props { photos: string[] }

const PostGallery: React.FC<Props> = ({ photos }) => {
  const { t } = useTranslation();
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setActive(null); };
    if (active !== null) {
      window.addEventListener('keydown', onEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [active]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {photos.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className="rounded-lg overflow-hidden"
          >
            <img src={url} alt="" loading="lazy" className="w-full h-40 object-cover hover:opacity-90 transition-opacity" />
          </button>
        ))}
      </div>
      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(7,8,12,0.92)' }}
          onClick={() => setActive(null)}
        >
          <button
            onClick={() => setActive(null)}
            className="absolute top-4 left-4 text-white text-2xl font-black"
            aria-label={t('news.gallery_close')}
          >×</button>
          <img
            src={photos[active]}
            alt=""
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setActive((active + 1) % photos.length); }}
                className="absolute right-4 text-white text-3xl font-black"
                aria-label={t('news.gallery_next')}
              >→</button>
              <button
                onClick={(e) => { e.stopPropagation(); setActive((active - 1 + photos.length) % photos.length); }}
                className="absolute left-4 text-white text-3xl font-black"
                aria-label={t('news.gallery_prev')}
              >←</button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default PostGallery;
