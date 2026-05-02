# WBPL Admin — Games + Statistics UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build read-only views for games, box scores, per-player season stats, per-team game logs, and league leaders — all from existing data.

**Architecture:** Three new pages (`/games`, `/games/:id`, `/stats`) plus enabling two existing tab placeholders. Pure-function aggregation module (`stats/aggregations.ts`) keeps math testable. TanStack Query hooks isolate Supabase reads. shadcn/ui table + tabs primitives reused.

**Tech Stack:** React 19, TypeScript, Supabase, TanStack Query v5, shadcn/ui (table, tabs, badge), Vitest, React Testing Library.

---

## File Structure

All paths under `C:\Users\Dana\projects\wbpl-admin\`.

```
src/features/games/
  games.types.ts                # Game, GameWithTeams, GameStatus
  games.queries.ts              # useGames, useGame, useGameStats, useTeamGames
  GamesFilters.tsx              # Filter row
  GamesTable.tsx                # Sortable table
  GameHeader.tsx                # Score header
  QuarterScoresTable.tsx        # 4-quarter breakdown
  BoxScoreTable.tsx             # Per-team player stats table

src/features/stats/
  stats.types.ts                # PlayerGameStats and join shapes
  stats.queries.ts              # usePlayerSeasonStats, useLeagueLeaders, useTeamSeasonStats
  aggregations.ts               # Pure functions
  SeasonAveragesCard.tsx        # Player season averages
  PlayerGameLog.tsx             # Per-game log
  TeamSummaryCard.tsx           # W-L + averages
  LeaderboardTable.tsx          # Top-20 stat table
  LeaderboardTabs.tsx           # Stat category switcher

src/pages/
  GamesListPage.tsx             # /games
  GameDetailPage.tsx            # /games/:id
  StatsPage.tsx                 # /stats

# Modified:
src/pages/PlayerDetailPage.tsx  # Enable stats tab
src/pages/TeamDetailPage.tsx    # Enable games tab
src/App.tsx                     # 3 new routes
```

---

### Task 1: Aggregations module (TDD)

**Files:**
- Create: `src/features/stats/aggregations.ts`
- Create: `src/features/stats/aggregations.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/features/stats/aggregations.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  calcPlayerSeasonAverages,
  calcTeamRecord,
  calcLeaderboard,
  calcTeamTotalsForGame,
} from './aggregations';

const stat = (overrides = {}) => ({
  player_id: 'p1', game_id: 'g1', team_id: 't1',
  minutes: 30, points: 20, rebounds: 5, offensive_rebounds: 1, defensive_rebounds: 4,
  assists: 3, steals: 1, blocks: 0, turnovers: 2, fouls: 2,
  fg2_made: 5, fg2_attempted: 10, fg3_made: 2, fg3_attempted: 5,
  ft_made: 4, ft_attempted: 4, efficiency: 22,
  ...overrides,
});

describe('calcPlayerSeasonAverages', () => {
  it('returns zero averages when empty', () => {
    expect(calcPlayerSeasonAverages([])).toEqual({
      games: 0, ppg: 0, rpg: 0, apg: 0, spg: 0, bpg: 0, mpg: 0, eff_avg: 0,
    });
  });

  it('averages across games', () => {
    const rows = [stat({ points: 20, rebounds: 4 }), stat({ points: 30, rebounds: 6 })];
    const avg = calcPlayerSeasonAverages(rows);
    expect(avg.games).toBe(2);
    expect(avg.ppg).toBe(25);
    expect(avg.rpg).toBe(5);
  });
});

describe('calcTeamRecord', () => {
  const game = (h, a, hScore, aScore) => ({
    id: 'g', season_id: 's', round: null, date: '2025-10-01', time: null,
    home_team_id: h, away_team_id: a, hall: null, status: 'played',
    home_score: hScore, away_score: aScore, quarter_scores: null,
    referees: null, watch_url: null, stats_url: null, video_url: null,
  });

  it('counts wins and losses for a team', () => {
    const games = [
      game('t1', 't2', 80, 70),  // t1 wins
      game('t1', 't3', 60, 75),  // t1 loses
      game('t2', 't1', 70, 90),  // t1 wins (away)
    ];
    expect(calcTeamRecord(games, 't1')).toEqual({ wins: 2, losses: 1, pf: 230, pa: 210 });
  });

  it('skips games not yet played', () => {
    const g1 = game('t1', 't2', 80, 70);
    const g2 = { ...game('t1', 't3', null, null), status: 'scheduled' };
    expect(calcTeamRecord([g1, g2], 't1')).toEqual({ wins: 1, losses: 0, pf: 80, pa: 70 });
  });
});

describe('calcLeaderboard', () => {
  const row = (playerId, points, games) => ({
    player_id: playerId, first_name: 'a', last_name: 'b',
    team_name: 'TEAM', stats: Array.from({ length: games }, () => stat({ points })),
  });

  it('sorts by per-game average desc and includes top N', () => {
    const data = [row('p1', 20, 10), row('p2', 30, 10), row('p3', 25, 10)];
    const leaders = calcLeaderboard(data, 'points', 5);
    expect(leaders[0].player_id).toBe('p2');
    expect(leaders[0].avg).toBe(30);
    expect(leaders[1].player_id).toBe('p3');
  });

  it('excludes players below min games', () => {
    const data = [row('p1', 30, 4), row('p2', 20, 6)];
    const leaders = calcLeaderboard(data, 'points', 5);
    expect(leaders).toHaveLength(1);
    expect(leaders[0].player_id).toBe('p2');
  });
});

describe('calcTeamTotalsForGame', () => {
  it('sums each numeric field', () => {
    const rows = [
      stat({ points: 10, rebounds: 5, assists: 2 }),
      stat({ points: 15, rebounds: 3, assists: 4 }),
    ];
    const totals = calcTeamTotalsForGame(rows);
    expect(totals.points).toBe(25);
    expect(totals.rebounds).toBe(8);
    expect(totals.assists).toBe(6);
  });
});
```

- [ ] **Step 2: Run test, verify failure**

```bash
cd C:\Users\Dana\projects\wbpl-admin
npm test -- --run src/features/stats/aggregations.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement module**

Create `src/features/stats/aggregations.ts`:

```ts
import type { Game } from '@/features/games/games.types';

export interface PlayerGameStats {
  player_id: string;
  game_id: string;
  team_id: string;
  minutes: number | null;
  points: number | null;
  rebounds: number | null;
  offensive_rebounds: number | null;
  defensive_rebounds: number | null;
  assists: number | null;
  steals: number | null;
  blocks: number | null;
  turnovers: number | null;
  fouls: number | null;
  fg2_made: number | null;
  fg2_attempted: number | null;
  fg3_made: number | null;
  fg3_attempted: number | null;
  ft_made: number | null;
  ft_attempted: number | null;
  efficiency: number | null;
}

export interface SeasonAverages {
  games: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  mpg: number;
  eff_avg: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const sum = (rows: PlayerGameStats[], key: keyof PlayerGameStats) =>
  rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);

export const calcPlayerSeasonAverages = (rows: PlayerGameStats[]): SeasonAverages => {
  const games = rows.length;
  if (games === 0) return { games: 0, ppg: 0, rpg: 0, apg: 0, spg: 0, bpg: 0, mpg: 0, eff_avg: 0 };
  return {
    games,
    ppg: round1(sum(rows, 'points') / games),
    rpg: round1(sum(rows, 'rebounds') / games),
    apg: round1(sum(rows, 'assists') / games),
    spg: round1(sum(rows, 'steals') / games),
    bpg: round1(sum(rows, 'blocks') / games),
    mpg: round1(sum(rows, 'minutes') / games),
    eff_avg: round1(sum(rows, 'efficiency') / games),
  };
};

export interface TeamRecord {
  wins: number;
  losses: number;
  pf: number;
  pa: number;
}

export const calcTeamRecord = (games: Game[], teamId: string): TeamRecord => {
  let wins = 0, losses = 0, pf = 0, pa = 0;
  for (const g of games) {
    if (g.status !== 'played' || g.home_score == null || g.away_score == null) continue;
    const isHome = g.home_team_id === teamId;
    const isAway = g.away_team_id === teamId;
    if (!isHome && !isAway) continue;
    const teamScore = isHome ? g.home_score : g.away_score;
    const oppScore = isHome ? g.away_score : g.home_score;
    pf += teamScore;
    pa += oppScore;
    if (teamScore > oppScore) wins++; else if (teamScore < oppScore) losses++;
  }
  return { wins, losses, pf, pa };
};

export interface LeaderEntry {
  player_id: string;
  first_name: string;
  last_name: string;
  team_name: string;
  games: number;
  total: number;
  avg: number;
}

export interface PlayerWithStats {
  player_id: string;
  first_name: string;
  last_name: string;
  team_name: string;
  stats: PlayerGameStats[];
}

export const calcLeaderboard = (
  data: PlayerWithStats[],
  statKey: keyof PlayerGameStats,
  minGames: number
): LeaderEntry[] => {
  const entries: LeaderEntry[] = data
    .filter((d) => d.stats.length >= minGames)
    .map((d) => {
      const total = d.stats.reduce((acc, s) => acc + (Number(s[statKey]) || 0), 0);
      return {
        player_id: d.player_id,
        first_name: d.first_name,
        last_name: d.last_name,
        team_name: d.team_name,
        games: d.stats.length,
        total,
        avg: round1(total / d.stats.length),
      };
    });
  entries.sort((a, b) => b.avg - a.avg);
  return entries;
};

export interface TeamTotals {
  minutes: number;
  points: number;
  rebounds: number;
  offensive_rebounds: number;
  defensive_rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
  fg2_made: number;
  fg2_attempted: number;
  fg3_made: number;
  fg3_attempted: number;
  ft_made: number;
  ft_attempted: number;
  efficiency: number;
}

export const calcTeamTotalsForGame = (rows: PlayerGameStats[]): TeamTotals => ({
  minutes: sum(rows, 'minutes'),
  points: sum(rows, 'points'),
  rebounds: sum(rows, 'rebounds'),
  offensive_rebounds: sum(rows, 'offensive_rebounds'),
  defensive_rebounds: sum(rows, 'defensive_rebounds'),
  assists: sum(rows, 'assists'),
  steals: sum(rows, 'steals'),
  blocks: sum(rows, 'blocks'),
  turnovers: sum(rows, 'turnovers'),
  fouls: sum(rows, 'fouls'),
  fg2_made: sum(rows, 'fg2_made'),
  fg2_attempted: sum(rows, 'fg2_attempted'),
  fg3_made: sum(rows, 'fg3_made'),
  fg3_attempted: sum(rows, 'fg3_attempted'),
  ft_made: sum(rows, 'ft_made'),
  ft_attempted: sum(rows, 'ft_attempted'),
  efficiency: sum(rows, 'efficiency'),
});
```

- [ ] **Step 4: Run tests, verify pass**

```bash
npm test -- --run src/features/stats/aggregations.test.ts
```

Expected: 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/stats/
git commit -m "feat(stats): add pure aggregation functions"
```

---

### Task 2: Game types + queries

**Files:**
- Create: `src/features/games/games.types.ts`
- Create: `src/features/games/games.queries.ts`
- Create: `src/features/games/games.queries.test.ts`

- [ ] **Step 1: Create types**

Create `src/features/games/games.types.ts`:

```ts
import type { GameStatus } from '@/types/database.types';

export interface Game {
  id: string;
  season_id: string;
  round: string | null;
  date: string | null;
  time: string | null;
  home_team_id: string;
  away_team_id: string;
  hall: string | null;
  status: GameStatus;
  home_score: number | null;
  away_score: number | null;
  quarter_scores: { q: number; home: number | null; away: number | null }[] | null;
  referees: string[] | null;
  watch_url: string | null;
  stats_url: string | null;
  video_url: string | null;
}

export interface GameTeamRef {
  id: string;
  name: string;
  logo: string | null;
  home_color: string | null;
  away_color: string | null;
}

export interface GameWithTeams extends Game {
  home_team: GameTeamRef | null;
  away_team: GameTeamRef | null;
}

export interface GamesFilter {
  season_id: string | null;     // null = active season
  team_id: string | null;       // null = all teams
  status: 'played' | 'scheduled' | 'all';
  date: string | null;          // exact date filter
}
```

- [ ] **Step 2: Write failing test**

Create `src/features/games/games.queries.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type ReactNode } from 'react';
import { useGames } from './games.queries';

const orderMock = vi.fn();
const fromMock = vi.fn(() => ({
  select: vi.fn(() => ({
    eq: vi.fn().mockReturnThis(),
    order: orderMock,
    in: vi.fn().mockReturnThis(),
  })),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { from: (...args: unknown[]) => fromMock(...args) },
}));

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
};

