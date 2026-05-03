# Public Site — VOD Page Design (Sub-project 7B)

## Goal
Add a public `/vod` page to `my-motion-app` that lists video clips published from the admin (`videos` table) and lets visitors play them. Add a "VOD" link to the main navigation. Show a "סרטונים מהמשחק" section on `/match/:id` when videos are tagged to that game.

## Architecture
Read directly from Supabase via the existing client and the `videos_anon_read` RLS policy. TanStack Query handles caching. New hook `usePublishedVideos`. Two new components: `VideoCard` (grid item with thumbnail) and `VideoPlayerModal` (overlay player with YouTube iframe or HTML5 video). New `VodPage` orchestrator. Header gains one nav entry. `MatchPage` gains a small clips section.

## Routes
- `/vod` — new

## UX

### Header
Add `{ label: 'VOD', to: '/vod' }` to `NAV_LINKS` in `Header.tsx` after "חדשות".

### `/vod` page
- Header: page title "VOD"
- Filter bar: chips for category — `הכל` (default), `היי-לייטס`, `ראיון`, `סיקור`, `אחר`. Selected chip highlighted in orange.
- Loading: "טוען..." centered
- Error: "לא ניתן לטעון סרטונים כעת."
- Empty: "אין סרטונים עדיין"
- Grid: responsive — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`

### `VideoCard`
- Thumbnail (16:9 aspect)
  - YouTube → `https://img.youtube.com/vi/{youtube_id}/maxresdefault.jpg` (fall back to `thumbnail_url` if explicit override exists)
  - Upload → `thumbnail_url` if set; else dark placeholder with a centered play icon
- Play icon overlay (white circle with triangle) centered
- Below thumbnail: title (truncate 2 lines), small row with category badge + formatted date
- Whole card is `<button>` that opens the player modal

### `VideoPlayerModal`
- Full-screen dim overlay (`bg-black/85`) closeable by ESC, backdrop click, or × button
- Container max-width ~960px, dark bg, rounded
- Header: title + × button
- Body:
  - YouTube → `<iframe src="https://www.youtube.com/embed/{id}?autoplay=1&rel=0" allowfullscreen>`
  - Upload → `<video controls autoplay src={publicUrl} />` where `publicUrl` comes from `supabase.storage.from('videos').getPublicUrl(storage_path)` (bucket is public, so no signing needed)
- Footer (optional): description text if present
- Body scroll locked while open

### `MatchPage` integration
After the existing box-score sections, render `<MatchVideos gameId={id} />` which queries `videos` filtered by `game_id` and renders the same `VideoCard` grid. Hidden when zero results.

## Data Flow

### New hook in `lib/queries.ts`

```ts
export type PublicVideo = { ...row from videos table, exact same shape as admin Video type }

export const usePublishedVideos = (category?: VideoCategory | 'all')
```

Returns `PublicVideo[]` filtered by category if provided (default 'all'), sorted by `published_at desc`.

### New hook for per-game videos

```ts
export const useGameVideos = (gameId: string | undefined)
```

Returns `PublicVideo[]` filtered by `game_id`.

### Helper for upload URLs

In `VideoPlayerModal`, derive the public URL inline using `supabase.storage.from('videos').getPublicUrl(path).data.publicUrl`.

## Types

Define `VideoCategory`, `VideoSourceType`, and `PublicVideo` in `lib/queries.ts` alongside other public types. The shape matches the admin `Video` type but is duplicated here because the public site is a separate package with no shared package import.

## File Structure

```
my-motion-app/
└── src/
    ├── lib/
    │   └── queries.ts                  # MODIFY — add types + 2 hooks
    ├── components/
    │   ├── ui/Header.tsx               # MODIFY — add "VOD" nav link
    │   ├── vod/
    │   │   ├── VideoCard.tsx           # NEW
    │   │   ├── VideoPlayerModal.tsx    # NEW
    │   │   ├── CategoryFilter.tsx      # NEW — chip row
    │   │   └── VideoGrid.tsx           # NEW — shared grid (used by /vod and MatchPage)
    │   └── match/
    │       └── MatchVideos.tsx         # NEW — per-game clips section
    ├── pages/
    │   ├── VodPage.tsx                 # NEW
    │   └── MatchPage.tsx               # MODIFY — render <MatchVideos>
    └── App.jsx                         # MODIFY — add /vod route
```

## Theme
Dark public theme: `#07080C` bg, `#FF4D00` accent, `#F2EDE6` text, `rgba(255,255,255,0.04)` surfaces. RTL via `dir="rtl"`.

## Permissions
The existing `videos_anon_read` RLS policy + the public `videos` storage bucket cover all reads. No new policies.

## Out of Scope
- View counts, likes, comments
- Playlists / chapters / timestamps
- Subtitles / captions UI
- Sharing buttons
- Player-page integration (clips per player)
- Search across video titles
- Pagination (we expect <100 videos in foreseeable use; full list fetch is fine)
