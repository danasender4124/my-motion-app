# Public Player Profile Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public-facing `/player/:id` page on `my-motion-app` that displays each player's profile and current-season stats. Make player names in box-score tables link to it.

**Architecture:** Extend existing `lib/queries.ts` with two new hooks (`usePlayer`, `usePlayerStats`). Create three small components and one page. Reuse the existing public theme (dark + orange) and Supabase/RLS infra already in place.

**Tech Stack:** React 19, TypeScript, Vite, TanStack Query v5, Supabase JS SDK, Tailwind CSS v4.

---

## File Structure

All paths under `C:\Users\Dana\projects\my-motion-app\`.

```
src/lib/queries.ts                          # MODIFY — add hooks + calcAverages helper
src/components/player/
  PlayerHeader.tsx                          # NEW
  SeasonAveragesCard.tsx                    # NEW
  PlayerGameLog.tsx                         # NEW
src/pages/PlayerPage.tsx                    # NEW
src/components/match/BoxScoreTable.tsx      # MODIFY — wrap player name in <Link>
src/App.jsx                                 # MODIFY — add /player/:id route
```

---

### Task 1: Extend `lib/queries.ts` with player hooks + averages helper

**Files:**
- Modify: `src/lib/queries.ts`

- [ ] **Step 1: Add types and `calcAverages` helper near the top of the file**

In `src/lib/queries.ts`, after the existing `PlayerGameStat` interface, add:

```ts
export interface PlayerProfile {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  nationality: string | null;
  country_of_origin: string | null;
  height: number | null;
  position: 'point_guard' | 'shooting_guard' | 'small_forward' | 'power_forward' | 'center' | null;
  status: string;
  classification: 'israeli' | 'naturalized' | 'foreign' | 'bosman';
  photo: string | null;
  current_team: { id: string; name: string; logo: string | null } | null;
  current_jersey: number | null;
}

export interface PlayerStatRow extends PlayerGameStat {
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
const sumKey = (rows: PlayerGameStat[], key: keyof PlayerGameStat): number =>
  rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);

