# Public Stats Leaders Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current `/stats` page (mock-data, 3-tab bar chart) with a 15-category league-leaders board showing top 5 players per category, with a regular-season / full-season toggle.

**Architecture:** Add `useLeagueLeaders` hook in `lib/queries.ts` and pure aggregation `computeLeagueLeaders` in `lib/aggregations.ts`. Create two presentational components (`LeaderCard`, `LeadersGrid`). Replace `Stats.tsx` contents with new sub-tabs + grid wired to the hook.

**Tech Stack:** React 19, TypeScript, Vite, TanStack Query v5, Supabase JS SDK, React Router v7, Tailwind v4.

---

## File Structure

All paths under `C:\Users\Dana\projects\my-motion-app\`.

```
src/lib/queries.ts                       # MODIFY — add types + useLeagueLeaders hook
src/lib/aggregations.ts                  # MODIFY — add computeLeagueLeaders
src/components/stats/
  LeaderCard.tsx                         # NEW — single-category card
  LeadersGrid.tsx                        # NEW — 3 grouped rows of cards
src/components/ui/Stats.tsx              # MODIFY — replace contents
```

**Verification approach:** No test framework in this project. Each task verifies via `npm run build` (must succeed). Final task includes a manual browser smoke check.

---

### Task 1: Add types + `computeLeagueLeaders` helper to `lib/aggregations.ts`

**Files:**
- Modify: `src/lib/aggregations.ts`

- [ ] **Step 1: Add types and aggregation function**

Append to the end of `src/lib/aggregations.ts`:

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
  value: number;
  games: number;
}

export type LeagueLeaders = Record<LeaderCategoryKey, LeagueLeaderRow[]>;

/** Stats-row shape consumed by computeLeagueLeaders — kept lean to keep the helper pure. */
export interface LeaderInputRow {
  player_id: string;
  team_id: string;
  game_id: string;
  minutes: number | null;
  points: number | null;
  rebounds: number | null;
  assists: number | null;
  steals: number | null;
  blocks: number | null;
  turnovers: number | null;
  efficiency: number | null;
  fg2_made: number | null;
  fg2_attempted: number | null;
  fg3_made: number | null;
  fg3_attempted: number | null;
  ft_made: number | null;
  ft_attempted: number | null;
  player: { id: string; first_name: string; last_name: string; photo: string | null } | null;
  team: { id: string; name: string; logo: string | null } | null;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const num = (n: number | null | undefined) => Number(n ?? 0);

interface PlayerAgg {
  player_id: string;
  first_name: string;
  last_name: string;
  photo: string | null;
  team_id: string | null;
  team_name: string | null;
  team_logo: string | null;
  games: number;
  sums: {
    minutes: number; points: number; rebounds: number; assists: number;
    steals: number; blocks: number; turnovers: number; efficiency: number;
    fg2m: number; fg2a: number; fg3m: number; fg3a: number; ftm: number; fta: number;
  };
}

const empty = (): LeagueLeaders => ({
  ppg: [], rpg: [], apg: [], eff: [], mpg: [],
  spg: [], topg: [], ato: [], bpg: [], ft_pct: [],
  fg2_pct: [], fg3_pct: [], ft_made_pg: [], fg2_made_pg: [], fg3_made_pg: [],
});

const PCT_KEYS: LeaderCategoryKey[] = ['ft_pct', 'fg2_pct', 'fg3_pct'];
const ASCENDING_KEYS: LeaderCategoryKey[] = ['topg']; // fewer turnovers = better

const PCT_MIN_ATTEMPTS: Record<'ft_pct' | 'fg2_pct' | 'fg3_pct', number> = {
  ft_pct: 10,
  fg2_pct: 10,
  fg3_pct: 10,
};

/**
 * Pure aggregation: given per-game stat rows (already filtered to the desired games), compute
 * top-5 leaders for each category.
 */
export const computeLeagueLeaders = (rows: LeaderInputRow[]): LeagueLeaders => {
  const byPlayer = new Map<string, PlayerAgg>();

  for (const r of rows) {
    if (!r.player) continue;
    const cur = byPlayer.get(r.player_id) ?? {
      player_id: r.player_id,
      first_name: r.player.first_name,
      last_name: r.player.last_name,
      photo: r.player.photo,
      team_id: r.team?.id ?? r.team_id,
      team_name: r.team?.name ?? null,
      team_logo: r.team?.logo ?? null,
      games: 0,
      sums: { minutes: 0, points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, efficiency: 0, fg2m: 0, fg2a: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0 },
    };
    cur.games += 1;
    cur.sums.minutes    += num(r.minutes);
    cur.sums.points     += num(r.points);
    cur.sums.rebounds   += num(r.rebounds);
    cur.sums.assists    += num(r.assists);
    cur.sums.steals     += num(r.steals);
    cur.sums.blocks     += num(r.blocks);
    cur.sums.turnovers  += num(r.turnovers);
    cur.sums.efficiency += num(r.efficiency);
    cur.sums.fg2m       += num(r.fg2_made);
    cur.sums.fg2a       += num(r.fg2_attempted);
    cur.sums.fg3m       += num(r.fg3_made);
    cur.sums.fg3a       += num(r.fg3_attempted);
    cur.sums.ftm        += num(r.ft_made);
    cur.sums.fta        += num(r.ft_attempted);
    // Refresh identity in case latest row has more recent team
    if (r.team) {
      cur.team_id = r.team.id;
      cur.team_name = r.team.name;
      cur.team_logo = r.team.logo;
    }
    byPlayer.set(r.player_id, cur);
  }

  const valueFor = (a: PlayerAgg, key: LeaderCategoryKey): number => {
    const g = a.games || 1;
    switch (key) {
      case 'ppg':         return a.sums.points / g;
      case 'rpg':         return a.sums.rebounds / g;
      case 'apg':         return a.sums.assists / g;
      case 'eff':         return a.sums.efficiency / g;
      case 'mpg':         return a.sums.minutes / g;
      case 'spg':         return a.sums.steals / g;
      case 'topg':        return a.sums.turnovers / g;
      case 'bpg':         return a.sums.blocks / g;
      case 'ato':         return a.sums.turnovers > 0 ? a.sums.assists / a.sums.turnovers : a.sums.assists;
      case 'ft_pct':      return a.sums.fta > 0 ? (a.sums.ftm / a.sums.fta) * 100 : 0;
      case 'fg2_pct':     return a.sums.fg2a > 0 ? (a.sums.fg2m / a.sums.fg2a) * 100 : 0;
      case 'fg3_pct':     return a.sums.fg3a > 0 ? (a.sums.fg3m / a.sums.fg3a) * 100 : 0;
      case 'ft_made_pg':  return a.sums.ftm / g;
      case 'fg2_made_pg': return a.sums.fg2m / g;
      case 'fg3_made_pg': return a.sums.fg3m / g;
    }
  };

  const eligible = (a: PlayerAgg, key: LeaderCategoryKey): boolean => {
    if (a.games < 1) return false;
    if (key === 'ft_pct')  return a.sums.fta >= PCT_MIN_ATTEMPTS.ft_pct;
    if (key === 'fg2_pct') return a.sums.fg2a >= PCT_MIN_ATTEMPTS.fg2_pct;
    if (key === 'fg3_pct') return a.sums.fg3a >= PCT_MIN_ATTEMPTS.fg3_pct;
    return true;
  };

  const out = empty();
  const allKeys: LeaderCategoryKey[] = [
    'ppg','rpg','apg','eff','mpg',
    'spg','topg','ato','bpg','ft_pct',
    'fg2_pct','fg3_pct','ft_made_pg','fg2_made_pg','fg3_made_pg',
  ];
  for (const key of allKeys) {
    const candidates = Array.from(byPlayer.values())
      .filter((a) => eligible(a, key))
      .map((a) => ({ a, v: valueFor(a, key) }));
    candidates.sort((x, y) => ASCENDING_KEYS.includes(key) ? x.v - y.v : y.v - x.v);
    out[key] = candidates.slice(0, 5).map(({ a, v }) => ({
      player_id: a.player_id,
      first_name: a.first_name,
      last_name: a.last_name,
      photo: a.photo,
      team_id: a.team_id,
      team_name: a.team_name,
      team_logo: a.team_logo,
      value: PCT_KEYS.includes(key) ? round1(v) : round1(v),
      games: a.games,
    }));
  }
  return out;
};
```

