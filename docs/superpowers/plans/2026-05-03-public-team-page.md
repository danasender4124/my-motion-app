# Public Team Profile Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public-facing `/team/:id` page on `my-motion-app` that displays team profile, roster, schedule, season stats, leaders, and contact info — and make team logos across the public site link to it.

**Architecture:** Extend `lib/queries.ts` with team-scoped hooks. Create six small section components and one page. Add `lib/aggregations.ts` for shared standings/leaders math. Reuse the existing dark+orange public theme and Supabase/RLS infra. Refactor `Header.tsx` and `Standings.tsx` to use real DB teams (replacing the hardcoded `data/league.ts` mock) so logos can carry real team UUIDs.

**Tech Stack:** React 19, TypeScript, Vite, TanStack Query v5, Supabase JS SDK, React Router v7, Tailwind CSS v4, framer-motion.

---

## File Structure

All paths under `C:\Users\Dana\projects\my-motion-app\`.

```
src/lib/queries.ts                       # MODIFY — add 5 team hooks + types
src/lib/aggregations.ts                  # NEW — shared W-L / standings / leaders helpers
src/components/team/
  TeamHeader.tsx                         # NEW
  TeamQuickStats.tsx                     # NEW
  TeamRoster.tsx                         # NEW
  TeamLeaders.tsx                        # NEW
  TeamSchedule.tsx                       # NEW
  TeamContact.tsx                        # NEW
src/pages/TeamPage.tsx                   # NEW
src/App.jsx                              # MODIFY — add /team/:id route
src/components/ui/Header.tsx             # MODIFY — DB teams + Link
src/components/ui/Standings.tsx          # MODIFY — DB teams + Link
src/components/ui/Results.tsx            # MODIFY — wrap logos in Link
src/components/match/MatchHeader.tsx     # MODIFY — wrap logos in Link
```

**Verification approach:** This project has no test framework (no `vitest`/`jest`). Each task verifies via `npm run build` (must succeed without errors) plus a manual browser smoke check on `npm run dev` for visual tasks.

---

### Task 1: Add `useTeams` and `useTeam` hooks + `TeamProfile` type

**Files:**
- Modify: `src/lib/queries.ts`

- [ ] **Step 1: Add `TeamProfile` interface near other type exports**

After the existing `PlayerProfile` interface in `src/lib/queries.ts`, add:

```ts
export interface TeamProfile {
  id: string;
  name: string;
  logo: string | null;
  home_color: string | null;
  away_color: string | null;
  city: string | null;
  hall_address: string | null;
  contact: { phone?: string; email?: string } | null;
  social_links: { facebook?: string; instagram?: string; youtube?: string; twitter?: string } | null;
}
```

- [ ] **Step 2: Add `useTeams` hook (returns all teams sorted by name)**

Append to `src/lib/queries.ts` (before the last closing of the file):

```ts
export const useTeams = () =>
  useQuery({
    queryKey: ['teams', 'all'],
    queryFn: async (): Promise<TeamProfile[]> => {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, logo, home_color, away_color, city, hall_address, contact, social_links')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as TeamProfile[];
    },
    staleTime: 1000 * 60 * 10,
  });
```

- [ ] **Step 3: Add `useTeam` hook (single team by id)**

Append to `src/lib/queries.ts`:

```ts
export const useTeam = (id: string | undefined) =>
  useQuery({
    queryKey: ['team', id],
    enabled: !!id,
    queryFn: async (): Promise<TeamProfile | null> => {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, logo, home_color, away_color, city, hall_address, contact, social_links')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as TeamProfile | null;
    },
  });
```

- [ ] **Step 4: Verify build**

Run: `cd C:\Users\Dana\projects\my-motion-app && npm run build`
Expected: build succeeds with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat(public): add useTeams and useTeam hooks"
```

---

### Task 2: Add `useTeamRoster` hook

**Files:**
- Modify: `src/lib/queries.ts`

- [ ] **Step 1: Add `RosterPlayer` interface**

After `TeamProfile` in `src/lib/queries.ts`, add:

```ts
export interface RosterPlayer {
  id: string;
  first_name: string;
  last_name: string;
  photo: string | null;
  position: PlayerProfile['position'];
  jersey_number: number | null;
}
```

- [ ] **Step 2: Add `useTeamRoster` hook**

Append to `src/lib/queries.ts`:

```ts
export const useTeamRoster = (teamId: string | undefined) =>
  useQuery({
    queryKey: ['team_roster', teamId],
    enabled: !!teamId,
    queryFn: async (): Promise<RosterPlayer[]> => {
      const { data: activeSeason } = await supabase
        .from('seasons').select('id').eq('status', 'active').maybeSingle();
      const seasonId = (activeSeason as { id: string } | null)?.id ?? null;
      if (!seasonId) return [];

      const { data, error } = await supabase
        .from('player_team_seasons')
        .select('jersey_number, player:players(id, first_name, last_name, photo, position)')
        .eq('team_id', teamId!)
        .eq('season_id', seasonId);
      if (error) throw error;

      const rows = (data ?? []) as Array<{
        jersey_number: number | null;
        player: { id: string; first_name: string; last_name: string; photo: string | null; position: PlayerProfile['position'] } | null;
      }>;

      return rows
        .filter((r) => r.player)
        .map((r) => ({
          id: r.player!.id,
          first_name: r.player!.first_name,
          last_name: r.player!.last_name,
          photo: r.player!.photo,
          position: r.player!.position,
          jersey_number: r.jersey_number,
        }))
        .sort((a, b) => (a.jersey_number ?? 999) - (b.jersey_number ?? 999));
    },
  });
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat(public): add useTeamRoster hook"
```