export const calcAverages = (rows: PlayerGameStat[]): SeasonAverages => {
  const games = rows.length;
  if (games === 0) return { games: 0, ppg: 0, rpg: 0, apg: 0, spg: 0, bpg: 0, mpg: 0, eff_avg: 0 };
  return {
    games,
    ppg: round1(sumKey(rows, 'points') / games),
    rpg: round1(sumKey(rows, 'rebounds') / games),
    apg: round1(sumKey(rows, 'assists') / games),
    spg: round1(sumKey(rows, 'steals') / games),
    bpg: round1(sumKey(rows, 'blocks') / games),
    mpg: round1(sumKey(rows, 'minutes') / games),
    eff_avg: round1(sumKey(rows, 'efficiency') / games),
  };
};
```

- [ ] **Step 2: Add `usePlayer` and `usePlayerStats` hooks at the end of the file**

Add at the bottom of `src/lib/queries.ts`:

```ts
export const usePlayer = (id: string | undefined) =>
  useQuery({
    queryKey: ['player', id],
    enabled: !!id,
    queryFn: async (): Promise<PlayerProfile | null> => {
      const { data: player, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      if (!player) return null;

      // Fetch the current-season team + jersey
      const { data: activeSeason } = await supabase
        .from('seasons').select('id').eq('status', 'active').maybeSingle();
      const seasonId = (activeSeason as { id: string } | null)?.id ?? null;
      let current_team: PlayerProfile['current_team'] = null;
      let current_jersey: number | null = null;
      if (seasonId) {
        const { data: pts } = await supabase
          .from('player_team_seasons')
          .select('jersey_number, team:teams(id, name, logo)')
          .eq('player_id', id!)
          .eq('season_id', seasonId)
          .maybeSingle();
        if (pts) {
          const row = pts as { jersey_number: number | null; team: { id: string; name: string; logo: string | null } | null };
          current_team = row.team;
          current_jersey = row.jersey_number;
        }
      }

      return { ...(player as Omit<PlayerProfile, 'current_team' | 'current_jersey'>), current_team, current_jersey };
    },
  });

export const usePlayerStats = (id: string | undefined) =>
  useQuery({
    queryKey: ['player_stats', id],
    enabled: !!id,
    queryFn: async (): Promise<PlayerStatRow[]> => {
      const { data: activeSeason } = await supabase
        .from('seasons').select('id').eq('status', 'active').maybeSingle();
      const seasonId = (activeSeason as { id: string } | null)?.id ?? null;
      if (!seasonId) return [];

      const { data: gameIds } = await supabase
        .from('games').select('id').eq('season_id', seasonId);
      const ids = (gameIds ?? []).map((r: { id: string }) => r.id);
      if (ids.length === 0) return [];

      const { data, error } = await supabase
        .from('player_game_stats')
        .select(
          '*, game:games(id, date, home_team_id, away_team_id, home_score, away_score,' +
            ' home_team:teams!games_home_team_id_fkey(id, name),' +
            ' away_team:teams!games_away_team_id_fkey(id, name))'
        )
        .eq('player_id', id!)
        .in('game_id', ids);
      if (error) throw error;
      const rows = (data ?? []) as unknown as PlayerStatRow[];
      rows.sort((a, b) => (b.game?.date ?? '').localeCompare(a.game?.date ?? ''));
      return rows;
    },
  });
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd C:\Users\Dana\projects\my-motion-app
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat(public): add usePlayer/usePlayerStats hooks and calcAverages helper"
```

---

### Task 2: PlayerHeader component

**Files:**
- Create: `src/components/player/PlayerHeader.tsx`

- [ ] **Step 1: Implement**

Create `src/components/player/PlayerHeader.tsx`:

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { PlayerProfile } from '../../lib/queries';

const POSITION_LABELS: Record<NonNullable<PlayerProfile['position']>, string> = {
  point_guard: 'PG',
  shooting_guard: 'G',
  small_forward: 'F',
  power_forward: 'PF',
  center: 'C',
};

const CLASSIFICATION_LABELS: Record<PlayerProfile['classification'], string> = {
  israeli: 'ישראלית',
  naturalized: 'מתאזרחת',
  foreign: 'זרה',
  bosman: 'בוסמנית',
};

const calcAge = (birth: string | null): number | null => {
  if (!birth) return null;
  const today = new Date();
  const bd = new Date(birth);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return Number.isFinite(age) ? age : null;
};

const initials = (first: string, last: string) => (first[0] ?? '') + (last[0] ?? '');

interface Props { player: PlayerProfile }

const PlayerHeader: React.FC<Props> = ({ player }) => {
  const age = calcAge(player.birth_date);
  const teamPart = player.current_team
    ? `${player.current_jersey != null ? '#' + player.current_jersey + ' · ' : ''}${player.current_team.name}`
    : null;
  const positionLabel = player.position ? POSITION_LABELS[player.position] : null;
  const metaTop = [teamPart, positionLabel].filter(Boolean).join(' · ');
  const metaBottom = [
    age != null ? `גיל ${age}` : null,
    player.nationality,
    CLASSIFICATION_LABELS[player.classification],
  ].filter(Boolean).join(' · ');

  return (
    <div dir="rtl" className="space-y-4">
      <Link to="/results" className="text-sm flex items-center gap-1" style={{ color: 'rgba(242,237,230,0.5)' }}>
        ← חזרה
      </Link>
      <div
        className="rounded-2xl p-8 flex items-center gap-6"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div
          className="w-24 h-24 rounded-full shrink-0 overflow-hidden flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          {player.photo
            ? <img src={player.photo} alt={`${player.first_name} ${player.last_name}`} className="w-full h-full object-cover" />
            : <span className="text-3xl font-black" style={{ color: 'rgba(242,237,230,0.5)' }}>{initials(player.first_name, player.last_name)}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-black leading-tight" style={{ color: '#F2EDE6' }}>
            {player.first_name} {player.last_name}
          </h1>
          {metaTop && <div className="mt-2 text-sm" style={{ color: 'rgba(242,237,230,0.7)' }}>{metaTop}</div>}
          {metaBottom && <div className="text-sm" style={{ color: 'rgba(242,237,230,0.5)' }}>{metaBottom}</div>}
        </div>
      </div>
    </div>
  );
};

export default PlayerHeader;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/player/PlayerHeader.tsx
git commit -m "feat(public): add PlayerHeader component"
```

---

### Task 3: SeasonAveragesCard component

**Files:**
- Create: `src/components/player/SeasonAveragesCard.tsx`

- [ ] **Step 1: Implement**

Create `src/components/player/SeasonAveragesCard.tsx`:

```tsx
import React from 'react';
import type { SeasonAverages } from '../../lib/queries';

const Stat: React.FC<{ value: number | string; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center px-4">
    <span className="text-3xl font-black tabular-nums" style={{ color: '#F2EDE6' }}>{value}</span>
    <span className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(242,237,230,0.45)' }}>{label}</span>
  </div>
);

interface Props { averages: SeasonAverages }

const SeasonAveragesCard: React.FC<Props> = ({ averages }) => (
  <div
    className="rounded-2xl p-6"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    dir="rtl"
  >
    <div className="flex items-center justify-around flex-wrap gap-4">
      <Stat value={averages.ppg} label="נק׳" />
      <Stat value={averages.rpg} label="רבד" />
      <Stat value={averages.apg} label="אסי" />
      <Stat value={averages.spg} label="חט" />
      <Stat value={averages.eff_avg} label="מדד" />
    </div>
    <div
      className="mt-3 pt-3 text-center text-sm"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(242,237,230,0.5)' }}
    >
      משחקים: {averages.games} · דקות ממוצע: {averages.mpg}
    </div>
  </div>
);

export default SeasonAveragesCard;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/player/SeasonAveragesCard.tsx
git commit -m "feat(public): add SeasonAveragesCard component"
```

---

### Task 4: PlayerGameLog component

**Files:**
- Create: `src/components/player/PlayerGameLog.tsx`

- [ ] **Step 1: Implement**

Create `src/components/player/PlayerGameLog.tsx`:

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { PlayerStatRow } from '../../lib/queries';

const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const COLS = '110px 1fr 110px 50px 50px 50px 50px 50px 50px';

interface Props {
  rows: PlayerStatRow[];
  playerTeamId?: string | null;
}

const PlayerGameLog: React.FC<Props> = ({ rows, playerTeamId }) => {
  if (rows.length === 0) {
    return (
      <div
        className="rounded-2xl py-12 text-center"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.10)', color: 'rgba(242,237,230,0.5)' }}
        dir="rtl"
      >
        אין סטטיסטיקה לעונה זו.
      </div>
    );
  }

  const Header: React.FC = () => (
    <div
      className="grid items-center px-4 py-3 text-xs font-black uppercase tracking-wider"
      style={{ gridTemplateColumns: COLS, background: 'rgba(255,255,255,0.05)', color: 'rgba(242,237,230,0.45)' }}
    >
      <span>תאריך</span>
      <span>יריבה</span>
      <span>תוצאה</span>
      <span className="text-center">דק׳</span>
      <span className="text-center">נק׳</span>
      <span className="text-center">רבד</span>
      <span className="text-center">אסי</span>
      <span className="text-center">מדד</span>
      <span className="text-center">משחק</span>
    </div>
  );

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      dir="rtl"
    >
      <Header />
      {rows.map((r, i) => {
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
        const resultColor = teamScore != null && oppScore != null
          ? (teamScore > oppScore ? '#4ade80' : '#f87171')
          : 'rgba(242,237,230,0.5)';
        return (
          <div
            key={r.game_id}
            className="grid items-center px-4 py-3 text-sm"
            style={{
              gridTemplateColumns: COLS,
              background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <span className="tabular-nums" style={{ color: 'rgba(242,237,230,0.7)' }}>{formatDate(game?.date ?? null)}</span>
            <span style={{ color: '#F2EDE6' }}>{opp?.name ?? '—'}</span>
            <span className="tabular-nums" style={{ color: resultColor }}>{result}</span>
            <span className="text-center tabular-nums" style={{ color: 'rgba(242,237,230,0.7)' }}>{r.minutes ?? '—'}</span>
            <span className="text-center tabular-nums font-bold" style={{ color: '#F2EDE6' }}>{r.points ?? '—'}</span>
            <span className="text-center tabular-nums" style={{ color: 'rgba(242,237,230,0.7)' }}>{r.rebounds ?? '—'}</span>
            <span className="text-center tabular-nums" style={{ color: 'rgba(242,237,230,0.7)' }}>{r.assists ?? '—'}</span>
            <span className="text-center tabular-nums" style={{ color: 'rgba(242,237,230,0.7)' }}>{r.efficiency ?? '—'}</span>
            <span className="text-center">
              <Link
                to={`/match/${r.game_id}`}
                className="inline-flex items-center justify-center w-7 h-7 rounded"
                style={{ color: '#FF4D00', background: 'rgba(255,77,0,0.12)' }}
                aria-label="צפה במשחק"
              >
                ↗
              </Link>
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default PlayerGameLog;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/player/PlayerGameLog.tsx
git commit -m "feat(public): add PlayerGameLog component"
```

---

### Task 5: PlayerPage orchestrator

**Files:**
- Create: `src/pages/PlayerPage.tsx`

- [ ] **Step 1: Implement**

Create `src/pages/PlayerPage.tsx`:

```tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePlayer, usePlayerStats, calcAverages } from '../lib/queries';
import PlayerHeader from '../components/player/PlayerHeader';
import SeasonAveragesCard from '../components/player/SeasonAveragesCard';
import PlayerGameLog from '../components/player/PlayerGameLog';

const PlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const playerQ = usePlayer(id);
  const statsQ = usePlayerStats(id);

  if (playerQ.isLoading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center" style={{ background: '#07080C' }}>
        <span style={{ color: 'rgba(242,237,230,0.5)' }}>טוען...</span>
      </div>
    );
  }
  if (playerQ.error || !playerQ.data) {
    return (
      <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#07080C' }}>
        <span style={{ color: '#F2EDE6' }}>השחקנית לא נמצאה</span>
        <Link to="/results" style={{ color: '#FF4D00' }}>חזרה</Link>
      </div>
    );
  }

  const player = playerQ.data;
  const stats = statsQ.data ?? [];
  const averages = calcAverages(stats);

  return (
    <div dir="rtl" className="min-h-screen py-12 px-4 md:px-8" style={{ background: '#07080C' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <PlayerHeader player={player} />
        <SeasonAveragesCard averages={averages} />
        <PlayerGameLog rows={stats} playerTeamId={player.current_team?.id ?? null} />
      </div>
    </div>
  );
};

export default PlayerPage;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

(Don't commit yet — App.jsx still missing route; commit happens in Task 6.)

---

### Task 6: Wire route in App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Add import**

Near the existing `MatchPage` import in `src/App.jsx`, add:

```jsx
import PlayerPage from './pages/PlayerPage';
```

- [ ] **Step 2: Add route**

Inside the existing `<Routes>` block (next to the `/match/:id` route), add:

```jsx
<Route path="/player/:id" element={<PlayerPage />} />
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/PlayerPage.tsx src/App.jsx
git commit -m "feat(public): add /player/:id page"
```

---

### Task 7: Make player names clickable in BoxScoreTable

**Files:**
- Modify: `src/components/match/BoxScoreTable.tsx`

- [ ] **Step 1: Add Link import**

At the top of `src/components/match/BoxScoreTable.tsx`, add:

```tsx
import { Link } from 'react-router-dom';
```

- [ ] **Step 2: Wrap player name in Link**

Find the existing player-name span (it currently looks like):

```tsx
<span className="text-right truncate" style={{ color: '#F2EDE6' }}>
  {s.player ? `${s.player.first_name} ${s.player.last_name}` : '—'}
</span>
```

Replace with:

```tsx
<span className="text-right truncate" style={{ color: '#F2EDE6' }}>
  {s.player ? (
    <Link
      to={`/player/${s.player.id}`}
      className="hover:underline"
      style={{ color: '#F2EDE6' }}
    >
      {s.player.first_name} {s.player.last_name}
    </Link>
  ) : '—'}
</span>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/match/BoxScoreTable.tsx
git commit -m "feat(public): link player names in box score to /player/:id"
```

---

### Task 8: Manual end-to-end test

- [ ] **Step 1: Run dev server**

```bash
cd C:\Users\Dana\projects\my-motion-app
npm run dev
```

- [ ] **Step 2: Visual checks**

In the browser:

1. Open homepage → "תוצאות" → click any played game → match page
2. In a box score, click a player name → goes to `/player/<uuid>`
3. Player page shows:
   - Header with photo (or initials), name, team, position, age, classification
   - Season averages card
   - Game log table sorted by date desc
4. Click ↗ on any game-log row → returns to that match page
5. Refresh on a `/player/<uuid>` URL directly → page reloads correctly
6. Visit `/player/00000000-0000-0000-0000-000000000000` → "השחקנית לא נמצאה" + back link

If all 6 checks pass, deploy.

- [ ] **Step 3: Push**

```bash
git push
```

GitHub Pages workflow will deploy automatically.

---

## Summary

After all tasks complete:
- ✅ New `/player/:id` route on the public site
- ✅ Header with photo, name, team, position, age, classification
- ✅ Season averages card (PPG, RPG, APG, SPG, EFF)
- ✅ Per-game stat log linking back to match pages
- ✅ Player names in box scores clickable
- ✅ Deployed to wbpl.co.il
