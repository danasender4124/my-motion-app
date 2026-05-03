# Public Site — Team Profile Page Design (Sub-project 6C)

## Goal
Add a public-facing team profile page (`/team/:id`) to `my-motion-app` displaying each team's profile, roster, schedule, season stats, leaders, and contact info. Make team logos clickable across the public site to navigate to this page.

## Architecture

Same pattern as `/match/:id` and `/player/:id`: read directly from Supabase via the existing client using public anon-read RLS policies. TanStack Query handles caching. New hooks fetch team profile, roster, games, season stats, and leaders.

## Routes

- `/team/:id` — new

## UX

### Page sections (vertical scroll)

1. **TeamHeader** — logo (96×96 circle, initials fallback), team name, city + hall name. Background uses `home_color` with contrast-aware text via existing YIQ helper.
2. **TeamQuickStats** — four metrics in a row: W-L record, league position, points scored, points allowed.
3. **TeamRoster** — responsive grid of player cards (photo, jersey number, first/last name, position label). Each card is `<Link to="/player/:id">`.
4. **TeamLeaders** — three cards (PPG, RPG, APG). Each shows the leading player's photo, name, and average. Each card links to `/player/:id`.
5. **TeamSchedule** — table of all season games for this team: date, opponent (logo + name), result (W/L score or "טרם שוחק" for unplayed), ↗ link to `/match/:id` for played games.
6. **TeamContact** — venue address (`hall_address`), phone, email, social links (facebook, instagram, youtube, twitter) as icon row.

### Empty / fallback states
- Team not found → "הקבוצה לא נמצאה" + back link
- No roster yet → "טרם שובץ סגל לעונה זו"
- No games → "טרם נקבע לוח משחקים"
- Missing contact fields → omit row silently
- No leaders (no stats yet) → hide section

### Theme
Consistent with public dark theme: `#07080C` background, `#FF4D00` accent, `#F2EDE6` text, `rgba(255,255,255,0.04)` surfaces. RTL via `dir="rtl"`.

## Data Flow

Five new hooks in `lib/queries.ts`:

| Hook | Returns | Source |
|---|---|---|
| `useTeam(id)` | `TeamProfile` (id, name, logo, colors, city, hall_address, contact, social_links) | `teams` table |
| `useTeamRoster(teamId)` | `RosterPlayer[]` (id, first_name, last_name, photo, position, jersey_number) | `player_team_seasons` join `players`, filtered by active `season_id` |
| `useTeamGames(teamId)` | `GameWithTeams[]` | `games` filtered by `home_team_id == id OR away_team_id == id`, sorted by date |
| `useTeamSeasonStats(teamId)` | `{ wins, losses, points_for, points_against, position }` | Computed from all played games (status='played') for active season; position from full league standings calc |
| `useTeamLeaders(teamId)` | `{ ppg: LeaderRow, rpg: LeaderRow, apg: LeaderRow }` (each: player_id, name, photo, avg) | Aggregate `player_game_stats` for this team's players this season; pick top average per category |

Page orchestrator `TeamPage.tsx` calls all five in parallel.

### Standings / leaders aggregation

- W-L: count games where this team's score > opponent's; opposite for losses
- Points for/against: sum of team's score vs opponent's across played games
- Position: compute full standings (W-L for all teams) and find this team's rank — share logic with existing `Standings.tsx` if possible (extract helper into `lib/aggregations.ts`); otherwise inline a small computation
- Leaders: only count players who played ≥ N games (N = 1 for now to keep it simple — adjust later if results are noisy)

## Linking changes (logo clickability)

| File | Change |
|---|---|
| `Header.tsx` | Replace hardcoded `TEAM_LOGOS` array with `useTeams()` query result; wrap each logo in `<Link to="/team/:id">`. Hardcoded fallback list kept as default ordering hint by file index, but mapping to DB rows is by row order from query (sorted by name). |
| `Standings.tsx` | Wrap each team row in `<Link to="/team/:id">` |
| `Results.tsx` | Wrap home/away team logos inside game cards in `<Link to="/team/:id">` with `e.stopPropagation()` to avoid triggering the parent's `/match/:id` navigation |
| `MatchHeader.tsx` (in `/match/:id`) | Wrap home/away logo+name in `<Link to="/team/:id">` |

### Header note

The current `TEAM_LOGOS` array references local files (`/teams/team-01.png`). These files are visual assets unrelated to DB rows. We replace the hardcoded list entirely with DB-driven team logos (each team's `logo` field). Teams without a logo show initials fallback.

## File Structure

```
my-motion-app/
└── src/
    ├── lib/
    │   ├── queries.ts                 # MODIFY — add 5 hooks + types
    │   └── aggregations.ts            # NEW — shared W-L / standings / leaders helpers
    ├── components/
    │   ├── team/
    │   │   ├── TeamHeader.tsx         # NEW
    │   │   ├── TeamQuickStats.tsx     # NEW
    │   │   ├── TeamRoster.tsx         # NEW
    │   │   ├── TeamLeaders.tsx        # NEW
    │   │   ├── TeamSchedule.tsx       # NEW
    │   │   └── TeamContact.tsx        # NEW
    │   ├── ui/
    │   │   ├── Header.tsx             # MODIFY — DB logos + Link
    │   │   ├── Standings.tsx          # MODIFY — wrap row in Link
    │   │   └── Results.tsx            # MODIFY — wrap logos in Link
    │   └── match/
    │       └── MatchHeader.tsx        # MODIFY — wrap logos in Link
    ├── pages/
    │   └── TeamPage.tsx               # NEW
    └── App.jsx                        # MODIFY — add /team/:id route
```

## Permissions

Existing `anon_read` RLS policies cover `teams`, `players`, `player_team_seasons`, `player_game_stats`, `games`. No new policies needed.

## Out of Scope

- Multi-season history per team
- Comparison views between teams
- Edit-from-public functionality
- Team news / articles
- SEO metadata per team
- All-time franchise records
