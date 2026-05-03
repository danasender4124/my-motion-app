# Public Site — Stats Leaders Page Redesign (Sub-project 6D)

## Goal
Redesign the public `/stats` page from the current 3-tab bar-chart view into a comprehensive league-leaders board modeled on basket.co.il. Show 15 stat categories, each with the top 5 players, sortable by season stage (regular season vs full season).

## Architecture
Replace the contents of `Stats.tsx` (currently uses mock `TOP_SCORERS` from `data/league.ts`). Add one new hook (`useLeagueLeaders`) and two new components (`LeaderCard`, `LeadersGrid`). Read directly from Supabase using existing anon-read RLS. TanStack Query handles caching.

## Routes
- `/stats` — modified

## UX

### Sub-tabs (top of page)
Two tabs:
- **עונה סדירה** (default) — only games whose `round` does not contain "פלייאוף"
- **כל העונה** — all games regardless of round

### Categories (15 total, in 3 grouped rows of 5)

**Row 1 — ראשי (primary)**
1. נקודות (PPG)
2. ריבאונדים (RPG)
3. אסיסטים (APG)
4. יעילות (efficiency per game)
5. דקות משחק (MPG)

**Row 2 — הגנה ושליטה (defense & control)**
6. חטיפות (SPG)
7. איבודים (TOPG, sorted ascending — fewest is "best")
8. יחס אסיסטים/איבודים (A/TO ratio)
9. חסימות (BPG)
10. % מהעונשין (FT%)

**Row 3 — קליעות (shooting)**
11. % מ-2 (FG2%)
12. % מ-3 (FG3%)
13. זריקות עונשין למשחק (FT made/game)
14. זריקות מ-2 למשחק (FG2 made/game)
15. זריקות מ-3 למשחק (FG3 made/game)

### Card layout
Each card:
- Orange title bar with category label
- Top 5 list (rank, player name, team, value)
- Top player highlighted in orange (`#FF4D00`); ranks 2–5 in muted text
- "לדירוג המלא" link at bottom (placeholder — links to `/stats/category/:key` if/when full leaderboards exist; for now `aria-disabled`/visual only)
- Player names link to `/player/:id`

### Empty / loading
- Loading: "טוען..." centered
- No data for category: card still renders with "אין נתונים מספיקים"
- Error: section-level error message

### Theme
Consistent with public dark theme: `#07080C` background, `#FF4D00` accent, `#F2EDE6` text, `rgba(255,255,255,0.04)` surfaces. RTL via `dir="rtl"`.

## Data Flow

### Hook: `useLeagueLeaders(stage: 'regular' | 'all')`

Returns `LeagueLeaders` — a map keyed by category id (`ppg`, `rpg`, ..., `fg3_per_game`) to an array of up to 5 `LeaderRow` objects.

Steps inside the hook:
1. Fetch active season id
2. Fetch all games for that season; filter out playoff rounds if stage === 'regular'
3. Fetch all `player_game_stats` rows where `game_id IN (filtered ids)`, joining player (id, first_name, last_name, photo) and team (id, name, logo)
4. Group rows by `player_id`. For each player accumulate sums + games count + identity
5. For each of the 15 categories, compute the per-player average (or ratio for A/TO; or percentage for shooting %), filter by minimums, sort descending (ascending for turnovers), and take top 5

### Minimum thresholds
- Percentage stats (`ft_pct`, `fg2_pct`, `fg3_pct`): require **≥ 10 attempts** total
- All others: require **≥ 1 game played** (`games >= 1`)

### Aggregation helper
Add a new exported helper `computeLeagueLeaders(rows, gameIds)` to `lib/aggregations.ts`. The hook handles fetching; the helper handles pure computation (so it stays testable / inspectable without a network).

## Types (in `lib/queries.ts`)

```ts
export type LeaderCategoryKey =
  | 'ppg' | 'rpg' | 'apg' | 'eff' | 'mpg'
  | 'spg' | 'topg' | 'ato' | 'bpg' | 'ft_pct'
  | 'fg2_pct' | 'fg3_pct' | 'ft_made_pg' | 'fg2_made_pg' | 'fg3_made_pg';

export interface LeagueLeaderRow {
  player_id: string;
  first_name: string;
  last_name: string;
  photo: string | null;
  team_id: string | null;
  team_name: string | null;
  team_logo: string | null;
  value: number;   // already rounded for display (1 decimal for averages, 1 decimal for %)
  games: number;
}

export type LeagueLeaders = Record<LeaderCategoryKey, LeagueLeaderRow[]>;
```

## File Structure

```
my-motion-app/
└── src/
    ├── lib/
    │   ├── queries.ts                   # MODIFY — add useLeagueLeaders + types
    │   └── aggregations.ts              # MODIFY — add computeLeagueLeaders
    ├── components/
    │   ├── stats/
    │   │   ├── LeaderCard.tsx           # NEW — single category card
    │   │   └── LeadersGrid.tsx          # NEW — 3 rows x 5 cards
    │   └── ui/
    │       └── Stats.tsx                # MODIFY — replace contents (sub-tabs + grid)
```

## Permissions
Existing `anon_read` RLS policies on `player_game_stats`, `players`, `teams`, `games`, `seasons` cover all reads. No new policies needed.

## Out of Scope
- Full leaderboards per category (`/stats/category/:key`) — link is placeholder for now
- Filters by team / position / classification
- "המלכה הישראלית" (top Israeli scorer) — not requested in current 15
- Per-game vs total toggle — only per-game / averages shown
- Career or multi-season leaders
- Export / share buttons
