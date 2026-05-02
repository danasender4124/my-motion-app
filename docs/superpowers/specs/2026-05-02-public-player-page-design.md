# Public Site — Player Profile Page Design (Sub-project 6B)

## Goal
Add a public-facing player profile page (`/player/:id`) to `my-motion-app` that displays each player's personal info and current-season statistics. Link to it from the player names in the box-score tables on `/match/:id`.

## Architecture

Same approach as `/match/:id`: read directly from Supabase via the existing client, using the public anon-read RLS policies that are already in place. TanStack Query handles caching. Two new hooks fetch the player profile and season stats.

## Routes

- `/player/:id` — new

## UX

### Header
Dark themed header consistent with `MatchHeader` and the public site theme (`#07080C` background + `#FF4D00` accent).

```
┌─────────────────────────────────────────┐
│ ← חזרה                                    │
│ [photo] ספרקל טיילור                      │
│         #23 · בנות פתח תקווה · F          │
│         גיל 28 · ארצות הברית · זרה        │
└─────────────────────────────────────────┘
```

- Back link: "← חזרה" (uses browser history)
- Photo: 96×96 circle (initials fallback if no photo)
- Name: large, white text
- First meta line: jersey · team · position
- Second meta line: age · nationality · classification

If the player isn't currently assigned to any team in the active season, the meta line shows just position/age/nationality.

### Season averages card
Reusable styled card. Stats shown:
- נק׳ (PPG)
- רבד (RPG)
- אסי (APG)
- חט (SPG)
- מדד (efficiency per game)

Bottom row: `משחקים: N · דקות ממוצע: X.X`.

### Game log table
Per-game stats this player played in the current season, sorted by date desc.

Columns: תאריך · יריבה · תוצאה · דק׳ · נק׳ · רבד · אסי · מדד · משחק.

- "תוצאה" cell shows `נצ׳ 86-73` (won) or `הפ׳ 70-86` (lost), from the player's team perspective
- "משחק" cell is a 🔗 icon linking to `/match/:gameId`
- Empty state: "אין סטטיסטיקה לעונה זו"

### Updated BoxScoreTable on /match/:id
Currently the player name is a `<span>`. Change it to a `<Link to="/player/:id">` so visitors can click through.

## Data Flow

1. `/player/:id` page loads → `usePlayer(id)` fires
2. Hook fetches player from `players` table joined with current `player_team_seasons` row (active season) → returns player info + team + jersey
3. `usePlayerStats(id, seasonId)` fires in parallel → returns per-game rows joined with games + opponent teams
4. Page renders Header + SeasonAveragesCard + PlayerGameLog

## Aggregation

Public site doesn't have its own `aggregations.ts`. We'll inline a simple `calcAverages` helper in `lib/queries.ts` (small, pure). DRY pull from admin isn't worth setting up cross-package imports for one function.

## File Structure

```
my-motion-app/
└── src/
    ├── lib/
    │   └── queries.ts                      # MODIFY — add usePlayer, usePlayerStats, calcAverages
    ├── components/
    │   ├── player/
    │   │   ├── PlayerHeader.tsx            # NEW
    │   │   ├── SeasonAveragesCard.tsx      # NEW
    │   │   └── PlayerGameLog.tsx           # NEW
    │   └── match/
    │       └── BoxScoreTable.tsx           # MODIFY — wrap player name in Link
    ├── pages/
    │   └── PlayerPage.tsx                  # NEW
    └── App.jsx                             # MODIFY — add /player/:id route
```

## Validation / Empty States

- Player not found → "השחקנית לא נמצאה" + back link
- No active season → assume DB has one (already enforced); fallback message if not
- No stats for this season → header still renders; "אין סטטיסטיקה לעונה זו"
- No photo → initials in circle (same logic as admin)

## Permissions

Existing `anon_read` RLS policies cover `players`, `player_game_stats`, `player_team_seasons`, `games`, `teams`, `seasons`. No new policies needed.

## Out of Scope

- Career stats across multiple seasons
- Team/league leaders integration
- Comparison views
- News/articles linked to players
- SEO metadata per player
- Edit-from-public functionality (admin only)
