# Public Team Posts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace mock `/news` with real approved team posts feed; add `/news/:id` post detail page; add "חדשות הקבוצה" section on team page.

**Architecture:** Add 3 hooks to `lib/queries.ts`. Replace `News.tsx` contents with real-data feed. Create post-detail page + team-page latest-posts section. All filter by `status='published'`.

**Tech Stack:** React 19, Vite, TanStack Query v5, Supabase, Tailwind v4, React Router v7.

---

### Task 1: Types + 3 hooks in `src/lib/queries.ts`

Append types:

```ts
export type PostCategory = 'signing' | 'injury' | 'release' | 'team_announcement' | 'achievement' | 'community' | 'other';

export const POST_CATEGORY_LABEL: Record<PostCategory, string> = {
  signing: 'החתמה',
  injury: 'פציעה',
  release: 'שחרור',
  team_announcement: 'הודעת קבוצה',
  achievement: 'הישג',
  community: 'קבוצה בונה קהילה',
  other: 'אחר',
};

export interface PublicPost {
  id: string;
  team_id: string;
  category: PostCategory;
  tags: string[];
  title: string;
  body: string;
  photos: string[];
  youtube_id: string | null;
  video_storage_path: string | null;
  published_at: string;
  team: { id: string; name: string; logo: string | null } | null;
}
```

Append hooks:

```ts
export const useApprovedPosts = (category?: PostCategory | 'all', teamId?: string) =>
  useQuery({
    queryKey: ['public_posts', category ?? 'all', teamId ?? 'all'],
    queryFn: async (): Promise<PublicPost[]> => {
      let q = supabase
        .from('team_posts')
        .select('id, team_id, category, tags, title, body, photos, youtube_id, video_storage_path, published_at, team:teams(id, name, logo)')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (category && category !== 'all') q = q.eq('category', category);
      if (teamId) q = q.eq('team_id', teamId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as PublicPost[];
    },
    staleTime: 1000 * 60 * 2,
  });

export const usePostById = (id: string | undefined) =>
  useQuery({
    queryKey: ['public_post', id],
    enabled: !!id,
    queryFn: async (): Promise<PublicPost | null> => {
      const { data, error } = await supabase
        .from('team_posts')
        .select('id, team_id, category, tags, title, body, photos, youtube_id, video_storage_path, published_at, team:teams(id, name, logo)')
        .eq('id', id!)
        .eq('status', 'published')
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as PublicPost | null;
    },
  });

export const useTeamLatestPosts = (teamId: string | undefined, limit = 5) =>
  useQuery({
    queryKey: ['team_latest_posts', teamId, limit],
    enabled: !!teamId,
    queryFn: async (): Promise<PublicPost[]> => {
      const { data, error } = await supabase
        .from('team_posts')
        .select('id, team_id, category, tags, title, body, photos, youtube_id, video_storage_path, published_at, team:teams(id, name, logo)')
        .eq('status', 'published')
        .eq('team_id', teamId!)
        .order('published_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as PublicPost[];
    },
  });
```

Build + commit.

---

### Task 2: Reusable card components in `src/components/news/`

#### `PostCard.tsx`

```tsx
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
```

#### `CategoryChips.tsx`

```tsx
import React from 'react';
import { POST_CATEGORY_LABEL, type PostCategory } from '../../lib/queries';

export type CategoryFilter = PostCategory | 'all';

interface Props {
  active: CategoryFilter;
  onChange: (next: CategoryFilter) => void;
}

const ORDER: CategoryFilter[] = ['all', 'signing', 'injury', 'release', 'team_announcement', 'achievement', 'community', 'other'];

const CategoryChips: React.FC<Props> = ({ active, onChange }) => (
  <div className="flex flex-wrap gap-2" dir="rtl">
    {ORDER.map((c) => {
      const isActive = c === active;
      const label = c === 'all' ? 'הכל' : POST_CATEGORY_LABEL[c];
      return (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="px-3 py-1.5 rounded-full text-sm font-bold transition-colors"
          style={{
            background: isActive ? '#FF4D00' : 'rgba(255,255,255,0.06)',
            color: isActive ? '#fff' : 'rgba(242,237,230,0.7)',
            border: '1px solid ' + (isActive ? '#FF4D00' : 'rgba(255,255,255,0.08)'),
          }}
        >
          {label}
        </button>
      );
    })}
  </div>
);

export default CategoryChips;
```

