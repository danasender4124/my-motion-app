# Public Site — Real-Data Games + Match Detail Page (Sub-project 6A)

## Goal
Connect the public site (`my-motion-app`) to Supabase. Replace hardcoded results data with live data from the same DB the admin manages. Add a public match detail page with full box score per game.

## Architecture

The public site fetches games + stats directly from Supabase via the JS SDK, using the project's anon key. Read access is enabled for the relevant tables via new public RLS policies. TanStack Query handles caching and loading states. The existing `Results` component is updated to consume live data while keeping its visual design unchanged.

A new route `/match/:id` displays the box score for a single game.

## Data Flow

1. Browser loads page → React Query hook fires
2. `supabase.from('games').select(...)` → PostgREST → DB
3. Anon role allowed by RLS `anon_read` policy (read-only)
4. Data normalized into the Game/PlayerGameStats shapes already used by the component
5. Component renders

## Public RLS Policies

New policies added (alongside existing `authenticated_read`):

```sql
create policy "anon_read" on games        for select using (true);
create policy "anon_read" on teams        for select using (true);
create policy "anon_read" on seasons      for select using (true);
create policy "anon_read" on players      for select using (true);
create policy "anon_read" on player_game_stats     for select using (true);
create policy "anon_read" on player_team_seasons   for select using (true);
```

`user_roles` and admin tables remain authenticated-only.

## File Structure

```
my-motion-app/
├── .env.local                          # NEW — Supabase credentials
├── .env.example                        # NEW — sanitized template
├── src/
│   ├── lib/
│   │   ├── supabase.ts                 # NEW — Supabase client
│   │   └── queries.ts                  # NEW — useRecentResults, useUpcomingGames, useMatch, useMatchStats
│   ├── components/
│   │   ├── ui/
│   │   │   └── Results.tsx             # MODIFY — switch from static data to hooks
│   │   └── match/
│   │       ├── MatchHeader.tsx         # NEW — score header
│   │       ├── QuarterScoresTable.tsx  # NEW — quarter breakdown
│   │       └── BoxScoreTable.tsx       # NEW — per-team player stats
│   ├── pages/
│   │   └── MatchPage.tsx               # NEW — /match/:id page
│   └── App.jsx                         # MODIFY — wrap in QueryClientProvider, add /match/:id route
└── package.json                        # MODIFY — add @supabase/supabase-js, @tanstack/react-query
```

## Key Components

### `lib/supabase.ts`
Singleton Supabase client reading `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` from env. Throws if missing.

### `lib/queries.ts`
TanStack Query hooks:
- `useRecentResults(limit?: number)` — played games in active season, joined with home/away teams, ordered by date desc
- `useUpcomingGames(limit?: number)` — scheduled games in active season, joined with teams, ordered by date asc
- `useMatch(id: string)` — single game with home/away teams
- `useMatchStats(id: string)` — `player_game_stats` rows joined with `players` for one game

All hooks use queryKey conventions matching admin: `['games', 'recent']`, `['match', id]`, etc.

### `components/ui/Results.tsx` (modified)
- Drop import of `RECENT_RESULTS`, `UPCOMING_GAMES`
- Use `useRecentResults()` and `useUpcomingGames()` instead
- Map DB shape (snake_case fields) to existing render code
- Show skeleton rows while loading; show "לא ניתן לטעון משחקים כעת" on error
- Wrap each "results" row in a `<Link to={"/match/" + g.id}>` for navigation
- Keep all existing styling, easing, animations

### `components/match/MatchHeader.tsx`
Dark themed header (consistent with hero):
- Background: `#07080C` with subtle orange ambient glow
- Two team blocks with logos + names
- Big centered score; winner score in `#FF4D00`
- Meta line: `{round} · {date} · {time} · {hall}`
- Back link: "← חזרה למשחקים"

### `components/match/QuarterScoresTable.tsx`
Glass-style table:
- Header row: קבוצה · רבע 1 · רבע 2 · רבע 3 · רבע 4 · סה״כ
- Two data rows with team names; score column highlighted
- Border + low-opacity background, like `Standings.tsx` style

### `components/match/BoxScoreTable.tsx`
Per-team stat table:
- Title bar with team logo + name + total score, in team color
- Header columns: # · שחקנית · דק׳ · נק׳ · 2נק · 3נק · עונשין · רבד · רבת · אס · חט · חס · איב · עב · מדד
- Player rows
- Footer: "סה״כ" row with totals
- Style matches `Standings.tsx` (glass, alternating rows, hover)

### `pages/MatchPage.tsx`
Orchestrator:
- Reads `:id` from route
- Loading → skeleton
- Error or no-match → message
- Renders MatchHeader + QuarterScoresTable + two BoxScoreTables
- If `status !== 'played'`: show MatchHeader + "המשחק טרם שוחק" only

### `App.jsx`
- Wrap in `<QueryClientProvider>` at top
- Add `<Route path="/match/:id" element={<MatchPage />} />`

## Validation / Empty States

- No active season → empty list with "אין עונה פעילה כעת"
- No games → "אין משחקים בעונה זו"
- Game not found → "המשחק לא נמצא" + back link
- No player stats (game played but stats missing) → show only quarter table + note

## Out of Scope (Sub-project 6B)

- Standings page wired to real data
- Stats (top scorers) page wired to real data
- News/article system
- SEO meta tags per match
- Match URL in DB (currently match_url isn't stored — could be added later)

## Testing

Manual end-to-end on the public site:
1. Visit `/` → click "תוצאות" tab → see real games from active season
2. Click a game row → navigates to `/match/:id`
3. Match page shows header, quarter scores, two box-score tables
4. Click back → returns to home
5. Refresh on a match URL directly → page loads correctly

No automated tests planned for this sub-project (public site has no testing framework set up). Manual visual QA only.
