# Public VOD Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public `/vod` page to `my-motion-app` that lists published videos (YouTube embeds and uploaded MP4s) with category filtering, plus a "סרטונים מהמשחק" section on `/match/:id` showing clips tagged to that game. Add a "VOD" link to the header.

**Architecture:** Read directly from the existing `videos` table via Supabase anon RLS. New hooks `usePublishedVideos` and `useGameVideos`. Four new components (`VideoCard`, `VideoPlayerModal`, `CategoryFilter`, `VideoGrid`) plus `MatchVideos` for the match-page section. New `VodPage` orchestrator. Dark theme consistent with the rest of the public site.

**Tech Stack:** React 19, TypeScript, Vite, TanStack Query v5, Supabase JS SDK, React Router v7, Tailwind v4.

---

## File Structure

All paths under `C:\Users\Dana\projects\my-motion-app\`.

```
src/lib/queries.ts                       # MODIFY — types + 2 hooks
src/components/vod/
  VideoCard.tsx                          # NEW — single grid item
  VideoPlayerModal.tsx                   # NEW — overlay player
  CategoryFilter.tsx                     # NEW — chip row
  VideoGrid.tsx                          # NEW — shared grid
src/components/match/
  MatchVideos.tsx                        # NEW — per-game clips
src/components/ui/Header.tsx             # MODIFY — add "VOD" nav link
src/pages/VodPage.tsx                    # NEW
src/pages/MatchPage.tsx                  # MODIFY — render <MatchVideos>
src/App.jsx                              # MODIFY — add /vod route
```

**Verification approach:** No test framework on this side of the project. Each task verifies via `npm run build`. Final task includes a manual browser smoke check.

---

### Task 1: Add types + `usePublishedVideos` + `useGameVideos` to `lib/queries.ts`

**Files:**
- Modify: `src/lib/queries.ts`

- [ ] **Step 1: Add types after the existing `TeamLeaders` interface**

In `src/lib/queries.ts`, append (near other `export interface` blocks, e.g. after `TeamLeaders`):

```ts
export type VideoCategory = 'highlights' | 'interview' | 'recap' | 'other';
export type VideoSourceType = 'youtube' | 'upload';

export interface PublicVideo {
  id: string;
  title: string;
  description: string | null;
  category: VideoCategory;
  source_type: VideoSourceType;
  youtube_id: string | null;
  storage_path: string | null;
  thumbnail_url: string | null;
  game_id: string | null;
  published_at: string;
  created_at: string;
}

export const VIDEO_CATEGORY_LABEL: Record<VideoCategory, string> = {
  highlights: 'היי-לייטס',
  interview: 'ראיון',
  recap: 'סיקור',
  other: 'אחר',
};
```

- [ ] **Step 2: Append the two hooks at the end of the file**

```ts
export const usePublishedVideos = (category: VideoCategory | 'all' = 'all') =>
  useQuery({
    queryKey: ['videos', 'public', category],
    queryFn: async (): Promise<PublicVideo[]> => {
      let q = supabase
        .from('videos')
        .select('*')
        .order('published_at', { ascending: false });
      if (category !== 'all') q = q.eq('category', category);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as PublicVideo[];
    },
    staleTime: 1000 * 60 * 5,
  });

export const useGameVideos = (gameId: string | undefined) =>
  useQuery({
    queryKey: ['videos', 'game', gameId],
    enabled: !!gameId,
    queryFn: async (): Promise<PublicVideo[]> => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('game_id', gameId!)
        .order('published_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as PublicVideo[];
    },
  });
```

- [ ] **Step 3: Verify build**

Run: `cd C:\Users\Dana\projects\my-motion-app && npm run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat(public): add PublicVideo types + usePublishedVideos + useGameVideos hooks

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: `VideoCard` + `VideoPlayerModal`

**Files:**
- Create: `src/components/vod/VideoCard.tsx`
- Create: `src/components/vod/VideoPlayerModal.tsx`