---

### Task 3: Add `useTeamGames` hook

**Files:**
- Modify: `src/lib/queries.ts`

- [ ] **Step 1: Add `useTeamGames` hook**

Append to `src/lib/queries.ts`:

```ts
export const useTeamGames = (teamId: string | undefined) =>
  useQuery({
    queryKey: ['team_games', teamId],
    enabled: !!teamId,
    queryFn: async (): Promise<GameWithTeams[]> => {
      const { data: activeSeason } = await supabase
        .from('seasons').select('id').eq('status', 'active').maybeSingle();
      const seasonId = (activeSeason as { id: string } | null)?.id ?? null;
      if (!seasonId) return [];

      const { data, error } = await supabase
        .from('games')
        .select(SELECT_GAME)
        .eq('season_id', seasonId)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as GameWithTeams[];
    },
  });
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat(public): add useTeamGames hook"
```

---

### Task 4: Create `lib/aggregations.ts` + `useTeamSeasonStats` hook

**Files:**
- Create: `src/lib/aggregations.ts`
- Modify: `src/lib/queries.ts`

- [ ] **Step 1: Create `src/lib/aggregations.ts`**

```ts
import type { GameWithTeams } from './queries';

export interface TeamSeasonStats {
  wins: number;
  losses: number;
  points_for: number;
  points_against: number;
  position: number | null;
}

const teamRecord = (teamId: string, games: GameWithTeams[]) => {
  let wins = 0, losses = 0, pf = 0, pa = 0;
  for (const g of games) {
    if (g.status !== 'played' || g.home_score == null || g.away_score == null) continue;
    const isHome = g.home_team_id === teamId;
    if (!isHome && g.away_team_id !== teamId) continue;
    const myScore = isHome ? g.home_score : g.away_score;
    const oppScore = isHome ? g.away_score : g.home_score;
    pf += myScore;
    pa += oppScore;
    if (myScore > oppScore) wins++;
    else if (myScore < oppScore) losses++;
  }
  return { wins, losses, points_for: pf, points_against: pa };
};

/**
 * Compute the league position (1-based) for the given team given all season games.
 * Standings are sorted by: wins desc, then point differential desc.
 * Returns null if no teams have played any games yet.
 */
const leaguePosition = (teamId: string, allTeamIds: string[], games: GameWithTeams[]): number | null => {
  const records = allTeamIds.map((tid) => ({ tid, ...teamRecord(tid, games) }));
  if (records.every((r) => r.wins === 0 && r.losses === 0)) return null;
  records.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return (b.points_for - b.points_against) - (a.points_for - a.points_against);
  });
  const idx = records.findIndex((r) => r.tid === teamId);
  return idx >= 0 ? idx + 1 : null;
};

export const computeTeamSeasonStats = (
  teamId: string,
  teamGames: GameWithTeams[],
  allTeamIds: string[],
  allSeasonGames: GameWithTeams[],
): TeamSeasonStats => {
  const rec = teamRecord(teamId, teamGames);
  return {
    ...rec,
    position: leaguePosition(teamId, allTeamIds, allSeasonGames),
  };
};
```

- [ ] **Step 2: Add `useTeamSeasonStats` hook to `queries.ts`**

Append to `src/lib/queries.ts`:

```ts
import { computeTeamSeasonStats, type TeamSeasonStats } from './aggregations';

export const useTeamSeasonStats = (teamId: string | undefined) =>
  useQuery({
    queryKey: ['team_season_stats', teamId],
    enabled: !!teamId,
    queryFn: async (): Promise<TeamSeasonStats> => {
      const { data: activeSeason } = await supabase
        .from('seasons').select('id').eq('status', 'active').maybeSingle();
      const seasonId = (activeSeason as { id: string } | null)?.id ?? null;
      if (!seasonId) return { wins: 0, losses: 0, points_for: 0, points_against: 0, position: null };

      const [gamesRes, teamsRes] = await Promise.all([
        supabase.from('games').select(SELECT_GAME).eq('season_id', seasonId),
        supabase.from('teams').select('id'),
      ]);
      if (gamesRes.error) throw gamesRes.error;
      if (teamsRes.error) throw teamsRes.error;

      const allGames = (gamesRes.data ?? []) as unknown as GameWithTeams[];
      const allTeamIds = ((teamsRes.data ?? []) as Array<{ id: string }>).map((t) => t.id);
      const teamGames = allGames.filter(
        (g) => g.home_team_id === teamId || g.away_team_id === teamId,
      );
      return computeTeamSeasonStats(teamId!, teamGames, allTeamIds, allGames);
    },
  });
```

