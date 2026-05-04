import React from 'react';
import { Link } from 'react-router-dom';
import { POST_CATEGORY_LABEL, type PublicPost } from '../../lib/queries';

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
      className="block flex flex-col group"
      dir="rtl"
    >
      <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: '5 / 3', background: 'rgba(255,255,255,0.06)' }}>
        {thumb ? (
          <img
            src={thumb}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: 'rgba(242,237,230,0.3)' }}>📰</div>
        )}
        <span
          className="absolute top-4 right-4 px-4 py-2 rounded text-base md:text-lg font-black uppercase tracking-wider"
          style={{ background: '#FF4D00', color: '#fff' }}
        >
          {POST_CATEGORY_LABEL[post.category]}
        </span>
      </div>
      <div className="pt-4 space-y-2">
        <h3
          className="text-2xl font-black leading-tight line-clamp-3 group-hover:text-orange-500 transition-colors"
          style={{ color: '#F2EDE6' }}
        >
          {post.title}
        </h3>
        {post.body && (
          <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'rgba(242,237,230,0.65)' }}>
            {post.body}
          </p>
        )}
      </div>
    </Link>
  );
};

export default PostCard;