- [ ] **Step 2: Verify build**

Run: `cd C:\Users\Dana\projects\my-motion-app && npm run build`
Expected: build succeeds with no TS errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/aggregations.ts
git commit -m "feat(public): add league leaders aggregation helper

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Add `useLeagueLeaders` hook to `lib/queries.ts`

**Files:**
- Modify: `src/lib/queries.ts`

- [ ] **Step 1: Add import + hook**

At the top of `src/lib/queries.ts`, extend the existing aggregations import to also pull the new types and helper:

```ts
import { computeTeamSeasonStats, computeLeagueLeaders, type TeamSeasonStats, type LeagueLeaders, type LeaderInputRow } from './aggregations';
```

(Replace the current `import { computeTeamSeasonStats, type TeamSeasonStats } from './aggregations';` line.)

Also re-export the leaders types so consumers don't need to import from two files:

```ts
export type { LeagueLeaders, LeaderInputRow } from './aggregations';
export type { LeaderCategoryKey, LeagueLeaderRow } from './aggregations';
```

(Place these `export type` statements immediately after the import, near the top of the file, before the existing `// ── Types ────` divider.)

Append the hook to the end of `src/lib/queries.ts`:

```ts
export type SeasonStage = 'regular' | 'all';

export const useLeagueLeaders = (stage: SeasonStage) =>
  useQuery({
    queryKey: ['league_leaders', stage],
    queryFn: async (): Promise<LeagueLeaders> => {
      const { data: activeSeason } = await supabase
        .from('seasons').select('id').eq('status', 'active').maybeSingle();
      const seasonId = (activeSeason as { id: string } | null)?.id ?? null;
      if (!seasonId) {
        return computeLeagueLeaders([]);
      }

      const { data: gamesData, error: gamesErr } = await supabase
        .from('games')
        .select('id, round, status')
        .eq('season_id', seasonId)
        .eq('status', 'played');
      if (gamesErr) throw gamesErr;

      const games = (gamesData ?? []) as Array<{ id: string; round: string | null; status: string }>;
      const filtered = stage === 'regular'
        ? games.filter((g) => !(g.round ?? '').includes('פלייאוף'))
        : games;
      const ids = filtered.map((g) => g.id);
      if (ids.length === 0) {
        return computeLeagueLeaders([]);
      }

      const { data, error } = await supabase
        .from('player_game_stats')
        .select(
          'player_id, team_id, game_id, minutes, points, rebounds, assists, steals, blocks, turnovers, efficiency, fg2_made, fg2_attempted, fg3_made, fg3_attempted, ft_made, ft_attempted,' +
          ' player:players(id, first_name, last_name, photo),' +
          ' team:teams(id, name, logo)'
        )
        .in('game_id', ids);
      if (error) throw error;

      const rows = (data ?? []) as unknown as LeaderInputRow[];
      return computeLeagueLeaders(rows);
    },
    staleTime: 1000 * 60 * 5,
  });
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat(public): add useLeagueLeaders hook

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Create `LeaderCard` component

**Files:**
- Create: `src/components/stats/LeaderCard.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { LeagueLeaderRow } from '../../lib/queries';

