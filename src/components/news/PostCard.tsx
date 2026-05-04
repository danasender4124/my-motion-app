import React from 'react';
import { Link } from 'react-router-dom';
import { POST_CATEGORY_LABEL, type PublicPost } from '../../lib/queries';

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

const thumbnailFor = (p: PublicPost): string | null => {
  if (p.photos.length > 0) return p.photos[0];
  if (p.youtube_id) return `https://img.youtube.com/vi/${p.youtube_id}/maxresdefault.jpg`;
  return null;
};

interface Props { post: PublicPost }

const PostCard: React.FC<Props> = ({ post }) => {
  const thumb = thumbnailFor(post);
  return (
    <Link
      to={`/news/${post.id}`}
      className="block rounded-xl overflow-hidden flex flex-col transition-transform hover:scale-[1.02]"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      dir="rtl"
    >
      <div className="relative w-full" style={{ aspectRatio: '16 / 9', background: 'rgba(255,255,255,0.06)' }}>
        {thumb ? (
          <img src={thumb} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: 'rgba(242,237,230,0.3)' }}>📰</div>
        )}
        <span
          className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: 'rgba(255,77,0,0.85)', color: '#fff' }}
        >
          {POST_CATEGORY_LABEL[post.category]}
        </span>
      </div>
      <div className="p-3 space-y-2 flex-1 flex flex-col">
        <h3 className="text-sm font-bold line-clamp-2" style={{ color: '#F2EDE6' }}>{post.title}</h3>
        <div className="mt-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            {post.team?.logo && (
              <img src={post.team.logo} alt={post.team.name ?? ''} style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} />
            )}
            <span className="truncate" style={{ color: 'rgba(242,237,230,0.7)' }}>{post.team?.name ?? ''}</span>
          </div>
          <span style={{ color: 'rgba(242,237,230,0.5)' }}>{fmtDate(post.published_at)}</span>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