#### `PostGallery.tsx`

```tsx
import React, { useEffect, useState } from 'react';

interface Props { photos: string[] }

const PostGallery: React.FC<Props> = ({ photos }) => {
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
            <img src={url} alt="" className="w-full h-40 object-cover hover:opacity-90 transition-opacity" />
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
            aria-label="סגור"
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
                aria-label="הבא"
              >→</button>
              <button
                onClick={(e) => { e.stopPropagation(); setActive((active - 1 + photos.length) % photos.length); }}
                className="absolute left-4 text-white text-3xl font-black"
                aria-label="הקודם"
              >←</button>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default PostGallery;
```

Build + commit.

---

### Task 3: Replace `News.tsx` contents with real feed

Replace `src/components/ui/News.tsx` entirely:

```tsx
import React, { useMemo, useState } from 'react';
import { useApprovedPosts, useTeams } from '../../lib/queries';
import PostCard from '../news/PostCard';
import CategoryChips, { type CategoryFilter } from '../news/CategoryChips';

const News: React.FC = () => {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [teamId, setTeamId] = useState<string>('');

  const teamsQ = useTeams();
  const postsQ = useApprovedPosts(category, teamId || undefined);
  const teams = teamsQ.data ?? [];
  const posts = useMemo(() => postsQ.data ?? [], [postsQ.data]);

  return (
    <section id="news" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">
      <h2 className="text-2xl md:text-3xl font-black border-r-4 pr-4 mb-6" style={{ color: '#F2EDE6', borderColor: '#FF4D00' }}>
        חדשות וכתבות
      </h2>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <CategoryChips active={category} onChange={setCategory} />
        <select
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="rounded-full text-sm px-3 py-1.5"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#F2EDE6', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <option value="">כל הקבוצות</option>
          {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {postsQ.isLoading && (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>טוען...</div>
      )}
      {postsQ.error && (
        <div className="text-center py-12" style={{ color: '#f87171' }}>לא ניתן לטעון חדשות כעת.</div>
      )}
      {posts.length === 0 && !postsQ.isLoading && (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>אין פרסומים עדיין</div>
      )}

      {posts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </section>
  );
};

export default News;
```

Build + commit.

---

### Task 4: `PostDetailPage` + route

Create `src/pages/PostDetailPage.tsx`:

```tsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { usePostById, POST_CATEGORY_LABEL } from '../lib/queries';
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
        <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00' }}>
          {POST_CATEGORY_LABEL[data.category]}
        </span>
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
```

Add route in `src/App.jsx`:
```jsx
import PostDetailPage from './pages/PostDetailPage'
// ...inside <Routes>:
<Route path="/news/:id" element={<PostDetailPage />} />
```

Build + commit.

---

### Task 5: `TeamLatestPosts` + integrate in `TeamPage`

Create `src/components/team/TeamLatestPosts.tsx`:

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTeamLatestPosts } from '../../lib/queries';
import PostCard from '../news/PostCard';

interface Props { teamId: string }

const TeamLatestPosts: React.FC<Props> = ({ teamId }) => {
  const { data } = useTeamLatestPosts(teamId, 5);
  const posts = data ?? [];
  if (posts.length === 0) return null;

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black" style={{ color: '#F2EDE6' }}>חדשות הקבוצה</h2>
        <Link to={`/news?team=${teamId}`} className="text-sm" style={{ color: '#FF4D00' }}>
          כל החדשות ←
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {posts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
};

export default TeamLatestPosts;
```

Modify `src/pages/TeamPage.tsx`:
- Add import: `import TeamLatestPosts from '../components/team/TeamLatestPosts';`
- Insert `<TeamLatestPosts teamId={team.id} />` after `<TeamCoachStaff teamId={team.id} />` and `<TeamManagement teamId={team.id} />`.

Build + push.

---

### Task 6: Production check

Wait ~2 min after push. Visit `https://wbpl.co.il/news` → should show approved posts. Click a card → `/news/:id` opens detail page. Visit `/team/<id-with-published-posts>` → "חדשות הקבוצה" section appears.