describe('useGames', () => {
  beforeEach(() => { fromMock.mockClear(); orderMock.mockReset(); });

  it('returns games sorted by date desc', async () => {
    orderMock.mockResolvedValue({
      data: [{
        id: 'g1', season_id: 's1', round: 'מחזור 1', date: '2025-10-01', time: null,
        home_team_id: 't1', away_team_id: 't2', hall: null,
        status: 'played', home_score: 80, away_score: 70,
        quarter_scores: null, referees: null,
        watch_url: null, stats_url: null, video_url: null,
        home_team: { id: 't1', name: 'A', logo: null, home_color: null, away_color: null },
        away_team: { id: 't2', name: 'B', logo: null, home_color: null, away_color: null },
      }],
      error: null,
    });
    const { result } = renderHook(
      () => useGames({ season_id: 's1', team_id: null, status: 'all', date: null }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});
```

- [ ] **Step 3: Run test, verify failure**

```bash
npm test -- --run src/features/games/games.queries.test.ts
```

Expected: FAIL.

- [ ] **Step 4: Implement queries**

Create `src/features/games/games.queries.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Game, GameWithTeams, GamesFilter, GameTeamRef } from './games.types';
import type { PlayerGameStats } from '@/features/stats/aggregations';

const SELECT_WITH_TEAMS =
  '*, home_team:teams!games_home_team_id_fkey(id, name, logo, home_color, away_color),' +
  ' away_team:teams!games_away_team_id_fkey(id, name, logo, home_color, away_color)';

export const useGames = (filters: GamesFilter) =>
  useQuery({
    queryKey: ['games', filters],
    queryFn: async (): Promise<GameWithTeams[]> => {
      let seasonId = filters.season_id;
      if (!seasonId) {
        const { data: active } = await supabase
          .from('seasons').select('id').eq('status', 'active').maybeSingle();
        seasonId = (active as { id: string } | null)?.id ?? null;
      }
      if (!seasonId) return [];

      let q = supabase
        .from('games')
        .select(SELECT_WITH_TEAMS)
        .eq('season_id', seasonId);

      if (filters.status === 'played') q = q.eq('status', 'played');
      if (filters.status === 'scheduled') q = q.eq('status', 'scheduled');
      if (filters.date) q = q.eq('date', filters.date);

      const { data, error } = await q.order('date', { ascending: false });
      if (error) throw error;

      let rows = (data ?? []) as unknown as GameWithTeams[];
      if (filters.team_id) {
        rows = rows.filter(
          (g) => g.home_team_id === filters.team_id || g.away_team_id === filters.team_id
        );
      }
      return rows;
    },
  });

export const useGame = (id: string | undefined) =>
  useQuery({
    queryKey: ['games', id],
    enabled: !!id,
    queryFn: async (): Promise<GameWithTeams> => {
      const { data, error } = await supabase
        .from('games').select(SELECT_WITH_TEAMS).eq('id', id!).single();
      if (error) throw error;
      return data as unknown as GameWithTeams;
    },
  });

export interface PlayerGameStatsRow extends PlayerGameStats {
  jersey_number?: number | null;
  player: { id: string; first_name: string; last_name: string; photo: string | null } | null;
}

export const useGameStats = (gameId: string | undefined) =>
  useQuery({
    queryKey: ['game_stats', gameId],
    enabled: !!gameId,
    queryFn: async (): Promise<PlayerGameStatsRow[]> => {
      const { data, error } = await supabase
        .from('player_game_stats')
        .select('*, player:players(id, first_name, last_name, photo)')
        .eq('game_id', gameId!);
      if (error) throw error;
      return (data ?? []) as unknown as PlayerGameStatsRow[];
    },
  });

export const useTeamGames = (teamId: string | undefined, seasonId: string | undefined) =>
  useQuery({
    queryKey: ['team_games', teamId, seasonId],
    enabled: !!teamId && !!seasonId,
    queryFn: async (): Promise<GameWithTeams[]> => {
      const { data, error } = await supabase
        .from('games')
        .select(SELECT_WITH_TEAMS)
        .eq('season_id', seasonId!)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as GameWithTeams[];
    },
  });

// Re-export team ref type for components
export type { GameTeamRef, Game };
```

- [ ] **Step 5: Run tests**

```bash
npm test -- --run src/features/games/games.queries.test.ts
```

Expected: 1 test passes.

- [ ] **Step 6: Commit**

```bash
git add src/features/games/
git commit -m "feat(games): add types and tanstack query hooks"
```

---

### Task 3: Stats queries

**Files:**
- Create: `src/features/stats/stats.types.ts`
- Create: `src/features/stats/stats.queries.ts`

- [ ] **Step 1: Create types**

Create `src/features/stats/stats.types.ts`:

```ts
import type { PlayerGameStats } from './aggregations';

export interface PlayerSeasonStatsRow extends PlayerGameStats {
  game: {
    id: string;
    date: string | null;
    home_team_id: string;
    away_team_id: string;
    home_score: number | null;
    away_score: number | null;
    home_team: { id: string; name: string } | null;
    away_team: { id: string; name: string } | null;
  } | null;
}

export interface PlayerWithSeasonStatsAndTeam {
  player_id: string;
  first_name: string;
  last_name: string;
  team_name: string;
  stats: PlayerGameStats[];
}
```

- [ ] **Step 2: Implement queries**

Create `src/features/stats/stats.queries.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { PlayerSeasonStatsRow, PlayerWithSeasonStatsAndTeam } from './stats.types';

export const usePlayerSeasonStats = (playerId: string | undefined, seasonId: string | undefined) =>
  useQuery({
    queryKey: ['player_season_stats', playerId, seasonId],
    enabled: !!playerId && !!seasonId,
    queryFn: async (): Promise<PlayerSeasonStatsRow[]> => {
      const { data: gameIds } = await supabase
        .from('games').select('id').eq('season_id', seasonId!);
      const ids = (gameIds ?? []).map((r: { id: string }) => r.id);
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from('player_game_stats')
        .select(
          '*, game:games(id, date, home_team_id, away_team_id, home_score, away_score,' +
            ' home_team:teams!games_home_team_id_fkey(id, name),' +
            ' away_team:teams!games_away_team_id_fkey(id, name))'
        )
        .eq('player_id', playerId!)
        .in('game_id', ids);
      if (error) throw error;
      const rows = (data ?? []) as unknown as PlayerSeasonStatsRow[];
      rows.sort((a, b) => (b.game?.date ?? '').localeCompare(a.game?.date ?? ''));
      return rows;
    },
  });

export const useLeagueLeaders = (seasonId: string | undefined) =>
  useQuery({
    queryKey: ['league_leaders', seasonId],
    enabled: !!seasonId,
    queryFn: async (): Promise<PlayerWithSeasonStatsAndTeam[]> => {
      const { data: games } = await supabase
        .from('games').select('id').eq('season_id', seasonId!).eq('status', 'played');
      const gameIds = (games ?? []).map((g: { id: string }) => g.id);
      if (gameIds.length === 0) return [];

      const { data: stats } = await supabase
        .from('player_game_stats')
        .select('*, player:players(id, first_name, last_name)')
        .in('game_id', gameIds);

      const seasonId2 = seasonId!;
      const { data: pts } = await supabase
        .from('player_team_seasons')
        .select('player_id, team:teams(id, name)')
        .eq('season_id', seasonId2);
      const teamByPlayer = new Map<string, string>();
      (pts ?? []).forEach((row: { player_id: string; team: { name: string } | null }) => {
        teamByPlayer.set(row.player_id, row.team?.name ?? '');
      });

      const byPlayer = new Map<string, PlayerWithSeasonStatsAndTeam>();
      for (const s of (stats ?? []) as Array<{
        player_id: string; player: { id: string; first_name: string; last_name: string } | null;
        [k: string]: unknown;
      }>) {
        const p = s.player;
        if (!p) continue;
        const cur = byPlayer.get(p.id) ?? {
          player_id: p.id, first_name: p.first_name, last_name: p.last_name,
          team_name: teamByPlayer.get(p.id) ?? '', stats: [],
        };
        cur.stats.push(s as never);
        byPlayer.set(p.id, cur);
      }
      return [...byPlayer.values()];
    },
  });
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit -p tsconfig.app.json
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/stats/
git commit -m "feat(stats): add tanstack query hooks for season stats and leaders"
```

---

### Task 4: GamesFilters + GamesTable (TDD)

**Files:**
- Create: `src/features/games/GamesFilters.tsx`
- Create: `src/features/games/GamesTable.tsx`
- Create: `src/features/games/GamesTable.test.tsx`

- [ ] **Step 1: Write GamesTable test**

Create `src/features/games/GamesTable.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GamesTable from './GamesTable';

const games = [
  {
    id: 'g1', season_id: 's', round: 'פלייאוף', date: '2026-04-23', time: null,
    home_team_id: 't1', away_team_id: 't2', hall: null,
    status: 'played' as const, home_score: 86, away_score: 73,
    quarter_scores: null, referees: null,
    watch_url: null, stats_url: null, video_url: null,
    home_team: { id: 't1', name: 'מכבי רמת גן', logo: null, home_color: null, away_color: null },
    away_team: { id: 't2', name: 'אליצור חולון', logo: null, home_color: null, away_color: null },
  },
];

describe('GamesTable', () => {
  it('renders games with team names and score', () => {
    render(<MemoryRouter><GamesTable games={games} /></MemoryRouter>);
    expect(screen.getByText('מכבי רמת גן')).toBeInTheDocument();
    expect(screen.getByText('אליצור חולון')).toBeInTheDocument();
    expect(screen.getByText('86-73')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<MemoryRouter><GamesTable games={[]} /></MemoryRouter>);
    expect(screen.getByText(/אין משחקים/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement GamesTable**

Create `src/features/games/GamesTable.tsx`:

```tsx
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { GameWithTeams } from './games.types';

interface Props { games: GameWithTeams[] }

const STATUS_LABELS: Record<string, string> = {
  played: 'שוחק',
  scheduled: 'מתוכנן',
  postponed: 'נדחה',
  cancelled: 'בוטל',
};

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const TeamCell = ({ team }: { team: GameWithTeams['home_team'] }) => (
  <div className="flex items-center gap-2 min-w-0">
    <div className="w-7 h-7 rounded shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden">
      {team?.logo
        ? <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
        : <span className="text-[10px] text-gray-400">—</span>}
    </div>
    <span className="font-medium truncate">{team?.name ?? '—'}</span>
  </div>
);

const GamesTable = ({ games }: Props) => {
  const navigate = useNavigate();
  if (games.length === 0) {
    return (
      <div className="border border-dashed rounded-lg py-16 text-center text-gray-500" dir="rtl">
        אין משחקים בעונה זו.
      </div>
    );
  }
  return (
    <div className="border rounded-lg overflow-hidden" dir="rtl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">תאריך</TableHead>
            <TableHead className="text-right">מחזור</TableHead>
            <TableHead className="text-right">מארחת</TableHead>
            <TableHead className="text-right text-center">תוצאה</TableHead>
            <TableHead className="text-right">אורחת</TableHead>
            <TableHead className="text-right">סטטוס</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {games.map((g) => (
            <TableRow key={g.id} className="cursor-pointer" onClick={() => navigate(`/games/${g.id}`)}>
              <TableCell className="tabular-nums">{formatDate(g.date)}</TableCell>
              <TableCell className="text-gray-700">{g.round ?? '—'}</TableCell>
              <TableCell><TeamCell team={g.home_team} /></TableCell>
              <TableCell className="text-center font-bold tabular-nums">
                {g.status === 'played' && g.home_score != null && g.away_score != null
                  ? `${g.home_score}-${g.away_score}`
                  : '—'}
              </TableCell>
              <TableCell><TeamCell team={g.away_team} /></TableCell>
              <TableCell><Badge variant="outline">{STATUS_LABELS[g.status]}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default GamesTable;
```

- [ ] **Step 3: Implement GamesFilters**

Create `src/features/games/GamesFilters.tsx`:

```tsx
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import type { GamesFilter } from './games.types';

interface TeamOpt { id: string; name: string }
interface SeasonOpt { id: string; name: string }

interface Props {
  filters: GamesFilter;
  onChange: (next: GamesFilter) => void;
  teams: TeamOpt[];
  seasons: SeasonOpt[];
}

const ALL = '__all__';

const STATUS_OPTIONS: { v: GamesFilter['status']; label: string }[] = [
  { v: 'played', label: 'שוחקו' },
  { v: 'scheduled', label: 'מתוכננים' },
  { v: 'all', label: 'הכל' },
];

const GamesFilters = ({ filters, onChange, teams, seasons }: Props) => {
  const set = <K extends keyof GamesFilter>(key: K, value: GamesFilter[K]) =>
    onChange({ ...filters, [key]: value });

  const seasonLabel = filters.season_id
    ? (seasons.find((s) => s.id === filters.season_id)?.name ?? 'עונה')
    : 'עונה פעילה';
  const teamLabel = filters.team_id
    ? (teams.find((t) => t.id === filters.team_id)?.name ?? 'קבוצה')
    : 'כל הקבוצות';
  const statusLabel = STATUS_OPTIONS.find((s) => s.v === filters.status)?.label ?? '';

  return (
    <div className="flex flex-wrap items-center gap-3" dir="rtl">
      <Select value={filters.season_id ?? ALL} onValueChange={(v) => set('season_id', v === ALL ? null : v)}>
        <SelectTrigger className="w-36">{seasonLabel}</SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>עונה פעילה</SelectItem>
          {seasons.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.team_id ?? ALL} onValueChange={(v) => set('team_id', v === ALL ? null : v)}>
        <SelectTrigger className="w-44">{teamLabel}</SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>כל הקבוצות</SelectItem>
          {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.status} onValueChange={(v) => set('status', v as GamesFilter['status'])}>
        <SelectTrigger className="w-32">{statusLabel}</SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((s) => <SelectItem key={s.v} value={s.v}>{s.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={filters.date ?? ''}
        onChange={(e) => set('date', e.target.value || null)}
        className="w-44"
      />
    </div>
  );
};

export default GamesFilters;
```

- [ ] **Step 4: Run tests**

```bash
npm test -- --run src/features/games/GamesTable.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/games/
git commit -m "feat(games): add GamesFilters and GamesTable"
```

---

### Task 5: GamesListPage

**Files:**
- Create: `src/pages/GamesListPage.tsx`

- [ ] **Step 1: Implement page**

Create `src/pages/GamesListPage.tsx`:

```tsx
import { useState, useMemo } from 'react';
import { useGames } from '@/features/games/games.queries';
import GamesFilters from '@/features/games/GamesFilters';
import GamesTable from '@/features/games/GamesTable';
import { useTeams } from '@/features/teams/teams.queries';
import { useSeasons } from '@/features/seasons/seasons.queries';
import type { GamesFilter } from '@/features/games/games.types';

const DEFAULT_FILTERS: GamesFilter = {
  season_id: null, team_id: null, status: 'played', date: null,
};

const GamesListPage = () => {
  const [filters, setFilters] = useState<GamesFilter>(DEFAULT_FILTERS);
  const gamesQ = useGames(filters);
  const teamsQ = useTeams('all');
  const seasonsQ = useSeasons();

  const teams = useMemo(() => (teamsQ.data ?? []).map((t) => ({ id: t.id, name: t.name })), [teamsQ.data]);
  const seasons = useMemo(() => (seasonsQ.data ?? []).map((s) => ({ id: s.id, name: s.name })), [seasonsQ.data]);

  return (
    <div dir="rtl" className="space-y-6">
      <h1 className="text-2xl font-bold">משחקים</h1>
      <GamesFilters filters={filters} onChange={setFilters} teams={teams} seasons={seasons} />
      {gamesQ.isLoading && <div className="text-gray-500">טוען...</div>}
      {gamesQ.error && (
        <div className="text-red-600 bg-red-50 p-4 rounded">שגיאה בטעינת המשחקים. נסי לרענן.</div>
      )}
      {gamesQ.data && <GamesTable games={gamesQ.data} />}
    </div>
  );
};

export default GamesListPage;
```

- [ ] **Step 2: Verify TS compiles**

```bash
npx tsc --noEmit -p tsconfig.app.json
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/GamesListPage.tsx
git commit -m "feat(games): add GamesListPage"
```

---

### Task 6: Game detail components (TDD)

**Files:**
- Create: `src/features/games/GameHeader.tsx`
- Create: `src/features/games/QuarterScoresTable.tsx`
- Create: `src/features/games/BoxScoreTable.tsx`
- Create: `src/features/games/BoxScoreTable.test.tsx`

- [ ] **Step 1: Implement GameHeader**

Create `src/features/games/GameHeader.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { GameWithTeams } from './games.types';

const STATUS_LABELS: Record<string, string> = {
  played: 'שוחק', scheduled: 'מתוכנן', postponed: 'נדחה', cancelled: 'בוטל',
};

const formatDate = (iso: string | null) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

interface Props { game: GameWithTeams }

const TeamBlock = ({ team }: { team: GameWithTeams['home_team'] }) => (
  <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
    <div className="w-16 h-16 rounded shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden">
      {team?.logo
        ? <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
        : <span className="text-xs text-gray-400">—</span>}
    </div>
    <div className="text-base font-bold text-center truncate w-full">{team?.name ?? '—'}</div>
  </div>
);

const GameHeader = ({ game }: Props) => {
  const homeWon = game.home_score != null && game.away_score != null && game.home_score > game.away_score;
  const awayWon = game.home_score != null && game.away_score != null && game.away_score > game.home_score;
  const meta = [
    formatDate(game.date),
    game.time?.slice(0, 5),
    game.round,
    game.hall,
    STATUS_LABELS[game.status],
  ].filter(Boolean).join(' · ');

  return (
    <div dir="rtl" className="space-y-4">
      <Link to="/games" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
        <ArrowRight className="w-4 h-4" />
        חזרה למשחקים
      </Link>
      <div className="bg-white rounded-lg border p-6 flex items-center gap-6">
        <TeamBlock team={game.home_team} />
        <div className="flex flex-col items-center gap-2">
          {game.status === 'played' && game.home_score != null && game.away_score != null ? (
            <div className="text-4xl font-black tabular-nums flex items-center gap-3">
              <span style={{ color: homeWon ? '#FF4D00' : '#1f2937' }}>{game.home_score}</span>
              <span className="text-gray-300">-</span>
              <span style={{ color: awayWon ? '#FF4D00' : '#1f2937' }}>{game.away_score}</span>
            </div>
          ) : (
            <Badge variant="outline">{STATUS_LABELS[game.status]}</Badge>
          )}
          <div className="text-xs text-gray-500 text-center">{meta}</div>
        </div>
        <TeamBlock team={game.away_team} />
      </div>
    </div>
  );
};

export default GameHeader;
```

- [ ] **Step 2: Implement QuarterScoresTable**

Create `src/features/games/QuarterScoresTable.tsx`:

```tsx
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import type { GameWithTeams } from './games.types';

interface Props { game: GameWithTeams }

const QuarterScoresTable = ({ game }: Props) => {
  if (!game.quarter_scores || game.quarter_scores.length === 0) return null;
  const qs = game.quarter_scores;
  return (
    <div className="border rounded-lg overflow-hidden" dir="rtl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">קבוצה</TableHead>
            {qs.map((q) => (
              <TableHead key={q.q} className="text-right text-center">רבע {q.q}</TableHead>
            ))}
            <TableHead className="text-right text-center">סה״כ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-semibold">{game.home_team?.name ?? '—'}</TableCell>
            {qs.map((q) => (
              <TableCell key={q.q} className="text-center tabular-nums">{q.home ?? '—'}</TableCell>
            ))}
            <TableCell className="text-center font-bold tabular-nums">{game.home_score ?? '—'}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-semibold">{game.away_team?.name ?? '—'}</TableCell>
            {qs.map((q) => (
              <TableCell key={q.q} className="text-center tabular-nums">{q.away ?? '—'}</TableCell>
            ))}
            <TableCell className="text-center font-bold tabular-nums">{game.away_score ?? '—'}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default QuarterScoresTable;
```

- [ ] **Step 3: Write BoxScoreTable test**

Create `src/features/games/BoxScoreTable.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BoxScoreTable from './BoxScoreTable';

const stats = [
  {
    player_id: 'p1', game_id: 'g1', team_id: 't1',
    minutes: 35, points: 15, rebounds: 6, offensive_rebounds: 0, defensive_rebounds: 6,
    assists: 2, steals: 0, blocks: 1, turnovers: 2, fouls: 2,
    fg2_made: 5, fg2_attempted: 11, fg3_made: 0, fg3_attempted: 6,
    ft_made: 5, ft_attempted: 8, efficiency: 8,
    jersey_number: 12,
    player: { id: 'p1', first_name: 'ויקטוריה', last_name: 'ויויאנס', photo: null },
  },
];

describe('BoxScoreTable', () => {
  it('renders player rows and totals', () => {
    render(<MemoryRouter><BoxScoreTable teamName="מכבי רמת גן" stats={stats} /></MemoryRouter>);
    expect(screen.getByText(/מכבי רמת גן/)).toBeInTheDocument();
    expect(screen.getByText('ויקטוריה ויויאנס')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText(/סה״כ/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Implement BoxScoreTable**

Create `src/features/games/BoxScoreTable.tsx`:

```tsx
import { Link } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { calcTeamTotalsForGame } from '@/features/stats/aggregations';
import type { PlayerGameStatsRow } from './games.queries';

interface Props {
  teamName: string;
  stats: PlayerGameStatsRow[];
}

const fg = (m: number | null, a: number | null) =>
  m == null || a == null ? '—' : `${m}-${a}`;

const BoxScoreTable = ({ teamName, stats }: Props) => {
  const totals = calcTeamTotalsForGame(stats as never);
  return (
    <div className="border rounded-lg overflow-hidden" dir="rtl">
      <div className="bg-gray-50 px-4 py-2 font-bold border-b">{teamName}</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right w-12">#</TableHead>
            <TableHead className="text-right">שחקנית</TableHead>
            <TableHead className="text-right">דק׳</TableHead>
            <TableHead className="text-right">נק׳</TableHead>
            <TableHead className="text-right">2 נק</TableHead>
            <TableHead className="text-right">3 נק</TableHead>
            <TableHead className="text-right">עונשין</TableHead>
            <TableHead className="text-right">רבד</TableHead>
            <TableHead className="text-right">רבת</TableHead>
            <TableHead className="text-right">אס</TableHead>
            <TableHead className="text-right">חט</TableHead>
            <TableHead className="text-right">חס</TableHead>
            <TableHead className="text-right">איב</TableHead>
            <TableHead className="text-right">עב</TableHead>
            <TableHead className="text-right">מדד</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((s) => (
            <TableRow key={s.player_id}>
              <TableCell className="tabular-nums">{s.jersey_number ?? '—'}</TableCell>
              <TableCell className="font-medium">
                {s.player ? (
                  <Link to={`/players/${s.player.id}`} className="hover:underline">
                    {s.player.first_name} {s.player.last_name}
                  </Link>
                ) : '—'}
              </TableCell>
              <TableCell className="tabular-nums">{s.minutes ?? '—'}</TableCell>
              <TableCell className="tabular-nums font-semibold">{s.points ?? '—'}</TableCell>
              <TableCell className="tabular-nums">{fg(s.fg2_made, s.fg2_attempted)}</TableCell>
              <TableCell className="tabular-nums">{fg(s.fg3_made, s.fg3_attempted)}</TableCell>
              <TableCell className="tabular-nums">{fg(s.ft_made, s.ft_attempted)}</TableCell>
              <TableCell className="tabular-nums">{s.defensive_rebounds ?? '—'}</TableCell>
              <TableCell className="tabular-nums">{s.offensive_rebounds ?? '—'}</TableCell>
              <TableCell className="tabular-nums">{s.assists ?? '—'}</TableCell>
              <TableCell className="tabular-nums">{s.steals ?? '—'}</TableCell>
              <TableCell className="tabular-nums">{s.blocks ?? '—'}</TableCell>
              <TableCell className="tabular-nums">{s.turnovers ?? '—'}</TableCell>
              <TableCell className="tabular-nums">{s.fouls ?? '—'}</TableCell>
              <TableCell className="tabular-nums">{s.efficiency ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2} className="font-bold">סה״כ</TableCell>
            <TableCell className="tabular-nums">{totals.minutes}</TableCell>
            <TableCell className="tabular-nums font-bold">{totals.points}</TableCell>
            <TableCell className="tabular-nums">{totals.fg2_made}-{totals.fg2_attempted}</TableCell>
            <TableCell className="tabular-nums">{totals.fg3_made}-{totals.fg3_attempted}</TableCell>
            <TableCell className="tabular-nums">{totals.ft_made}-{totals.ft_attempted}</TableCell>
            <TableCell className="tabular-nums">{totals.defensive_rebounds}</TableCell>
            <TableCell className="tabular-nums">{totals.offensive_rebounds}</TableCell>
            <TableCell className="tabular-nums">{totals.assists}</TableCell>
            <TableCell className="tabular-nums">{totals.steals}</TableCell>
            <TableCell className="tabular-nums">{totals.blocks}</TableCell>
            <TableCell className="tabular-nums">{totals.turnovers}</TableCell>
            <TableCell className="tabular-nums">{totals.fouls}</TableCell>
            <TableCell className="tabular-nums">{totals.efficiency}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default BoxScoreTable;
```

- [ ] **Step 5: Run tests, commit**

```bash
npm test -- --run src/features/games/BoxScoreTable.test.tsx
git add src/features/games/
git commit -m "feat(games): add GameHeader, QuarterScoresTable, BoxScoreTable"
```

---

### Task 7: GameDetailPage

**Files:**
- Create: `src/pages/GameDetailPage.tsx`

- [ ] **Step 1: Implement page**

Create `src/pages/GameDetailPage.tsx`:

```tsx
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useGame, useGameStats } from '@/features/games/games.queries';
import GameHeader from '@/features/games/GameHeader';
import QuarterScoresTable from '@/features/games/QuarterScoresTable';
import BoxScoreTable from '@/features/games/BoxScoreTable';

const GameDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const gameQ = useGame(id);
  const statsQ = useGameStats(id);

  if (gameQ.isLoading) return <div className="text-gray-500" dir="rtl">טוען...</div>;
  if (gameQ.error || !gameQ.data) {
    return (
      <div dir="rtl" className="text-red-600 bg-red-50 p-4 rounded">
        שגיאה בטעינת המשחק. <Link to="/games" className="underline">חזרה לרשימה</Link>
      </div>
    );
  }
  const game = gameQ.data;
  const stats = statsQ.data ?? [];
  const homeStats = stats.filter((s) => s.team_id === game.home_team_id);
  const awayStats = stats.filter((s) => s.team_id === game.away_team_id);

  return (
    <div dir="rtl" className="space-y-6 max-w-6xl mx-auto">
      <GameHeader game={game} />

      {game.status === 'played' ? (
        <>
          <QuarterScoresTable game={game} />
          {homeStats.length > 0 && (
            <BoxScoreTable teamName={game.home_team?.name ?? ''} stats={homeStats} />
          )}
          {awayStats.length > 0 && (
            <BoxScoreTable teamName={game.away_team?.name ?? ''} stats={awayStats} />
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg border p-6 text-center text-gray-500">
          המשחק טרם שוחק.
        </div>
      )}
    </div>
  );
};

export default GameDetailPage;
```

- [ ] **Step 2: Verify TS, commit**

```bash
npx tsc --noEmit -p tsconfig.app.json
git add src/pages/GameDetailPage.tsx
git commit -m "feat(games): add GameDetailPage"
```

---

### Task 8: Player profile stats components

**Files:**
- Create: `src/features/stats/SeasonAveragesCard.tsx`
- Create: `src/features/stats/PlayerGameLog.tsx`

- [ ] **Step 1: Implement SeasonAveragesCard**

Create `src/features/stats/SeasonAveragesCard.tsx`:

```tsx
import type { SeasonAverages } from './aggregations';

interface Props { averages: SeasonAverages }

const Stat = ({ value, label }: { value: number | string; label: string }) => (
  <div className="flex flex-col items-center px-4">
    <span className="text-2xl font-black tabular-nums">{value}</span>
    <span className="text-[11px] uppercase tracking-wider text-gray-500">{label}</span>
  </div>
);

const SeasonAveragesCard = ({ averages }: Props) => (
  <div className="bg-white border rounded-lg p-6" dir="rtl">
    <div className="flex items-center justify-around flex-wrap gap-4">
      <Stat value={averages.ppg} label="נק׳/משחק" />
      <Stat value={averages.rpg} label="ריבאונדים" />
      <Stat value={averages.apg} label="אסיסטים" />
      <Stat value={averages.spg} label="חטיפות" />
      <Stat value={averages.eff_avg} label="מדד" />
    </div>
    <div className="mt-3 pt-3 border-t text-center text-sm text-gray-500">
      משחקים: {averages.games} · דקות ממוצע: {averages.mpg}
    </div>
  </div>
);

export default SeasonAveragesCard;
```

- [ ] **Step 2: Implement PlayerGameLog**

Create `src/features/stats/PlayerGameLog.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import type { PlayerSeasonStatsRow } from './stats.types';

interface Props {
  rows: PlayerSeasonStatsRow[];
  playerTeamId?: string | null;
}

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const PlayerGameLog = ({ rows, playerTeamId }: Props) => {
  if (rows.length === 0) {
    return (
      <div className="border border-dashed rounded-lg py-12 text-center text-gray-500" dir="rtl">
        אין סטטיסטיקה לעונה זו.
      </div>
    );
  }
  return (
    <div className="border rounded-lg overflow-hidden" dir="rtl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">תאריך</TableHead>
            <TableHead className="text-right">יריבה</TableHead>
            <TableHead className="text-right">תוצאה</TableHead>
            <TableHead className="text-right">דק׳</TableHead>
            <TableHead className="text-right">נק׳</TableHead>
            <TableHead className="text-right">רבד</TableHead>
            <TableHead className="text-right">אסי</TableHead>
            <TableHead className="text-right">מדד</TableHead>
            <TableHead className="text-right">משחק</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const game = r.game;
            const opp = playerTeamId
              ? (game?.home_team_id === playerTeamId ? game?.away_team : game?.home_team)
              : game?.away_team;
            const teamScore = playerTeamId && game
              ? (game.home_team_id === playerTeamId ? game.home_score : game.away_score)
              : null;
            const oppScore = playerTeamId && game
              ? (game.home_team_id === playerTeamId ? game.away_score : game.home_score)
              : null;
            const result = teamScore != null && oppScore != null
              ? `${teamScore > oppScore ? 'נצ׳' : 'הפ׳'} ${teamScore}-${oppScore}`
              : '—';
            return (
              <TableRow key={r.game_id}>
                <TableCell className="tabular-nums">{formatDate(game?.date ?? null)}</TableCell>
                <TableCell>{opp?.name ?? '—'}</TableCell>
                <TableCell className="tabular-nums">{result}</TableCell>
                <TableCell className="tabular-nums">{r.minutes ?? '—'}</TableCell>
                <TableCell className="tabular-nums font-semibold">{r.points ?? '—'}</TableCell>
                <TableCell className="tabular-nums">{r.rebounds ?? '—'}</TableCell>
                <TableCell className="tabular-nums">{r.assists ?? '—'}</TableCell>
                <TableCell className="tabular-nums">{r.efficiency ?? '—'}</TableCell>
                <TableCell>
                  <Link to={`/games/${r.game_id}`} className="text-orange-600 hover:underline inline-flex items-center gap-1">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default PlayerGameLog;
```

- [ ] **Step 3: Commit**

```bash
git add src/features/stats/
git commit -m "feat(stats): add SeasonAveragesCard and PlayerGameLog"
```

---

### Task 9: Enable stats tab in PlayerDetailPage

**Files:**
- Modify: `src/pages/PlayerDetailPage.tsx`

- [ ] **Step 1: Update PlayerDetailPage**

In `src/pages/PlayerDetailPage.tsx`:

1. Add imports near top (near other feature imports):

```tsx
import SeasonAveragesCard from '@/features/stats/SeasonAveragesCard';
import PlayerGameLog from '@/features/stats/PlayerGameLog';
import { usePlayerSeasonStats } from '@/features/stats/stats.queries';
import { calcPlayerSeasonAverages } from '@/features/stats/aggregations';
```

2. Inside `PlayerDetailPage` component, before the `return`, add:

```tsx
// Season stats — depends on the active season; we already load allSeasonsQ
const activeSeason = (allSeasonsQ.data ?? []).find((s) => s.status === 'active') ?? null;
const playerStatsQ = usePlayerSeasonStats(id, activeSeason?.id);
const averages = calcPlayerSeasonAverages((playerStatsQ.data ?? []) as never);
const playerCurrentTeamId = headerRow?.team_id ?? null;
```

3. Find the disabled stats tab:

```tsx
<TabsTrigger value="stats" disabled>סטטיסטיקה (בקרוב)</TabsTrigger>
```

Replace with:

```tsx
<TabsTrigger value="stats">סטטיסטיקה</TabsTrigger>
```

4. Add a `<TabsContent value="stats">` after the existing tabs content:

```tsx
<TabsContent value="stats">
  <div className="space-y-4">
    <SeasonAveragesCard averages={averages} />
    <PlayerGameLog rows={playerStatsQ.data ?? []} playerTeamId={playerCurrentTeamId} />
  </div>
</TabsContent>
```

- [ ] **Step 2: Verify TS, run tests**

```bash
npx tsc --noEmit -p tsconfig.app.json
npm test -- --run
```

Expected: tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/pages/PlayerDetailPage.tsx
git commit -m "feat(players): enable stats tab on player profile"
```

---

### Task 10: Team profile games tab

**Files:**
- Create: `src/features/stats/TeamSummaryCard.tsx`
- Modify: `src/pages/TeamDetailPage.tsx`

- [ ] **Step 1: Implement TeamSummaryCard**

Create `src/features/stats/TeamSummaryCard.tsx`:

```tsx
import type { TeamRecord } from './aggregations';

interface Props {
  record: TeamRecord;
}

const Stat = ({ value, label }: { value: string | number; label: string }) => (
  <div className="flex flex-col items-center px-4">
    <span className="text-2xl font-black tabular-nums">{value}</span>
    <span className="text-[11px] uppercase tracking-wider text-gray-500">{label}</span>
  </div>
);

const TeamSummaryCard = ({ record }: Props) => {
  const games = record.wins + record.losses;
  const ppg = games ? Math.round((record.pf / games) * 10) / 10 : 0;
  const opp = games ? Math.round((record.pa / games) * 10) / 10 : 0;
  const diff = record.pf - record.pa;
  return (
    <div className="bg-white border rounded-lg p-6" dir="rtl">
      <div className="flex items-center justify-around flex-wrap gap-4">
        <Stat value={`${record.wins}-${record.losses}`} label="מאזן" />
        <Stat value={ppg} label="נק׳ ממוצע" />
        <Stat value={opp} label="ספיגה ממוצעת" />
        <Stat value={`${diff >= 0 ? '+' : ''}${diff}`} label="הפרש כולל" />
      </div>
    </div>
  );
};

export default TeamSummaryCard;
```

- [ ] **Step 2: Update TeamDetailPage**

In `src/pages/TeamDetailPage.tsx`:

1. Add imports:

```tsx
import TeamSummaryCard from '@/features/stats/TeamSummaryCard';
import GamesTable from '@/features/games/GamesTable';
import { useTeamGames } from '@/features/games/games.queries';
import { calcTeamRecord } from '@/features/stats/aggregations';
```

2. Inside `TeamDetailPage`, before the return:

```tsx
const activeSeason = (allSeasonsQ.data ?? []).find((s) => s.status === 'active') ?? null;
const teamGamesQ = useTeamGames(team.id, activeSeason?.id);
const teamRecord = calcTeamRecord((teamGamesQ.data ?? []) as never, team.id);
```

3. Replace the disabled games tab trigger:

```tsx
<TabsTrigger value="games" disabled>משחקים (בקרוב)</TabsTrigger>
```

with:

```tsx
<TabsTrigger value="games">משחקים</TabsTrigger>
```

4. Add tab content:

```tsx
<TabsContent value="games">
  <div className="space-y-4">
    <TeamSummaryCard record={teamRecord} />
    <GamesTable games={teamGamesQ.data ?? []} />
  </div>
</TabsContent>
```

- [ ] **Step 3: Verify TS, commit**

```bash
npx tsc --noEmit -p tsconfig.app.json
git add src/features/stats/TeamSummaryCard.tsx src/pages/TeamDetailPage.tsx
git commit -m "feat(teams): enable games tab with team summary on team profile"
```

---

### Task 11: Leaderboard components + StatsPage

**Files:**
- Create: `src/features/stats/LeaderboardTable.tsx`
- Create: `src/features/stats/LeaderboardTabs.tsx`
- Create: `src/pages/StatsPage.tsx`

- [ ] **Step 1: Implement LeaderboardTable**

Create `src/features/stats/LeaderboardTable.tsx`:

```tsx
import { Link } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import type { LeaderEntry } from './aggregations';

interface Props {
  entries: LeaderEntry[];
  totalLabel?: string;
}

const LeaderboardTable = ({ entries, totalLabel = 'סה״כ' }: Props) => {
  if (entries.length === 0) {
    return (
      <div className="border border-dashed rounded-lg py-12 text-center text-gray-500" dir="rtl">
        אין שחקניות שעמדו במינימום משחקים.
      </div>
    );
  }
  return (
    <div className="border rounded-lg overflow-hidden" dir="rtl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right w-12">#</TableHead>
            <TableHead className="text-right">שחקנית</TableHead>
            <TableHead className="text-right">קבוצה</TableHead>
            <TableHead className="text-right">משחקים</TableHead>
            <TableHead className="text-right">{totalLabel}</TableHead>
            <TableHead className="text-right">ממוצע</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.slice(0, 20).map((e, i) => (
            <TableRow key={e.player_id}>
              <TableCell className="font-bold tabular-nums">{i + 1}</TableCell>
              <TableCell>
                <Link to={`/players/${e.player_id}`} className="hover:underline font-medium">
                  {e.first_name} {e.last_name}
                </Link>
              </TableCell>
              <TableCell className="text-gray-700">{e.team_name}</TableCell>
              <TableCell className="tabular-nums">{e.games}</TableCell>
              <TableCell className="tabular-nums">{e.total}</TableCell>
              <TableCell className="tabular-nums font-bold">{e.avg}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeaderboardTable;
```

- [ ] **Step 2: Implement LeaderboardTabs**

Create `src/features/stats/LeaderboardTabs.tsx`:

```tsx
import { useState, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { calcLeaderboard } from './aggregations';
import LeaderboardTable from './LeaderboardTable';
import type { PlayerWithSeasonStatsAndTeam } from './stats.types';

interface Props {
  data: PlayerWithSeasonStatsAndTeam[];
  minGames?: number;
}

const CATEGORIES = [
  { key: 'points', label: 'נקודות' },
  { key: 'rebounds', label: 'ריבאונדים' },
  { key: 'assists', label: 'אסיסטים' },
  { key: 'steals', label: 'חטיפות' },
  { key: 'blocks', label: 'חסימות' },
  { key: 'efficiency', label: 'מדד יעילות' },
] as const;

const LeaderboardTabs = ({ data, minGames = 5 }: Props) => {
  const [active, setActive] = useState<typeof CATEGORIES[number]['key']>('points');

  const entries = useMemo(
    () => calcLeaderboard(data as never, active as never, minGames),
    [data, active, minGames]
  );

  return (
    <div dir="rtl">
      <Tabs value={active} onValueChange={(v) => setActive(v as typeof CATEGORIES[number]['key'])}>
        <TabsList dir="rtl">
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c.key} value={c.key}>{c.label}</TabsTrigger>
          ))}
        </TabsList>
        {CATEGORIES.map((c) => (
          <TabsContent key={c.key} value={c.key}>
            <LeaderboardTable entries={entries} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default LeaderboardTabs;
```

- [ ] **Step 3: Implement StatsPage**

Create `src/pages/StatsPage.tsx`:

```tsx
import { useSeasons } from '@/features/seasons/seasons.queries';
import { useLeagueLeaders } from '@/features/stats/stats.queries';
import LeaderboardTabs from '@/features/stats/LeaderboardTabs';

const StatsPage = () => {
  const seasonsQ = useSeasons();
  const active = (seasonsQ.data ?? []).find((s) => s.status === 'active') ?? null;
  const leadersQ = useLeagueLeaders(active?.id);

  return (
    <div dir="rtl" className="space-y-6">
      <h1 className="text-2xl font-bold">סטטיסטיקה — {active?.name ?? 'אין עונה פעילה'}</h1>
      {leadersQ.isLoading && <div className="text-gray-500">טוען...</div>}
      {leadersQ.error && (
        <div className="text-red-600 bg-red-50 p-4 rounded">שגיאה בטעינת הסטטיסטיקה.</div>
      )}
      {leadersQ.data && <LeaderboardTabs data={leadersQ.data} minGames={5} />}
    </div>
  );
};

export default StatsPage;
```

- [ ] **Step 4: Verify TS, commit**

```bash
npx tsc --noEmit -p tsconfig.app.json
git add src/features/stats/ src/pages/StatsPage.tsx
git commit -m "feat(stats): add LeaderboardTable, LeaderboardTabs, StatsPage"
```

---

### Task 12: Wire routes + manual E2E

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update App.tsx**

In `src/App.tsx`:

1. Add imports:

```tsx
import GamesListPage from '@/pages/GamesListPage';
import GameDetailPage from '@/pages/GameDetailPage';
import StatsPage from '@/pages/StatsPage';
```

2. Replace placeholder routes. Find:

```tsx
<Route path="/games"        element={<Placeholder title="משחקים" />} />
<Route path="/stats"        element={<Placeholder title="סטטיסטיקה" />} />
```

Replace with:

```tsx
<Route path="/games" element={<GamesListPage />} />
<Route path="/games/:id" element={<GameDetailPage />} />
<Route path="/stats" element={<StatsPage />} />
```

- [ ] **Step 2: Run all tests + build**

```bash
cd C:\Users\Dana\projects\wbpl-admin
npm test -- --run
npm run build
```

Both should succeed.

- [ ] **Step 3: Manual E2E**

```bash
npm run dev
```

In browser:
1. Login → "משחקים" — should see ~142 played games sorted by date
2. Click row → game detail → see header with score, quarter table, two box scores
3. Click a player name in box score → goes to player profile
4. Player profile → "סטטיסטיקה" tab — see season averages + game log
5. Click 🔗 in game log → goes back to that game
6. Team profile → "משחקים" tab — see W-L card + games list
7. Sidebar "סטטיסטיקה" → see leaderboard with 6 tabs

If all 7 steps pass, the feature is complete.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up /games, /games/:id, /stats routes"
```

---

## Summary

After all tasks complete:
- ✅ `/games` list with filters
- ✅ `/games/:id` full box score with quarter table and two team stat tables
- ✅ Player profile "סטטיסטיקה" tab — season averages + game log
- ✅ Team profile "משחקים" tab — W-L summary + games list
- ✅ `/stats` league leaders across 6 categories
- ✅ Pure aggregation functions covered by unit tests
- ✅ ~10 new passing tests