Move the new `import` line to the top of the file alongside the existing imports. The exported `computeTeamSeasonStats` and re-exported `TeamSeasonStats` type stay in `aggregations.ts`; do not duplicate them in `queries.ts`.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/lib/aggregations.ts src/lib/queries.ts
git commit -m "feat(public): add team season stats aggregation"
```

---

### Task 5: Add `useTeamLeaders` hook

**Files:**
- Modify: `src/lib/queries.ts`

- [ ] **Step 1: Add `TeamLeaders` type**

After the existing `SeasonAverages` interface in `src/lib/queries.ts`, add:

```ts
export interface LeaderRow {
  player_id: string;
  first_name: string;
  last_name: string;
  photo: string | null;
  avg: number;
  games: number;
}

export interface TeamLeaders {
  ppg: LeaderRow | null;
  rpg: LeaderRow | null;
  apg: LeaderRow | null;
}
```

- [ ] **Step 2: Add `useTeamLeaders` hook**

Append to `src/lib/queries.ts`:

```ts
export const useTeamLeaders = (teamId: string | undefined) =>
  useQuery({
    queryKey: ['team_leaders', teamId],
    enabled: !!teamId,
    queryFn: async (): Promise<TeamLeaders> => {
      const { data: activeSeason } = await supabase
        .from('seasons').select('id').eq('status', 'active').maybeSingle();
      const seasonId = (activeSeason as { id: string } | null)?.id ?? null;
      if (!seasonId) return { ppg: null, rpg: null, apg: null };

      const { data: gameIds } = await supabase
        .from('games').select('id').eq('season_id', seasonId);
      const gids = ((gameIds ?? []) as Array<{ id: string }>).map((r) => r.id);
      if (gids.length === 0) return { ppg: null, rpg: null, apg: null };

      const { data, error } = await supabase
        .from('player_game_stats')
        .select('player_id, points, rebounds, assists, player:players(id, first_name, last_name, photo)')
        .eq('team_id', teamId!)
        .in('game_id', gids);
      if (error) throw error;

      type Row = {
        player_id: string;
        points: number | null;
        rebounds: number | null;
        assists: number | null;
        player: { id: string; first_name: string; last_name: string; photo: string | null } | null;
      };
      const rows = (data ?? []) as Row[];

      // Group by player_id
      const byPlayer = new Map<string, { sumP: number; sumR: number; sumA: number; games: number; player: Row['player'] }>();
      for (const r of rows) {
        const cur = byPlayer.get(r.player_id) ?? { sumP: 0, sumR: 0, sumA: 0, games: 0, player: r.player };
        cur.sumP += Number(r.points ?? 0);
        cur.sumR += Number(r.rebounds ?? 0);
        cur.sumA += Number(r.assists ?? 0);
        cur.games += 1;
        cur.player = r.player;
        byPlayer.set(r.player_id, cur);
      }

      const round1 = (n: number) => Math.round(n * 10) / 10;
      const pickTop = (key: 'sumP' | 'sumR' | 'sumA'): LeaderRow | null => {
        let best: { id: string; v: number; games: number; player: Row['player'] } | null = null;
        for (const [id, agg] of byPlayer.entries()) {
          if (agg.games === 0 || !agg.player) continue;
          const avg = agg[key] / agg.games;
          if (!best || avg > best.v) best = { id, v: avg, games: agg.games, player: agg.player };
        }
        if (!best || !best.player) return null;
        return {
          player_id: best.player.id,
          first_name: best.player.first_name,
          last_name: best.player.last_name,
          photo: best.player.photo,
          avg: round1(best.v),
          games: best.games,
        };
      };

      return {
        ppg: pickTop('sumP'),
        rpg: pickTop('sumR'),
        apg: pickTop('sumA'),
      };
    },
  });
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat(public): add useTeamLeaders hook"
```

---

### Task 6: Create `TeamHeader` component

**Files:**
- Create: `src/components/team/TeamHeader.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { TeamProfile } from '../../lib/queries';

const contrastText = (hex: string): string => {
  const m = hex.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return '#fff';
  const v = parseInt(m[1], 16);
  const r = (v >> 16) & 255;
  const g = (v >> 8) & 255;
  const b = v & 255;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? '#07080C' : '#fff';
};

const initials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
};

interface Props { team: TeamProfile }

