import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { usePostById } from '../lib/queries';
import PostGallery from '../components/news/PostGallery';

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

const videoUrl = (path: string) =>
  supabase.storage.from('team-posts').getPublicUrl(path).data.publicUrl;

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = usePostById(id);

  if (isLoading) {
    return <main className="text-center py-24" style={{ color: 'rgba(242,237,230,0.4)' }} dir="rtl">טוען...</main>;
  }
  if (!data) {
    return (
      <main className="text-center py-24 space-y-4" dir="rtl">
        <div style={{ color: 'rgba(242,237,230,0.4)' }}>הפרסום לא נמצא</div>
        <Link to="/news" style={{ color: '#FF4D00' }}>← חזרה לחדשות</Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-6" dir="rtl">
      <Link to="/news" className="text-sm flex items-center gap-1" style={{ color: 'rgba(242,237,230,0.5)' }}>
        ← חזרה לחדשות
      </Link>

      <h1 className="text-3xl font-black leading-tight" style={{ color: '#F2EDE6' }}>{data.title}</h1>

      <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: 'rgba(242,237,230,0.65)' }}>
        {data.team && (
          <Link to={`/team/${data.team.id}`} className="flex items-center gap-2 hover:underline">
            {data.team.logo && (
              <img src={data.team.logo} alt={data.team.name} style={{ width: 22, height: 22, objectFit: 'contain' }} />
            )}
            <span style={{ color: '#F2EDE6' }}>{data.team.name}</span>
          </Link>
        )}
        <span>{fmtDate(data.published_at)}</span>
      </div>

      {data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.tags.map((t, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(242,237,230,0.7)' }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {data.body && (
        <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(242,237,230,0.85)' }}>
          {data.body}
        </p>
      )}

      <PostGallery photos={data.photos} />

      {data.youtube_id && (
        <div style={{ aspectRatio: '16 / 9' }} className="rounded-xl overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${data.youtube_id}`}
            title={data.title}
            className="w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {data.video_storage_path && (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video src={videoUrl(data.video_storage_path)} controls className="w-full rounded-xl" />
      )}
    </main>
  );
};

export default PostDetailPage;
