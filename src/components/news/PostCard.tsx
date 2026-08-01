import React from 'react';
import { Link } from 'react-router-dom';
import { POST_CATEGORY_LABEL, type PublicPost } from '../../lib/queries';

const thumbnailFor = (p: PublicPost): string | null => {
  if (p.photos.length > 0) return p.photos[0];
  if (p.youtube_id) return `https://img.youtube.com/vi/${p.youtube_id}/maxresdefault.jpg`;
  return null;
};

interface Props {
  post: PublicPost;
  /** Sidebar-strip mode: smaller badge, tighter typography, no body text. */
  compact?: boolean;
}

const PostCard: React.FC<Props> = ({ post, compact }) => {
  const thumb = thumbnailFor(post);
  return (
    <Link
      to={`/news/${post.id}`}
      className="block flex flex-col group"
      dir="rtl"
    >
      <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: '5 / 3', background: 'rgba(255,255,255,0.06)' }}>
        {thumb ? (
          <img
            src={thumb}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: 'rgba(242,237,230,0.4)' }}>📰</div>
        )}
        <span
          className={compact
            ? 'absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold'
            : 'absolute top-3 right-3 px-2.5 py-1 rounded text-sm font-bold'}
          style={{ background: 'var(--grad-orange)', color: '#fff', boxShadow: 'var(--sheen-top)' }}
        >
          {POST_CATEGORY_LABEL[post.category]}
        </span>
      </div>
      <div className={compact ? 'pt-2 space-y-1' : 'pt-4 space-y-2'}>
        <h3
          className={`font-black leading-tight group-hover:text-orange-500 transition-colors ${compact ? 'text-sm line-clamp-2' : 'text-2xl line-clamp-3'}`}
          style={{ color: '#F2EDE6' }}
        >
          {post.title}
        </h3>
        {!compact && post.body && (
          <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'rgba(242,237,230,0.65)' }}>
            {post.body}
          </p>
        )}
      </div>
    </Link>
  );
};

export default PostCard;
