# WBPL Admin — Games + Statistics UI Design (Sub-project 4A)

## Goal
Display all games and player/team statistics already in the database. Enable users to browse the season's games, view full box scores, see per-player and per-team aggregated stats, and find league leaders.

## Architecture

Two new pages and three new tab views — all read-only. No write operations in this sub-project (writes come later when the admin needs to enter games manually). Aggregates are computed server-side via PostgREST views or client-side via TanStack Query — for now we'll do client-side aggregation since the dataset is small (≤ 200 games × ~25 stats).

Data is already in the database from sub-project scraping work:
- `games` table with quarter_scores, home_score, away_score, status
- `player_game_stats` with per-game per-player stats

## Routes

- `/games` — list of all games (sortable, filterable)
- `/games/:id` — full box score for one game
- `/players/:id` (existing) — enable "סטטיסטיקה" tab
- `/teams/:id` (existing) — enable "משחקים" tab
- `/stats` — league leaders by category

## UX

### `/games` — Games list
**Header:** "משחקים" + filter row.
**Filters:**
- עונה (default: active)
- קבוצה (default: כל הקבוצות) — matches if team is home or away
- סטטוס (שוחקו / מתוכננים / הכל) — default: שוחקו
- חיפוש לפי תאריך (date input — single date filter)

**Table** sorted by date desc:
| תאריך | מחזור | מארחת (logo+name) | תוצאה | אורחת (logo+name) | סטטוס |

- Score cell shows `86-73` for played games; `—` for scheduled
- Click row → `/games/:id`
- Empty state: "אין משחקים בעונה זו."

### `/games/:id` — Box score
**Header:**
- Back link "חזרה למשחקים"
- Three-column layout:
  - Home team (logo, name) — right side in RTL
  - Big score `86 - 73` in center (winner score in orange)
  - Away team (logo, name) — left side
- Meta line: `{date} · {time} · {round} · {hall} · {status_label}`

**Quarter scores table** (4 columns + total).

**Box score** — two stacked tables (home then away):
- Header includes team name with logo
- Columns: # | שחקנית | דק' | נק' | 2 נק | 3 נק | עונשין | רבד | רבת | אס | חט | חס | איב | עב | מדד
- Score formatting: `5-11` for FG2/FG3/FT (made-attempted)
- Player name → link to `/players/:id`
- Footer row: team totals (sum of all stats)

If `status === 'scheduled'`: hide quarter table and box scores; show "המשחק טרם שוחק".

### Player profile — "סטטיסטיקה" tab
Enable the currently-disabled tab. Content:

**Season averages card** (centered, large numbers):
- נק׳ · רבד · אסי · חט · מדד (per game)
- Below: `משחקים: N · דקות ממוצע: X.X`

**Per-game table:**
| תאריך | יריבה | תוצאה (W/L + score) | דק׳ | נק׳ | רבד | אסי | מדד | קישור (🔗 to game) |

Sort by date desc. Empty state: "אין סטטיסטיקה לעונה זו."

### Team profile — "משחקים" tab
Enable the currently-disabled tab. Content:

**Team summary card:**
- Record: `17-1` (W-L)
- Points for / against averages, point differential

**Games table** (same columns as `/games` page but filtered to this team).

### `/stats` — League leaders
Tabbed view:
- נקודות (PPG)
- ריבאונדים (RPG)
- אסיסטים (APG)
- חטיפות (SPG)
- חסימות (BPG)
- מדד יעילות (per game)

Each tab is the same `LeaderboardTable` with a different stat:
| מקום | שחקנית | קבוצה | משחקים | סה״כ | ממוצע |

- Top 20 only
- Min games filter: default 5 (qualifying threshold)
- Sort by per-game average descending
- Click player name → `/players/:id`

## Aggregation Logic (`src/features/stats/aggregations.ts`)

All client-side, exported as pure functions:

```ts
calcPlayerSeasonAverages(stats: PlayerGameStats[]): SeasonAverages
calcTeamRecord(games: Game[], teamId: string): { wins: number; losses: number; pf: number; pa: number }
calcLeaderboard(stats: PlayerGameStatsWithPlayer[], statKey: keyof PlayerGameStats, minGames: number): LeaderEntry[]
calcTeamTotalsForGame(stats: PlayerGameStats[]): TeamTotals
```

## File Structure

```
src/features/games/
  games.types.ts                   # Game, GameWithTeams
  games.queries.ts                 # useGames, useGame, useGameStats
  GamesFilters.tsx                 # Filter row
  GamesTable.tsx                   # Sortable table
  GameHeader.tsx                   # Score header
  QuarterScoresTable.tsx           # 4-quarter breakdown
  BoxScoreTable.tsx                # Per-team player stats table

src/features/stats/
  stats.types.ts                   # PlayerGameStats joined types
  stats.queries.ts                 # useLeagueLeaders, usePlayerSeasonStats, useTeamGameStats
  aggregations.ts                  # Pure functions
  SeasonAveragesCard.tsx           # Player season averages
  PlayerGameLog.tsx                # Per-game log for a player
  TeamSummaryCard.tsx              # W-L + averages card
  LeaderboardTable.tsx             # Reusable top-20 table
  LeaderboardTabs.tsx              # Tab switcher for stat categories

src/pages/
  GamesListPage.tsx                # /games
  GameDetailPage.tsx               # /games/:id
  StatsPage.tsx                    # /stats

# Modified files:
src/pages/PlayerDetailPage.tsx     # Enable stats tab
src/pages/TeamDetailPage.tsx       # Enable games tab
src/App.tsx                        # Wire 3 routes
```

## TanStack Query Hooks

- `useGames(filters)` — list with filters (season, team, status, date)
- `useGame(id)` — single game with home/away teams joined
- `useGameStats(gameId)` — both teams' player stats for one game, joined with players
- `usePlayerSeasonStats(playerId, seasonId)` — all `player_game_stats` rows for player in season, joined with games
- `useTeamGames(teamId, seasonId)` — all games for team in season
- `useLeagueLeaders(seasonId, statKey, minGames)` — sorted leaders for a stat

## Validation / Empty States

- Game with no quarter scores → show only summary, hide table
- Player with no stats → "אין סטטיסטיקה לעונה זו"
- Team with no games → "אין משחקים בעונה זו"
- Leaderboard with no qualifying players → "אין שחקניות שעמדו במינימום משחקים"

## Permissions

All authenticated users can read (existing RLS). No writes here.

## Testing

- Unit tests for aggregation functions (averages, win-loss record, leaderboard sorting)
- Component tests for `GamesTable`, `BoxScoreTable`, `LeaderboardTable`, `SeasonAveragesCard`
- Mock Supabase in all tests

## Out of Scope (Sub-project 4B)

- Charts and trends (per-player season-over-season, team momentum)
- Player vs player comparison
- Game-by-game scoring trends
- Radar charts and advanced visualizations
- Manually creating/editing games (admin write flow — later)