- [ ] **Step 1: Create `VideoCard.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `VideoPlayerModal.tsx`**

```tsx
import React, { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { PublicVideo } from '../../lib/queries';

interface Props {
  video: PublicVideo;
  onClose: () => void;
}

const uploadUrlFor = (path: string): string =>
  supabase.storage.from('videos').getPublicUrl(path).data.publicUrl;

const VideoPlayerModal: React.FC<Props> = ({ video, onClose }) => {
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
      dir="rtl"
    >
      <div
        className="w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background: '#0E1018', border: '1px solid rgba(255,255,255,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ background: '#FF4D00' }}>
          <span className="font-black text-white truncate">{video.title}</span>
          <button
            onClick={onClose}
            aria-label="סגור"
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
              לא ניתן להציג את הסרטון
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
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/components/vod/VideoCard.tsx src/components/vod/VideoPlayerModal.tsx
git commit -m "feat(public): add VideoCard and VideoPlayerModal

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: `CategoryFilter` + `VideoGrid`

**Files:**
- Create: `src/components/vod/CategoryFilter.tsx`
- Create: `src/components/vod/VideoGrid.tsx`

- [ ] **Step 1: Create `CategoryFilter.tsx`**

```tsx
import React from 'react';
import { VIDEO_CATEGORY_LABEL, type VideoCategory } from '../../lib/queries';

export type CategoryValue = VideoCategory | 'all';

interface Props {
  active: CategoryValue;
  onChange: (next: CategoryValue) => void;
}

const ORDER: CategoryValue[] = ['all', 'highlights', 'interview', 'recap', 'other'];
const ALL_LABEL = 'הכל';

const CategoryFilter: React.FC<Props> = ({ active, onChange }) => (
  <div className="flex flex-wrap gap-2" dir="rtl">
    {ORDER.map((c) => {
      const isActive = c === active;
      const label = c === 'all' ? ALL_LABEL : VIDEO_CATEGORY_LABEL[c];
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

export default CategoryFilter;
```

- [ ] **Step 2: Create `VideoGrid.tsx`**

```tsx
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
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/components/vod/CategoryFilter.tsx src/components/vod/VideoGrid.tsx
git commit -m "feat(public): add CategoryFilter and VideoGrid

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 4: `VodPage` and `/vod` route

**Files:**
- Create: `src/pages/VodPage.tsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `VodPage.tsx`**

```tsx
import React, { useState } from 'react';
import { usePublishedVideos } from '../lib/queries';
import CategoryFilter, { type CategoryValue } from '../components/vod/CategoryFilter';
import VideoGrid from '../components/vod/VideoGrid';

const VodPage: React.FC = () => {
  const [category, setCategory] = useState<CategoryValue>('all');
  const { data, isLoading, error } = usePublishedVideos(category);

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6" dir="rtl">
      <h1 className="text-3xl font-black" style={{ color: '#F2EDE6' }}>VOD</h1>
      <CategoryFilter active={category} onChange={setCategory} />

      {isLoading && (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>טוען...</div>
      )}
      {error && (
        <div className="text-center py-12" style={{ color: '#f87171' }}>לא ניתן לטעון סרטונים כעת.</div>
      )}
      {data && data.length === 0 && (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>
          אין סרטונים עדיין
        </div>
      )}
      {data && data.length > 0 && <VideoGrid videos={data} />}
    </main>
  );
};

export default VodPage;
```

- [ ] **Step 2: Add `/vod` route to `src/App.jsx`**

In `src/App.jsx`:

1. Add this import next to the other page imports:

```jsx
import VodPage from './pages/VodPage'
```

2. Inside the existing `<Routes>`, alongside the other routes (e.g., near `/team/:id` and `/player/:id`):

```jsx
<Route path="/vod" element={<VodPage />} />
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/pages/VodPage.tsx src/App.jsx
git commit -m "feat(public): add /vod page

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Header nav entry

**Files:**
- Modify: `src/components/ui/Header.tsx`

- [ ] **Step 1: Add the link to `NAV_LINKS`**

In `src/components/ui/Header.tsx`, find the `NAV_LINKS` array (around line 7) and add an entry for VOD after "חדשות":

The existing array is:

```tsx
const NAV_LINKS = [
  { label: 'בית',        to: '/' },
  { label: 'משחקים',     to: '/results' },
  { label: 'טבלת הליגה', to: '/standings' },
  { label: 'סטטיסטיקה',  to: '/stats' },
  { label: 'חדשות',      to: '/news' },
];
```

Replace it with:

```tsx
const NAV_LINKS = [
  { label: 'בית',        to: '/' },
  { label: 'משחקים',     to: '/results' },
  { label: 'טבלת הליגה', to: '/standings' },
  { label: 'סטטיסטיקה',  to: '/stats' },
  { label: 'חדשות',      to: '/news' },
  { label: 'VOD',        to: '/vod' },
];
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Header.tsx
git commit -m "feat(public): add VOD link to header nav

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 6: `MatchVideos` section + integrate into `MatchPage`

**Files:**
- Create: `src/components/match/MatchVideos.tsx`
- Modify: `src/pages/MatchPage.tsx`

- [ ] **Step 1: Create `MatchVideos.tsx`**

```tsx
import React from 'react';
import { useGameVideos } from '../../lib/queries';
import VideoGrid from '../vod/VideoGrid';

interface Props { gameId: string }

const MatchVideos: React.FC<Props> = ({ gameId }) => {
  const { data } = useGameVideos(gameId);
  if (!data || data.length === 0) return null;

  return (
    <section className="space-y-4" dir="rtl">
      <h2 className="text-xl font-black" style={{ color: '#F2EDE6' }}>סרטונים מהמשחק</h2>
      <VideoGrid videos={data} />
    </section>
  );
};

export default MatchVideos;
```

- [ ] **Step 2: Integrate into `src/pages/MatchPage.tsx`**

Open `src/pages/MatchPage.tsx`. Add this import near the existing component imports (the exact line will vary):

```tsx
import MatchVideos from '../components/match/MatchVideos';
```

Find the place where the page returns its JSX (after the box-score tables and before the closing `</main>` or wrapping element). Insert the section there:

```tsx
{game && <MatchVideos gameId={game.id} />}
```

If `game` is referenced under a different variable name in this file (e.g., `data`, `match`), use whichever yields the game id. Pass the actual id, not the whole object.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/components/match/MatchVideos.tsx src/pages/MatchPage.tsx
git commit -m "feat(public): show per-game videos on match page

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 7: Final smoke + push

**Files:** none

- [ ] **Step 1: Build**

Run: `npm run build` — expect success.

- [ ] **Step 2: Smoke check (locally)**

Run: `npm run dev`. Verify:
- Header shows "VOD" link
- `/vod` renders, filter chips work, clicking a card opens modal
- YouTube videos play in iframe; uploaded MP4s play with native controls
- ESC + backdrop click + × all close the modal
- `/match/:id` for a played game renders the "סרטונים מהמשחק" section if videos exist

- [ ] **Step 3: Push**

```bash
git push
```

- [ ] **Step 4: Verify on production**

Wait ~2 minutes. Visit `https://wbpl.co.il/vod`. Confirm new bundle loads and a video can be played.