interface Props {
  label: string;
  rows: LeagueLeaderRow[];
  /** Format the numeric value for display. Defaults to one decimal. */
  formatValue?: (n: number) => string;
}

const defaultFormat = (n: number) => n.toFixed(1);

const LeaderCard: React.FC<Props> = ({ label, rows, formatValue = defaultFormat }) => (
  <div
    className="rounded-xl overflow-hidden flex flex-col"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    dir="rtl"
  >
    <div
      className="px-3 py-2 text-sm font-black text-center"
      style={{ background: '#FF4D00', color: '#fff' }}
    >
      {label}
    </div>
    {rows.length === 0 ? (
      <div className="px-3 py-6 text-center text-xs" style={{ color: 'rgba(242,237,230,0.4)' }}>
        אין נתונים מספיקים
      </div>
    ) : (
      <ul className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {rows.map((r, i) => (
          <li
            key={r.player_id}
            className="flex items-center gap-2 px-3 py-2 text-sm"
            style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined }}
          >
            <Link
              to={`/player/${r.player_id}`}
              className="flex-1 truncate"
              style={{ color: i === 0 ? '#FF4D00' : 'rgba(242,237,230,0.85)', fontWeight: i === 0 ? 700 : 500 }}
            >
              {r.first_name} {r.last_name}
            </Link>
            <span
              className="tabular-nums shrink-0"
              style={{ color: i === 0 ? '#FF4D00' : '#F2EDE6', fontWeight: 800 }}
            >
              {formatValue(r.value)}
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default LeaderCard;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/stats/LeaderCard.tsx
git commit -m "feat(public): add LeaderCard component

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Create `LeadersGrid` component

**Files:**
- Create: `src/components/stats/LeadersGrid.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';
import LeaderCard from './LeaderCard';
import type { LeagueLeaders, LeaderCategoryKey } from '../../lib/queries';

interface Props { leaders: LeagueLeaders }

interface CardDef {
  key: LeaderCategoryKey;
  label: string;
  format?: (n: number) => string;
}

const ROW_PRIMARY: CardDef[] = [
  { key: 'ppg',         label: 'נקודות' },
  { key: 'rpg',         label: 'ריבאונדים' },
  { key: 'apg',         label: 'אסיסטים' },
  { key: 'eff',         label: 'יעילות' },
  { key: 'mpg',         label: 'דקות משחק' },
];

const ROW_DEFENSE: CardDef[] = [
  { key: 'spg',         label: 'חטיפות' },
  { key: 'topg',        label: 'איבודים' },
  { key: 'ato',         label: 'יחס אסי\'/איב\'' },
  { key: 'bpg',         label: 'חסימות' },
  { key: 'ft_pct',      label: '% מהעונשין', format: (n) => `${n.toFixed(1)}%` },
];

const ROW_SHOOTING: CardDef[] = [
  { key: 'fg2_pct',     label: '% מ-2', format: (n) => `${n.toFixed(1)}%` },
  { key: 'fg3_pct',     label: '% מ-3', format: (n) => `${n.toFixed(1)}%` },
  { key: 'ft_made_pg',  label: 'זריקות עונשין' },
  { key: 'fg2_made_pg', label: 'זריקות מ-2' },
  { key: 'fg3_made_pg', label: 'זריקות מ-3' },
];

const Row: React.FC<{ title: string; defs: CardDef[]; leaders: LeagueLeaders }> = ({ title, defs, leaders }) => (
  <div className="space-y-3" dir="rtl">
    <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: 'rgba(242,237,230,0.5)' }}>{title}</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {defs.map((d) => (
        <LeaderCard key={d.key} label={d.label} rows={leaders[d.key]} formatValue={d.format} />
      ))}
    </div>
  </div>
);

const LeadersGrid: React.FC<Props> = ({ leaders }) => (
  <div className="space-y-8">
    <Row title="ראשי" defs={ROW_PRIMARY} leaders={leaders} />
    <Row title="הגנה ושליטה" defs={ROW_DEFENSE} leaders={leaders} />
    <Row title="קליעות" defs={ROW_SHOOTING} leaders={leaders} />
  </div>
);

export default LeadersGrid;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/stats/LeadersGrid.tsx
git commit -m "feat(public): add LeadersGrid component

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Replace `Stats.tsx` with new sub-tabs + leaders grid

**Files:**
- Modify: `src/components/ui/Stats.tsx`

- [ ] **Step 1: Replace the entire file contents**

Replace the contents of `src/components/ui/Stats.tsx` with:

```tsx
import React, { useState } from 'react';
import SectionTabs, { Tab } from './SectionTabs';
import LeadersGrid from '../stats/LeadersGrid';
import { useLeagueLeaders, type SeasonStage } from '../../lib/queries';

const STAGE_TABS: Tab[] = [
  { id: 'regular', label: 'עונה סדירה' },
  { id: 'all',     label: 'כל העונה' },
];

const Stats: React.FC = () => {
  const [stage, setStage] = useState<SeasonStage>('regular');
  const { data, isLoading, error } = useLeagueLeaders(stage);

  return (
    <section id="stats" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-center mb-10">
        <SectionTabs
          tabs={STAGE_TABS}
          active={stage}
          onChange={(id) => setStage(id as SeasonStage)}
        />
      </div>

      {isLoading && (
        <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>טוען...</div>
      )}
      {error && (
        <div className="text-center py-12" style={{ color: '#f87171' }}>לא ניתן לטעון סטטיסטיקות כעת.</div>
      )}
      {data && <LeadersGrid leaders={data} />}
    </section>
  );
};

export default Stats;
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Manual smoke check**

Run: `npm run dev`. Visit `/stats`. Verify:
- Two sub-tabs at top: עונה סדירה (default), כל העונה
- 3 grouped rows of 5 cards each
- Each card has orange title bar and 5 player rows (or "אין נתונים מספיקים")
- Top player highlighted in orange
- Player names link to `/player/:id`
- Switching tab refetches and updates results

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Stats.tsx
git commit -m "feat(public): redesign /stats as 15-category leaders board

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 6: Push and verify production

**Files:** none

- [ ] **Step 1: Push**

```bash
git push
```

- [ ] **Step 2: Verify on production**

Wait ~2 minutes for GitHub Pages workflow. Then open `https://wbpl.co.il/stats` and confirm the new layout renders with real data.