const TeamHeader: React.FC<Props> = ({ team }) => {
  const accent = team.home_color || '#FF4D00';
  const titleColor = contrastText(accent);

  return (
    <div dir="rtl" className="space-y-4">
      <Link
        to="/standings"
        className="text-sm flex items-center gap-1"
        style={{ color: 'rgba(242,237,230,0.5)' }}
      >
        ← חזרה לטבלת הליגה
      </Link>
      <div
        className="rounded-2xl p-8 flex items-center gap-6"
        style={{ background: accent, border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="w-24 h-24 rounded-full shrink-0 flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.2)', color: titleColor }}
        >
          {team.logo
            ? <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
            : <span className="text-2xl font-black">{initials(team.name)}</span>}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-3xl font-black truncate" style={{ color: titleColor }}>{team.name}</h1>
          {(team.city || team.hall_address) && (
            <div className="text-sm" style={{ color: titleColor, opacity: 0.85 }}>
              {[team.city, team.hall_address].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamHeader;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/team/TeamHeader.tsx
git commit -m "feat(public): add TeamHeader component"
```

---

### Task 7: Create `TeamQuickStats` component

**Files:**
- Create: `src/components/team/TeamQuickStats.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';
import type { TeamSeasonStats } from '../../lib/aggregations';

interface Props { stats: TeamSeasonStats }

const Cell: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col items-center gap-1 flex-1">
    <span className="text-xs uppercase tracking-wider" style={{ color: 'rgba(242,237,230,0.5)' }}>{label}</span>
    <span className="text-2xl font-black tabular-nums" style={{ color: '#F2EDE6' }}>{value}</span>
  </div>
);

const TeamQuickStats: React.FC<Props> = ({ stats }) => (
  <div
    className="rounded-2xl p-6 flex items-stretch gap-4"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    dir="rtl"
  >
    <Cell label="מאזן" value={`${stats.wins}-${stats.losses}`} />
    <Cell label="מיקום" value={stats.position == null ? '—' : `#${stats.position}`} />
    <Cell label="קלעה" value={stats.points_for} />
    <Cell label="ספגה" value={stats.points_against} />
  </div>
);

export default TeamQuickStats;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/team/TeamQuickStats.tsx
git commit -m "feat(public): add TeamQuickStats component"
```

---

### Task 8: Create `TeamRoster` component

**Files:**
- Create: `src/components/team/TeamRoster.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { RosterPlayer } from '../../lib/queries';

const POSITION_LABEL: Record<NonNullable<RosterPlayer['position']>, string> = {
  point_guard: 'PG',
  shooting_guard: 'G',
  small_forward: 'F',
  power_forward: 'PF',
  center: 'C',
};

const initials = (first: string, last: string) =>
  (first?.[0] ?? '') + (last?.[0] ?? '');

interface Props { players: RosterPlayer[] }

const TeamRoster: React.FC<Props> = ({ players }) => {
  if (players.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }} dir="rtl">
        טרם שובץ סגל לעונה זו
      </div>
    );
  }
  return (
    <div dir="rtl">
      <h2 className="text-xl font-black mb-4" style={{ color: '#F2EDE6' }}>סגל</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {players.map((p) => (
          <Link
            key={p.id}
            to={`/player/${p.id}`}
            className="rounded-xl p-3 flex flex-col items-center gap-2 transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              {p.photo
                ? <img src={p.photo} alt={`${p.first_name} ${p.last_name}`} className="w-full h-full object-cover" />
                : <span className="text-base font-black" style={{ color: 'rgba(242,237,230,0.55)' }}>{initials(p.first_name, p.last_name)}</span>}
            </div>
            <div className="text-xs font-black" style={{ color: '#FF4D00' }}>
              {p.jersey_number != null ? `#${p.jersey_number}` : '—'}
              {p.position && <span className="mr-2" style={{ color: 'rgba(242,237,230,0.5)' }}>{POSITION_LABEL[p.position]}</span>}
            </div>
            <div className="text-sm font-semibold text-center truncate w-full" style={{ color: '#F2EDE6' }}>
              {p.first_name} {p.last_name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TeamRoster;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/team/TeamRoster.tsx
git commit -m "feat(public): add TeamRoster component"
```

---

### Task 9: Create `TeamLeaders` component

**Files:**
- Create: `src/components/team/TeamLeaders.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { TeamLeaders, LeaderRow } from '../../lib/queries';

const initials = (first: string, last: string) =>
  (first?.[0] ?? '') + (last?.[0] ?? '');

const Card: React.FC<{ label: string; row: LeaderRow | null }> = ({ label, row }) => (
  <div
    className="rounded-xl p-4 flex flex-col items-center gap-2 flex-1"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
  >
    <span className="text-xs uppercase tracking-wider" style={{ color: 'rgba(242,237,230,0.5)' }}>{label}</span>
    {row ? (
      <Link to={`/player/${row.player_id}`} className="flex flex-col items-center gap-2">
        <div
          className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          {row.photo
            ? <img src={row.photo} alt={`${row.first_name} ${row.last_name}`} className="w-full h-full object-cover" />
            : <span className="text-sm font-black" style={{ color: 'rgba(242,237,230,0.55)' }}>{initials(row.first_name, row.last_name)}</span>}
        </div>
        <span className="text-sm font-semibold" style={{ color: '#F2EDE6' }}>{row.first_name} {row.last_name}</span>
        <span className="text-2xl font-black tabular-nums" style={{ color: '#FF4D00' }}>{row.avg.toFixed(1)}</span>
      </Link>
    ) : (
      <span className="text-sm py-6" style={{ color: 'rgba(242,237,230,0.4)' }}>—</span>
    )}
  </div>
);

interface Props { leaders: TeamLeaders }

const TeamLeaders: React.FC<Props> = ({ leaders }) => {
  if (!leaders.ppg && !leaders.rpg && !leaders.apg) return null;
  return (
    <div dir="rtl">
      <h2 className="text-xl font-black mb-4" style={{ color: '#F2EDE6' }}>מובילות הקבוצה</h2>
      <div className="flex gap-3">
        <Card label="נקודות" row={leaders.ppg} />
        <Card label="ריבאונדים" row={leaders.rpg} />
        <Card label="אסיסטים" row={leaders.apg} />
      </div>
    </div>
  );
};

export default TeamLeaders;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/team/TeamLeaders.tsx
git commit -m "feat(public): add TeamLeaders component"
```

---

### Task 10: Create `TeamSchedule` component

**Files:**
- Create: `src/components/team/TeamSchedule.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { GameWithTeams } from '../../lib/queries';

const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

interface Props { games: GameWithTeams[]; teamId: string }

const TeamSchedule: React.FC<Props> = ({ games, teamId }) => {
  if (games.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }} dir="rtl">
        טרם נקבע לוח משחקים
      </div>
    );
  }
  return (
    <div dir="rtl">
      <h2 className="text-xl font-black mb-4" style={{ color: '#F2EDE6' }}>לוח משחקים</h2>
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="grid items-center px-3 py-2 text-[10px] font-black uppercase tracking-wider"
          style={{ gridTemplateColumns: '90px 1fr 100px 50px', background: 'rgba(255,255,255,0.05)', color: 'rgba(242,237,230,0.45)' }}
        >
          <span className="text-right">תאריך</span>
          <span className="text-right">יריבה</span>
          <span className="text-center">תוצאה</span>
          <span className="text-center">משחק</span>
        </div>
        {games.map((g, i) => {
          const isHome = g.home_team_id === teamId;
          const opp = isHome ? g.away_team : g.home_team;
          const myScore = isHome ? g.home_score : g.away_score;
          const oppScore = isHome ? g.away_score : g.home_score;
          const won = myScore != null && oppScore != null && myScore > oppScore;
          const lost = myScore != null && oppScore != null && myScore < oppScore;
          return (
            <div
              key={g.id}
              className="grid items-center px-3 py-2 text-sm"
              style={{
                gridTemplateColumns: '90px 1fr 100px 50px',
                background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                borderTop: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span className="text-right" style={{ color: 'rgba(242,237,230,0.7)' }}>{formatDate(g.date)}</span>
              <div className="flex items-center gap-2 min-w-0">
                {opp?.logo && <img src={opp.logo} alt={opp.name} style={{ width: 22, height: 22, objectFit: 'contain', flexShrink: 0 }} />}
                <span className="truncate" style={{ color: '#F2EDE6' }}>{opp?.name ?? '—'}</span>
              </div>
              <span className="text-center font-black tabular-nums" style={{ color: won ? '#4ade80' : lost ? '#f87171' : 'rgba(242,237,230,0.4)' }}>
                {g.status === 'played' && myScore != null && oppScore != null
                  ? `${won ? 'נצ׳' : lost ? 'הפ׳' : 'ת׳'} ${myScore}-${oppScore}`
                  : 'טרם שוחק'}
              </span>
              <div className="text-center">
                {g.status === 'played' ? (
                  <Link to={`/match/${g.id}`} style={{ color: '#FF4D00' }} title="פרטי משחק">↗</Link>
                ) : (
                  <span style={{ color: 'rgba(242,237,230,0.25)' }}>↗</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamSchedule;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/team/TeamSchedule.tsx
git commit -m "feat(public): add TeamSchedule component"
```

---

### Task 11: Create `TeamContact` component

**Files:**
- Create: `src/components/team/TeamContact.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';
import type { TeamProfile } from '../../lib/queries';

interface Props { team: TeamProfile }

const SocialIcon: React.FC<{ href: string; label: string; children: React.ReactNode }> = ({ href, label, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
    style={{ background: 'rgba(255,255,255,0.06)', color: '#F2EDE6' }}
  >
    {children}
  </a>
);

const TeamContact: React.FC<Props> = ({ team }) => {
  const c = team.contact ?? {};
  const s = team.social_links ?? {};
  const hasContact = c.phone || c.email;
  const hasSocial = s.facebook || s.instagram || s.youtube || s.twitter;
  const hasVenue = team.hall_address;
  if (!hasContact && !hasSocial && !hasVenue) return null;

  return (
    <div dir="rtl">
      <h2 className="text-xl font-black mb-4" style={{ color: '#F2EDE6' }}>פרטי קשר</h2>
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {hasVenue && (
          <div className="flex items-start gap-3">
            <span className="text-sm shrink-0" style={{ color: 'rgba(242,237,230,0.5)' }}>אולם:</span>
            <span className="text-sm" style={{ color: '#F2EDE6' }}>{team.hall_address}</span>
          </div>
        )}
        {c.phone && (
          <div className="flex items-start gap-3">
            <span className="text-sm shrink-0" style={{ color: 'rgba(242,237,230,0.5)' }}>טלפון:</span>
            <a href={`tel:${c.phone}`} className="text-sm" style={{ color: '#F2EDE6' }} dir="ltr">{c.phone}</a>
          </div>
        )}
        {c.email && (
          <div className="flex items-start gap-3">
            <span className="text-sm shrink-0" style={{ color: 'rgba(242,237,230,0.5)' }}>אימייל:</span>
            <a href={`mailto:${c.email}`} className="text-sm" style={{ color: '#FF4D00' }} dir="ltr">{c.email}</a>
          </div>
        )}
        {hasSocial && (
          <div className="flex items-center gap-2 pt-2">
            {s.facebook  && <SocialIcon href={s.facebook}  label="Facebook">f</SocialIcon>}
            {s.instagram && <SocialIcon href={s.instagram} label="Instagram">IG</SocialIcon>}
            {s.youtube   && <SocialIcon href={s.youtube}   label="YouTube">YT</SocialIcon>}
            {s.twitter   && <SocialIcon href={s.twitter}   label="Twitter">X</SocialIcon>}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamContact;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/team/TeamContact.tsx
git commit -m "feat(public): add TeamContact component"
```

---

### Task 12: Create `TeamPage` and add `/team/:id` route

**Files:**
- Create: `src/pages/TeamPage.tsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `src/pages/TeamPage.tsx`**

```tsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTeam, useTeamRoster, useTeamGames, useTeamSeasonStats, useTeamLeaders } from '../lib/queries';
import TeamHeader from '../components/team/TeamHeader';
import TeamQuickStats from '../components/team/TeamQuickStats';
import TeamRoster from '../components/team/TeamRoster';
import TeamLeaders from '../components/team/TeamLeaders';
import TeamSchedule from '../components/team/TeamSchedule';
import TeamContact from '../components/team/TeamContact';

const TeamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const teamQ = useTeam(id);
  const rosterQ = useTeamRoster(id);
  const gamesQ = useTeamGames(id);
  const statsQ = useTeamSeasonStats(id);
  const leadersQ = useTeamLeaders(id);

  if (teamQ.isLoading) {
    return (
      <div className="text-center py-24" style={{ color: 'rgba(242,237,230,0.4)' }} dir="rtl">
        טוען...
      </div>
    );
  }
  if (!teamQ.data) {
    return (
      <div className="text-center py-24 space-y-4" dir="rtl">
        <div style={{ color: 'rgba(242,237,230,0.4)' }}>הקבוצה לא נמצאה</div>
        <Link to="/standings" style={{ color: '#FF4D00' }}>← חזרה לטבלת הליגה</Link>
      </div>
    );
  }
  const team = teamQ.data;

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8" style={{ background: '#07080C' }}>
      <TeamHeader team={team} />
      {statsQ.data && <TeamQuickStats stats={statsQ.data} />}
      {leadersQ.data && <TeamLeaders leaders={leadersQ.data} />}
      <TeamRoster players={rosterQ.data ?? []} />
      <TeamSchedule games={gamesQ.data ?? []} teamId={team.id} />
      <TeamContact team={team} />
    </main>
  );
};

export default TeamPage;
```

- [ ] **Step 2: Add the route to `src/App.jsx`**

Open `src/App.jsx` and:

1. Near the existing `import PlayerPage from './pages/PlayerPage'` line, add:

```jsx
import TeamPage from './pages/TeamPage'
```

2. Inside the `<Routes>` element, alongside the existing `<Route path="/player/:id" element={<PlayerPage />} />`, add:

```jsx
<Route path="/team/:id" element={<TeamPage />} />
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Manual smoke check**

Run: `npm run dev`. In the browser, visit `http://localhost:5173/team/<some-team-uuid>` (grab a UUID from `/standings` after Task 14, or from the admin DB). Expected: page renders with header, stats, roster, schedule, contact.

- [ ] **Step 5: Commit**

```bash
git add src/pages/TeamPage.tsx src/App.jsx
git commit -m "feat(public): add /team/:id page"
```

---

### Task 13: Wrap match-page team logos in `Link`

**Files:**
- Modify: `src/components/match/MatchHeader.tsx`

- [ ] **Step 1: Update `TeamBlock` in `MatchHeader.tsx` to wrap logo + name in a `Link`**

In `src/components/match/MatchHeader.tsx`, replace the existing `TeamBlock` definition with:

```tsx
const TeamBlock: React.FC<{ team: GameWithTeams['home_team']; align: 'right' | 'left' }> = ({ team, align }) => {
  const inner = (
    <>
      <div
        className="w-20 h-20 rounded shrink-0 flex items-center justify-center overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {team?.logo
          ? <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
          : <span className="text-xs" style={{ color: 'rgba(242,237,230,0.4)' }}>—</span>}
      </div>
      <div
        className="text-base font-bold text-center truncate w-full"
        style={{ color: '#F2EDE6', textAlign: align }}
      >
        {team?.name ?? '—'}
      </div>
    </>
  );
  if (team?.id) {
    return (
      <Link to={`/team/${team.id}`} className="flex flex-col items-center gap-3 flex-1 min-w-0">
        {inner}
      </Link>
    );
  }
  return <div className="flex flex-col items-center gap-3 flex-1 min-w-0">{inner}</div>;
};
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/match/MatchHeader.tsx
git commit -m "feat(public): link match-header team logos to /team/:id"
```

---

### Task 14: Refactor `Standings.tsx` to use real DB teams + clickable rows

**Files:**
- Modify: `src/components/ui/Standings.tsx`

- [ ] **Step 1: Replace the entire `src/components/ui/Standings.tsx` content with**

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTeams, useTeamGames } from '../../lib/queries';
import { computeTeamSeasonStats } from '../../lib/aggregations';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { GameWithTeams } from '../../lib/queries';

const COLS = '2.5rem 1fr 3.5rem 3.5rem 3.5rem 4rem 4rem 4.5rem 3.5rem';

const SELECT_GAME =
  '*, home_team:teams!games_home_team_id_fkey(id, name, logo, home_color, away_color),' +
  ' away_team:teams!games_away_team_id_fkey(id, name, logo, home_color, away_color)';

const useAllSeasonGames = () =>
  useQuery({
    queryKey: ['games', 'season-all'],
    queryFn: async (): Promise<GameWithTeams[]> => {
      const { data: activeSeason } = await supabase
        .from('seasons').select('id').eq('status', 'active').maybeSingle();
      const seasonId = (activeSeason as { id: string } | null)?.id ?? null;
      if (!seasonId) return [];
      const { data, error } = await supabase
        .from('games').select(SELECT_GAME).eq('season_id', seasonId);
      if (error) throw error;
      return (data ?? []) as unknown as GameWithTeams[];
    },
    staleTime: 1000 * 60 * 5,
  });

const Standings: React.FC = () => {
  const teamsQ = useTeams();
  const gamesQ = useAllSeasonGames();

  const teams = teamsQ.data ?? [];
  const games = gamesQ.data ?? [];
  const allTeamIds = teams.map((t) => t.id);

  const rows = teams
    .map((t) => {
      const teamGames = games.filter((g) => g.home_team_id === t.id || g.away_team_id === t.id);
      const stats = computeTeamSeasonStats(t.id, teamGames, allTeamIds, games);
      return { team: t, ...stats };
    })
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return (b.points_for - b.points_against) - (a.points_for - a.points_against);
    });

  return (
    <section id="standings" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-end mb-6">
        <span
          className="text-xs font-medium px-3 py-1"
          style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00', border: '1px solid rgba(255,77,0,0.3)' }}
        >
          טבלת הליגה
        </span>
      </div>

      {teamsQ.isLoading || gamesQ.isLoading ? (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>טוען...</div>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="min-w-[680px] overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
            <div
              className="grid items-center px-4 py-3 text-sm font-black text-white"
              style={{ gridTemplateColumns: COLS, background: '#FF4D00', gap: '0.5rem' }}
            >
              <span className="text-center">#</span>
              <span>קבוצה</span>
              <span className="text-center">מש׳</span>
              <span className="text-center">ניצ׳</span>
              <span className="text-center">הפ׳</span>
              <span className="text-center">קלעה</span>
              <span className="text-center">ספגה</span>
              <span className="text-center">הפרש</span>
              <span className="text-center">נק׳</span>
            </div>

            {rows.map((r, i) => {
              const isTop = i === 0;
              const isPlayoff = i < 4;
              const diff = r.points_for - r.points_against;
              const pts = r.wins * 2 + r.losses;
              const evenBg = 'rgba(255,255,255,0.04)';
              const oddBg = 'rgba(255,255,255,0.01)';
              return (
                <Link key={r.team.id} to={`/team/${r.team.id}`}>
                  <motion.div
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.04, ease: [0.25, 1, 0.5, 1] }}
                    className="grid items-center px-4 py-3 cursor-pointer"
                    style={{
                      gridTemplateColumns: COLS,
                      gap: '0.5rem',
                      background: i % 2 === 0 ? evenBg : oddBg,
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      borderRight: isTop ? '3px solid #FF4D00' : '3px solid transparent',
                    }}
                    whileHover={{ background: 'rgba(255,77,0,0.07)' }}
                  >
                    <span
                      className="text-center text-sm font-black tabular-nums"
                      style={{ color: isTop ? '#FF4D00' : isPlayoff ? '#FFB300' : 'rgba(242,237,230,0.35)' }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex items-center gap-2.5 min-w-0">
                      {r.team.logo && (
                        <img
                          src={r.team.logo}
                          alt={r.team.name}
                          style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }}
                        />
                      )}
                      <span
                        className="text-sm font-semibold truncate"
                        style={{ color: isTop ? '#F2EDE6' : 'rgba(242,237,230,0.85)' }}
                      >
                        {r.team.name}
                      </span>
                    </div>
                    <span className="text-center text-sm tabular-nums" style={{ color: 'rgba(242,237,230,0.55)' }}>
                      {r.wins + r.losses}
                    </span>
                    <span className="text-center text-sm font-bold tabular-nums" style={{ color: '#F2EDE6' }}>
                      {r.wins}
                    </span>
                    <span className="text-center text-sm tabular-nums" style={{ color: 'rgba(242,237,230,0.55)' }}>
                      {r.losses}
                    </span>
                    <span className="text-center text-sm tabular-nums" style={{ color: 'rgba(242,237,230,0.65)' }}>
                      {r.points_for}
                    </span>
                    <span className="text-center text-sm tabular-nums" style={{ color: 'rgba(242,237,230,0.65)' }}>
                      {r.points_against}
                    </span>
                    <span
                      className="text-center text-sm font-semibold tabular-nums"
                      style={{ color: diff > 0 ? '#4ade80' : diff < 0 ? '#f87171' : 'rgba(242,237,230,0.55)' }}
                    >
                      {diff > 0 ? '+' : ''}{diff}
                    </span>
                    <span
                      className="text-center text-sm font-black tabular-nums"
                      style={{ color: isTop ? '#FF4D00' : '#F2EDE6' }}
                    >
                      {pts}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default Standings;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Manual smoke check**

Run: `npm run dev`. Visit `/standings`. Expected: real teams from DB, sorted by record. Click a row → navigates to `/team/:id`.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Standings.tsx
git commit -m "feat(public): refactor Standings to use DB teams + link to /team/:id"
```

---

### Task 15: Refactor `Header.tsx` to use DB team logos + link

**Files:**
- Modify: `src/components/ui/Header.tsx`

- [ ] **Step 1: Replace the `TeamLogos` component and the hardcoded `TEAM_LOGOS` array**

In `src/components/ui/Header.tsx`:

1. Remove the entire `TEAM_LOGOS` array constant (lines ~14-25 before this change).
2. Replace the `TeamLogos` component definition with:

```tsx
import { useTeams } from '../../lib/queries';
// ...keep the existing imports (NavLink, motion, AnimatePresence, useState, React)
import { Link } from 'react-router-dom';

const TeamLogos: React.FC = () => {
  const { data: teams = [] } = useTeams();
  return (
    <div className="flex-1 flex items-center justify-center gap-3" style={{ minWidth: 0 }}>
      {teams.map((team) => (
        <Link
          key={team.id}
          to={`/team/${team.id}`}
          aria-label={team.name}
          className="flex-shrink-0"
        >
          {team.logo ? (
            <img
              src={team.logo}
              alt={team.name}
              style={{ height: 70, width: 70, objectFit: 'contain' }}
            />
          ) : (
            <div
              style={{
                height: 70, width: 70, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.06)', color: '#F2EDE6', fontWeight: 900, fontSize: 12, borderRadius: 8,
              }}
            >
              {team.name.split(' ')[0]?.slice(0, 3) ?? '—'}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};
```

(Place the `Link` import beside the existing `NavLink` import, and the `useTeams` import beside the other relative imports.)

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Manual smoke check**

Run: `npm run dev`. Header shows real team logos pulled from DB. Clicking a logo navigates to `/team/:id`.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Header.tsx
git commit -m "feat(public): refactor Header logos to use DB teams + link"
```

---

### Task 16: Wrap `Results.tsx` game-card team logos in `Link`

**Files:**
- Modify: `src/components/ui/Results.tsx`

- [ ] **Step 1: Add `homeId` and `awayId` to the `GameRow` adapter**

In `src/components/ui/Results.tsx`, find the `adapt` function and the `GameRow` type. Add `homeId: string | undefined` and `awayId: string | undefined` to the type, and populate them in `adapt`:

```ts
const adapt = (g: GameWithTeams): GameRow => ({
  id: g.id,
  date: fmtDate(g.date),
  time: (g.time || '').slice(0, 5),
  round: g.round || '',
  venue: g.hall || '',
  statsUrl: '/match/' + g.id,
  watchUrl: g.watch_url || '',
  home: g.home_team?.name || '',
  homeId: g.home_team?.id,
  homeLogo: g.home_team?.logo || '',
  homeScore: g.home_score,
  away: g.away_team?.name || '',
  awayId: g.away_team?.id,
  awayLogo: g.away_team?.logo || '',
  awayScore: g.away_score,
});
```

(Find the `GameRow` interface in the same file and add `homeId?: string; awayId?: string;` to it.)

- [ ] **Step 2: Wrap home/away logos in `Link` in both the Results table and Schedule table**

Find every place in the file that renders the home or away logo (`<img src={g.homeLogo} ...>` and `<img src={g.awayLogo} ...>`) and wrap each with a `Link` when the id is present:

Replace:
```tsx
<img src={g.homeLogo} alt={g.home} style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
```

With:
```tsx
{g.homeId ? (
  <Link to={`/team/${g.homeId}`} onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
    <img src={g.homeLogo} alt={g.home} style={{ width: 26, height: 26, objectFit: 'contain' }} />
  </Link>
) : (
  <img src={g.homeLogo} alt={g.home} style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
)}
```

Do the same for the away logo (`g.awayId`, `g.awayLogo`, `g.away`). The `Link` import already exists in this file.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Manual smoke check**

Run: `npm run dev`. Visit `/results`. Click a team logo on any game card → navigates to `/team/:id`. Clicking elsewhere on the row still uses the existing behavior.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Results.tsx
git commit -m "feat(public): link Results page team logos to /team/:id"
```

---

### Task 17: Final end-to-end smoke check + push

**Files:** none

- [ ] **Step 1: Run build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 2: Run dev server and walk through all entry points**

Run: `npm run dev`. Visit each path and verify navigation:

- `/` → Header logo row: clicking a logo navigates to `/team/:id`
- `/standings` → clicking any row navigates to `/team/:id`
- `/results` → clicking home/away logo on a game card navigates to `/team/:id` (without triggering match navigation); clicking elsewhere preserves existing behavior
- `/match/<played-game-uuid>` → clicking either team in the match header navigates to `/team/:id`
- `/team/<team-uuid>` → header, quick stats, leaders, roster, schedule, and contact all render. Player cards in roster and leaders link to `/player/:id`. Schedule rows link to `/match/:id`.

- [ ] **Step 3: Push**

```bash
git push
```

Expected: GitHub Pages workflow runs, deploys to `wbpl.co.il` within ~2 minutes.

- [ ] **Step 4: Verify on production**

Open `https://wbpl.co.il/` in a browser, click a team logo, verify the team page loads with real data.
