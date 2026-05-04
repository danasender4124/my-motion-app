# Public Site — Team Posts Display Design (Sub-project 10B)

## Goal
Replace the mock `/news` page with a real feed of approved team posts. Add a `/news/:id` post detail page. Add a "חדשות הקבוצה" section to `/team/:id` showing the team's latest 5 approved posts.

## Architecture
Two new hooks in `lib/queries.ts` (`useApprovedPosts`, `usePostById`, `useTeamLatestPosts`). Two new pages (`NewsPage` replaces existing `News` component contents; `PostDetailPage` is new). One new component (`TeamLatestPosts` for embedding on team page). All filtered by `status='published'`.

## Routes
- `/news` — modified (real data)
- `/news/:id` — new
- `/team/:id` — modified (one new section)

## Types (in `lib/queries.ts`)

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

## Hooks

- `useApprovedPosts(category?, teamId?)` — fetches `team_posts` where `status='published'`, joined with team; filters by category (optional) and team (optional); ordered by `published_at desc`
- `usePostById(id)` — single post by id, joined with team
- `useTeamLatestPosts(teamId, limit=5)` — latest published posts for a team

## UX

### `/news` page (replaces mock)
- Hero header: "חדשות וכתבות"
- Filter row: category chips (`הכל` + 7 categories) + team selector (drop-down, default "כל הקבוצות")
- Grid of post cards (responsive: 1/2/3/4 cols)
- Each card: thumbnail (first photo or YouTube thumbnail or video placeholder) + category badge + title (truncate 2 lines) + team logo + date + 2-3 tags
- Click a card → `/news/:id`
- Empty: "אין פרסומים עדיין"

### `/news/:id` post detail
- Top bar: "← חזרה לחדשות"
- Title (large)
- Meta row: team logo+name (linked to `/team/:id`) + category badge + date + tags
- Body (whitespace preserved)
- Photo gallery (lightbox click-to-zoom — simple modal)
- Video player (YouTube iframe or HTML5 video)
- Empty `body` → just media + meta

### `TeamLatestPosts` (on `/team/:id`)
- Section header "חדשות הקבוצה" + link "כל החדשות ←" → `/news?team=:id`
- 1 row of cards (latest 5)
- Hidden if zero published posts

## Card thumbnail logic

```
1. If photos.length > 0 → photos[0]
2. Else if youtube_id → https://img.youtube.com/vi/{id}/maxresdefault.jpg
3. Else if video_storage_path → dark placeholder with play icon overlay (no thumbnail)
4. Else → category-tinted gradient placeholder
```

## Theme
Dark public theme (`#07080C` bg, `#FF4D00` accent, `#F2EDE6` text), RTL.

## File Structure

```
my-motion-app/
└── src/
    ├── lib/queries.ts                   # MODIFY — add types + 3 hooks
    ├── components/
    │   ├── ui/News.tsx                  # MODIFY — replace contents (real data)
    │   └── team/
    │       └── TeamLatestPosts.tsx      # NEW
    │   └── news/
    │       ├── PostCard.tsx             # NEW
    │       ├── CategoryChips.tsx        # NEW
    │       └── PostGallery.tsx          # NEW (lightbox + grid)
    └── pages/
        ├── PostDetailPage.tsx           # NEW
        └── TeamPage.tsx                 # MODIFY — render <TeamLatestPosts>
    └── App.jsx                          # MODIFY — add /news/:id route
```

## Existing News component
The current `News.tsx` reads from `data/league.ts` `NEWS` mock. We'll replace its rendering entirely with the real feed. The route `/news` is already wired via App.jsx and Header.

## Out of Scope
- Comments / likes / share buttons
- Search across post bodies
- Pagination (≤500 posts feasible to fetch in one go for now)
- Author attribution per post
- Push notifications
- RSS feed
