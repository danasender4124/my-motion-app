# Public Site — Real-Data Games + Match Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect `my-motion-app` to Supabase, replace hardcoded results data with live data from the admin DB, and add a public `/match/:id` page with full box score.

**Architecture:** Public site fetches via `@supabase/supabase-js` directly. Read-only RLS policies opened for the relevant tables. TanStack Query handles caching. Existing `Results.tsx` is updated to consume the new query hooks while keeping its visual design.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, framer-motion, Supabase JS SDK, TanStack Query v5.

---

## File Structure

All paths under `C:\Users\Dana\projects\my-motion-app\`.

```
.env.local                            # NEW (gitignored)
.env.example                          # NEW
src/lib/
  supabase.ts                         # NEW
  queries.ts                          # NEW
src/components/match/
  MatchHeader.tsx                     # NEW
  QuarterScoresTable.tsx              # NEW
  BoxScoreTable.tsx                   # NEW
src/pages/
  MatchPage.tsx                       # NEW
src/components/ui/Results.tsx         # MODIFY
src/App.jsx                           # MODIFY (QueryClientProvider + /match/:id route)
package.json                          # MODIFY (add deps)
```

---

### Task 1: Install dependencies + create env files

**Files:**
- Modify: `package.json`
- Create: `.env.local`
- Create: `.env.example`

- [ ] **Step 1: Install runtime deps**

```bash
cd C:\Users\Dana\projects\my-motion-app
npm install @supabase/supabase-js @tanstack/react-query
```

- [ ] **Step 2: Create .env.example**

Create `.env.example` (committed, no real values):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_your_key_here
```

- [ ] **Step 3: Create .env.local**

Create `.env.local` with the SAME values used in `wbpl-admin/.env.local` (anon key is safe to share publicly with RLS):

```
VITE_SUPABASE_URL=https://yobvqtvilzchryzskqic.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_ksd87XxVvovZtLIwenInQg_4dOmh2KL
```

- [ ] **Step 4: Verify .env.local is gitignored**

Check that `.gitignore` already excludes `.env.local` or `*.local`:

```bash
cat .gitignore | grep -E "\.local$|\.env"
```

Expected: matches `*.local` or `.env.local`. If neither, add `.env.local` to `.gitignore`.

- [ ] **Step 5: Commit**

```bash
git add .env.example package.json package-lock.json
git commit -m "feat: add supabase + tanstack query dependencies and env template"
```

---

### Task 2: Apply public RLS policies (manual SQL)

**Files:**
- Create: `supabase/migrations/007_public_read_policies.sql`

- [ ] **Step 1: Create migration file**

```sql
-- Public read policies for the website
create policy "anon_read" on games
  for select to anon using (true);
create policy "anon_read" on teams
  for select to anon using (true);
create policy "anon_read" on seasons
  for select to anon using (true);
create policy "anon_read" on players
  for select to anon using (true);
create policy "anon_read" on player_game_stats
  for select to anon using (true);
create policy "anon_read" on player_team_seasons
  for select to anon using (true);
```

Save to `C:\Users\Dana\projects\my-motion-app\supabase\migrations\007_public_read_policies.sql` (note: store in the public site repo this time so the migrations folder is per repo for clarity).

If a `supabase/migrations` folder doesn't exist in `my-motion-app`, create it.

- [ ] **Step 2: Apply in Supabase SQL Editor**

Open Supabase dashboard → SQL Editor → New query → paste the SQL above → Run.

Expected: "Success. No rows returned" (6 policies created).

- [ ] **Step 3: Commit migration file**

```bash
cd C:\Users\Dana\projects\my-motion-app
git add supabase/migrations/007_public_read_policies.sql
git commit -m "feat(db): public read RLS policies for games and stats"
```

---

### Task 3: Supabase client

**Files:**
- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Implement client**

Create `src/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat: add supabase client for public site"
```

---

### Task 4: Query hooks

**Files:**
- Create: `src/lib/queries.ts`

- [ ] **Step 1: Implement hooks**

Create `src/lib/queries.ts`:

```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

// ── Types ─────────────────────────────────────────────────────────────────────
interface TeamRef {
  id: string;
  name: string;
  logo: string | null;
  home_color: string | null;
  away_color: string | null;
}

export interface GameWithTeams {
  id: string;
  season_id: string;
  round: string | null;
  date: string | null;
  time: string | null;
  home_team_id: string;
  away_team_id: string;
  hall: string | null;
  status: 'scheduled' | 'postponed' | 'played' | 'cancelled';
  home_score: number | null;
  away_score: number | null;
  quarter_scores: { q: number; home: number | null; away: number | null }[] | null;
  watch_url: string | null;
  stats_url: string | null;
  home_team: TeamRef | null;
  away_team: TeamRef | null;
}

export interface PlayerGameStat {
  id: string;
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
  player: { id: string; first_name: string; last_name: string } | null;
}

const SELECT_GAME =
  '*, home_team:teams!games_home_team_id_fkey(id, name, logo, home_color, away_color),' +
  ' away_team:teams!games_away_team_id_fkey(id, name, logo, home_color, away_color)';

const fetchActiveSeasonId = async (): Promise<string | null> => {
  const { data } = await supabase
    .from('seasons').select('id').eq('status', 'active').maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
};

// ── Hooks ─────────────────────────────────────────────────────────────────────
export const useRecentResults = () =>
  useQuery({
    queryKey: ['games', 'recent'],
    queryFn: async (): Promise<GameWithTeams[]> => {
      const seasonId = await fetchActiveSeasonId();
      if (!seasonId) return [];
      const { data, error } = await supabase
        .from('games')
        .select(SELECT_GAME)
        .eq('season_id', seasonId)
        .eq('status', 'played')
        .order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as GameWithTeams[];
    },
    staleTime: 1000 * 60 * 5,
  });

export const useUpcomingGames = () =>
  useQuery({
    queryKey: ['games', 'upcoming'],
    queryFn: async (): Promise<GameWithTeams[]> => {
      const seasonId = await fetchActiveSeasonId();
      if (!seasonId) return [];
      const { data, error } = await supabase
        .from('games')
        .select(SELECT_GAME)
        .eq('season_id', seasonId)
        .eq('status', 'scheduled')
        .order('date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as GameWithTeams[];
    },
    staleTime: 1000 * 60 * 5,
  });

export const useMatch = (id: string | undefined) =>
  useQuery({
    queryKey: ['match', id],
    enabled: !!id,
    queryFn: async (): Promise<GameWithTeams | null> => {
      const { data, error } = await supabase
        .from('games')
        .select(SELECT_GAME)
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as GameWithTeams | null;
    },
  });

export const useMatchStats = (id: string | undefined) =>
  useQuery({
    queryKey: ['match_stats', id],
    enabled: !!id,
    queryFn: async (): Promise<PlayerGameStat[]> => {
      const { data, error } = await supabase
        .from('player_game_stats')
        .select('*, player:players(id, first_name, last_name)')
        .eq('game_id', id!);
      if (error) throw error;
      return (data ?? []) as unknown as PlayerGameStat[];
    },
  });
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat: add tanstack query hooks for games and match stats"
```

---

### Task 5: Wrap App in QueryClientProvider + add /match route

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Read current App.jsx**

Read the file to understand its structure. Look for:
- The router setup (BrowserRouter / Routes)
- Where children are rendered

- [ ] **Step 2: Update imports**

At the top of `src/App.jsx`, ensure these imports exist (add the missing ones):

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MatchPage from './pages/MatchPage';
```

- [ ] **Step 3: Create QueryClient instance**

Outside the App component (top of file, after imports):

```jsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
});
```

- [ ] **Step 4: Wrap router in QueryClientProvider**

Wrap the existing `BrowserRouter` (or top-level routing element) in `<QueryClientProvider client={queryClient}>`. Example structure:

```jsx
return (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {/* existing routes */}
    </BrowserRouter>
  </QueryClientProvider>
);
```

- [ ] **Step 5: Add the /match/:id route**

Inside the existing `<Routes>` block, add:

```jsx
<Route path="/match/:id" element={<MatchPage />} />
```

- [ ] **Step 6: Verify build still works**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 7: Commit (we'll commit after MatchPage is created in Task 9)**

(No commit yet — MatchPage doesn't exist; this commit will fail. We'll do it in Task 9.)

---

### Task 6: MatchHeader component

**Files:**
- Create: `src/components/match/MatchHeader.tsx`

- [ ] **Step 1: Implement**

Create `src/components/match/MatchHeader.tsx`:

```tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { GameWithTeams } from '../../lib/queries';

const formatDate = (iso: string | null): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const TeamBlock: React.FC<{ team: GameWithTeams['home_team']; align: 'right' | 'left' }> = ({ team, align }) => (
  <div className={`flex flex-col items-center gap-3 flex-1 min-w-0`}>
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
  </div>
);

interface Props { game: GameWithTeams }

const MatchHeader: React.FC<Props> = ({ game }) => {
  const homeWon = game.home_score != null && game.away_score != null && game.home_score > game.away_score;
  const awayWon = game.home_score != null && game.away_score != null && game.away_score > game.home_score;
  const meta = [
    game.round, formatDate(game.date), game.time?.slice(0, 5), game.hall,
  ].filter(Boolean).join(' · ');

  return (
    <div dir="rtl" className="space-y-4">
      <Link
        to="/results"
        className="text-sm flex items-center gap-1"
        style={{ color: 'rgba(242,237,230,0.5)' }}
      >
        ← חזרה למשחקים
      </Link>
      <div
        className="rounded-2xl p-8 flex items-center gap-6"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <TeamBlock team={game.home_team} align="right" />
        <div className="flex flex-col items-center gap-2 shrink-0">
          {game.status === 'played' && game.home_score != null && game.away_score != null ? (
            <div className="text-5xl font-black tabular-nums flex items-center gap-3">
              <span style={{ color: homeWon ? '#FF4D00' : '#F2EDE6' }}>{game.home_score}</span>
              <span style={{ color: 'rgba(242,237,230,0.3)' }}>-</span>
              <span style={{ color: awayWon ? '#FF4D00' : '#F2EDE6' }}>{game.away_score}</span>
            </div>
          ) : (
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00' }}
            >
              {game.status === 'scheduled' ? 'מתוכנן' : 'לא שוחק'}
            </span>
          )}
          {meta && (
            <div className="text-xs text-center" style={{ color: 'rgba(242,237,230,0.5)' }}>{meta}</div>
          )}
        </div>
        <TeamBlock team={game.away_team} align="left" />
      </div>
    </div>
  );
};

export default MatchHeader;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/match/MatchHeader.tsx
git commit -m "feat(public): add MatchHeader component"
```

---

### Task 7: QuarterScoresTable component

**Files:**
- Create: `src/components/match/QuarterScoresTable.tsx`

- [ ] **Step 1: Implement**

Create `src/components/match/QuarterScoresTable.tsx`:

```tsx
import React from 'react';
import type { GameWithTeams } from '../../lib/queries';

interface Props { game: GameWithTeams }

const QuarterScoresTable: React.FC<Props> = ({ game }) => {
  if (!game.quarter_scores || game.quarter_scores.length === 0) return null;
  const qs = game.quarter_scores;

  const cols = `1.5fr ${qs.map(() => '1fr').join(' ')} 1fr`;

  const Header: React.FC = () => (
    <div
      className="grid items-center px-4 py-3 text-xs font-black tracking-wider uppercase"
      style={{ gridTemplateColumns: cols, background: 'rgba(255,255,255,0.05)', color: 'rgba(242,237,230,0.4)' }}
    >
      <span>קבוצה</span>
      {qs.map((q) => <span key={q.q} className="text-center">רבע {q.q}</span>)}
      <span className="text-center">סה״כ</span>
    </div>
  );

  const Row: React.FC<{ name: string; quarters: (number | null)[]; total: number | null; isWinner: boolean }> = ({ name, quarters, total, isWinner }) => (
    <div
      className="grid items-center px-4 py-3"
      style={{ gridTemplateColumns: cols, background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <span className="font-bold" style={{ color: '#F2EDE6' }}>{name}</span>
      {quarters.map((v, i) => (
        <span key={i} className="text-center tabular-nums" style={{ color: 'rgba(242,237,230,0.7)' }}>
          {v ?? '—'}
        </span>
      ))}
      <span className="text-center font-black tabular-nums" style={{ color: isWinner ? '#FF4D00' : '#F2EDE6' }}>
        {total ?? '—'}
      </span>
    </div>
  );

  const homeWon = (game.home_score ?? 0) > (game.away_score ?? 0);
  const awayWon = (game.away_score ?? 0) > (game.home_score ?? 0);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      dir="rtl"
    >
      <Header />
      <Row name={game.home_team?.name ?? '—'} quarters={qs.map((q) => q.home)} total={game.home_score} isWinner={homeWon} />
      <Row name={game.away_team?.name ?? '—'} quarters={qs.map((q) => q.away)} total={game.away_score} isWinner={awayWon} />
    </div>
  );
};

export default QuarterScoresTable;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/match/QuarterScoresTable.tsx
git commit -m "feat(public): add QuarterScoresTable component"
```

---

### Task 8: BoxScoreTable component

**Files:**
- Create: `src/components/match/BoxScoreTable.tsx`

- [ ] **Step 1: Implement**

Create `src/components/match/BoxScoreTable.tsx`:

```tsx
import React from 'react';
import type { PlayerGameStat } from '../../lib/queries';

const fg = (m: number | null, a: number | null) => (m == null || a == null ? '—' : `${m}-${a}`);
const safe = (n: number | null) => (n == null ? '—' : n);

const sumKey = (rows: PlayerGameStat[], key: keyof PlayerGameStat): number =>
  rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);

const COLS = '40px 1.6fr 50px 50px 70px 70px 70px 50px 50px 50px 50px 50px 50px 50px 60px';

interface Props {
  teamName: string;
  teamLogo: string | null;
  teamColor: string | null;
  rows: PlayerGameStat[];
}

const BoxScoreTable: React.FC<Props> = ({ teamName, teamLogo, teamColor, rows }) => {
  const header = '# שחקנית דק׳ נק׳ 2נק 3נק עונשין רבד רבת אס חט חס איב עב מדד'.split(' ');
  const accent = teamColor || '#FF4D00';

  const Cell: React.FC<{ children: React.ReactNode; bold?: boolean }> = ({ children, bold }) => (
    <span className={`text-center tabular-nums ${bold ? 'font-black' : ''}`} style={{ color: bold ? '#F2EDE6' : 'rgba(242,237,230,0.7)' }}>
      {children}
    </span>
  );

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }} dir="rtl">
      {/* Team title bar */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: accent }}>
        {teamLogo && (
          <div className="w-8 h-8 rounded shrink-0 bg-white/20 flex items-center justify-center overflow-hidden">
            <img src={teamLogo} alt={teamName} className="w-full h-full object-contain" />
          </div>
        )}
        <span className="font-black text-white">{teamName}</span>
      </div>

      {/* Header row */}
      <div
        className="grid items-center px-3 py-2 text-[10px] font-black uppercase tracking-wider overflow-x-auto"
        style={{ gridTemplateColumns: COLS, background: 'rgba(255,255,255,0.05)', color: 'rgba(242,237,230,0.45)', minWidth: '900px' }}
      >
        {header.map((h, i) => (
          <span key={i} className={i === 1 ? 'text-right' : 'text-center'}>{h}</span>
        ))}
      </div>

      {/* Player rows */}
      <div className="overflow-x-auto">
      {rows.map((s, i) => (
        <div
          key={s.id}
          className="grid items-center px-3 py-2 text-sm"
          style={{
            gridTemplateColumns: COLS,
            background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            minWidth: '900px',
          }}
        >
          <Cell>{/* jersey not stored in player_game_stats — leave dash */}—</Cell>
          <span className="text-right truncate" style={{ color: '#F2EDE6' }}>
            {s.player ? `${s.player.first_name} ${s.player.last_name}` : '—'}
          </span>
          <Cell>{safe(s.minutes)}</Cell>
          <Cell bold>{safe(s.points)}</Cell>
          <Cell>{fg(s.fg2_made, s.fg2_attempted)}</Cell>
          <Cell>{fg(s.fg3_made, s.fg3_attempted)}</Cell>
          <Cell>{fg(s.ft_made, s.ft_attempted)}</Cell>
          <Cell>{safe(s.defensive_rebounds)}</Cell>
          <Cell>{safe(s.offensive_rebounds)}</Cell>
          <Cell>{safe(s.assists)}</Cell>
          <Cell>{safe(s.steals)}</Cell>
          <Cell>{safe(s.blocks)}</Cell>
          <Cell>{safe(s.turnovers)}</Cell>
          <Cell>{safe(s.fouls)}</Cell>
          <Cell bold>{safe(s.efficiency)}</Cell>
        </div>
      ))}

      {/* Totals */}
      {rows.length > 0 && (
        <div
          className="grid items-center px-3 py-3 text-sm font-black"
          style={{
            gridTemplateColumns: COLS,
            background: 'rgba(255,77,0,0.07)',
            borderTop: '2px solid rgba(255,77,0,0.4)',
            minWidth: '900px',
          }}
        >
          <span></span>
          <span className="text-right" style={{ color: '#F2EDE6' }}>סה״כ</span>
          <Cell bold>{sumKey(rows, 'minutes')}</Cell>
          <Cell bold>{sumKey(rows, 'points')}</Cell>
          <span className="text-center tabular-nums">{sumKey(rows, 'fg2_made')}-{sumKey(rows, 'fg2_attempted')}</span>
          <span className="text-center tabular-nums">{sumKey(rows, 'fg3_made')}-{sumKey(rows, 'fg3_attempted')}</span>
          <span className="text-center tabular-nums">{sumKey(rows, 'ft_made')}-{sumKey(rows, 'ft_attempted')}</span>
          <Cell bold>{sumKey(rows, 'defensive_rebounds')}</Cell>
          <Cell bold>{sumKey(rows, 'offensive_rebounds')}</Cell>
          <Cell bold>{sumKey(rows, 'assists')}</Cell>
          <Cell bold>{sumKey(rows, 'steals')}</Cell>
          <Cell bold>{sumKey(rows, 'blocks')}</Cell>
          <Cell bold>{sumKey(rows, 'turnovers')}</Cell>
          <Cell bold>{sumKey(rows, 'fouls')}</Cell>
          <Cell bold>{sumKey(rows, 'efficiency')}</Cell>
        </div>
      )}
      </div>
    </div>
  );
};

export default BoxScoreTable;
```

- [ ] **Step 2: Commit**

```bash
git add src/components/match/BoxScoreTable.tsx
git commit -m "feat(public): add BoxScoreTable component"
```

---

### Task 9: MatchPage orchestrator

**Files:**
- Create: `src/pages/MatchPage.tsx`

- [ ] **Step 1: Implement**

Create `src/pages/MatchPage.tsx`:

```tsx
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMatch, useMatchStats } from '../lib/queries';
import MatchHeader from '../components/match/MatchHeader';
import QuarterScoresTable from '../components/match/QuarterScoresTable';
import BoxScoreTable from '../components/match/BoxScoreTable';

const MatchPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const matchQ = useMatch(id);
  const statsQ = useMatchStats(id);

  if (matchQ.isLoading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center" style={{ background: '#07080C' }}>
        <span style={{ color: 'rgba(242,237,230,0.5)' }}>טוען...</span>
      </div>
    );
  }
  if (matchQ.error || !matchQ.data) {
    return (
      <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#07080C' }}>
        <span style={{ color: '#F2EDE6' }}>המשחק לא נמצא</span>
        <Link to="/results" style={{ color: '#FF4D00' }}>חזרה למשחקים</Link>
      </div>
    );
  }

  const game = matchQ.data;
  const stats = statsQ.data ?? [];
  const homeStats = stats.filter((s) => s.team_id === game.home_team_id);
  const awayStats = stats.filter((s) => s.team_id === game.away_team_id);

  return (
    <div dir="rtl" className="min-h-screen py-12 px-4 md:px-8" style={{ background: '#07080C' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <MatchHeader game={game} />

        {game.status === 'played' ? (
          <>
            <QuarterScoresTable game={game} />
            {homeStats.length > 0 && (
              <BoxScoreTable
                teamName={game.home_team?.name ?? ''}
                teamLogo={game.home_team?.logo ?? null}
                teamColor={game.home_team?.home_color ?? null}
                rows={homeStats}
              />
            )}
            {awayStats.length > 0 && (
              <BoxScoreTable
                teamName={game.away_team?.name ?? ''}
                teamLogo={game.away_team?.logo ?? null}
                teamColor={game.away_team?.away_color ?? null}
                rows={awayStats}
              />
            )}
          </>
        ) : (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(242,237,230,0.6)' }}
          >
            המשחק טרם שוחק.
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchPage;
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit (App.jsx + MatchPage together)**

```bash
git add src/pages/MatchPage.tsx src/App.jsx
git commit -m "feat(public): add /match/:id page with box score"
```

---

### Task 10: Update Results.tsx to use real data

**Files:**
- Modify: `src/components/ui/Results.tsx`

- [ ] **Step 1: Read full current Results.tsx**

Read all of `src/components/ui/Results.tsx` to understand current structure.

- [ ] **Step 2: Replace data import**

In Results.tsx:

1. Remove the import of static data:
```tsx
import { RECENT_RESULTS, UPCOMING_GAMES } from '../../data/league';
```

2. Add new imports near the top:
```tsx
import { Link } from 'react-router-dom';
import { useRecentResults, useUpcomingGames, type GameWithTeams } from '../../lib/queries';
```

- [ ] **Step 3: Add a small data adapter at the top of the component**

Inside the `Results` component, near the top (before the JSX `return`), add:

```tsx
const recentQ = useRecentResults();
const upcomingQ = useUpcomingGames();

// Adapter — map DB shape to the legacy display shape used below
type GameRow = {
  id: string;
  date: string;
  time: string;
  round: string;
  venue: string;
  statsUrl: string;
  watchUrl: string;
  home: string;
  homeLogo: string;
  homeScore: number | null;
  away: string;
  awayLogo: string;
  awayScore: number | null;
};

const fmtDate = (iso: string | null) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const adapt = (g: GameWithTeams): GameRow => ({
  id: g.id,
  date: fmtDate(g.date),
  time: (g.time || '').slice(0, 5),
  round: g.round || '',
  venue: g.hall || '',
  statsUrl: '/match/' + g.id,
  watchUrl: g.watch_url || '',
  home: g.home_team?.name || '',
  homeLogo: g.home_team?.logo || '',
  homeScore: g.home_score,
  away: g.away_team?.name || '',
  awayLogo: g.away_team?.logo || '',
  awayScore: g.away_score,
});

const recent = (recentQ.data ?? []).map(adapt);
const upcoming = (upcomingQ.data ?? []).map(adapt);
```

- [ ] **Step 4: Replace `RECENT_RESULTS` references with `recent`**

Find every reference to `RECENT_RESULTS` and replace with the local variable `recent`. Same for `UPCOMING_GAMES` → `upcoming`.

- [ ] **Step 5: Wrap each results row in a Link**

Find the row that maps each result (the `motion.div` with key `g.id` inside the results-grouped section). Wrap that whole row with:

```tsx
<Link to={r.statsUrl} key={r.id} style={{ display: 'contents' }}>
  {/* the existing motion.div for that row */}
</Link>
```

(`display: contents` keeps the grid layout intact.)

Alternatively, change the wrapping element to a `Link` and keep the same `style`/`className` props.

- [ ] **Step 6: Add loading + error states**

Where the results table is rendered, wrap with:

```tsx
{recentQ.isLoading && (
  <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>
    טוען משחקים...
  </div>
)}
{recentQ.error && (
  <div className="text-center py-12" style={{ color: '#f87171' }}>
    לא ניתן לטעון משחקים כעת.
  </div>
)}
{recentQ.data && recent.length === 0 && (
  <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }}>
    אין משחקים בעונה זו.
  </div>
)}
{recentQ.data && recent.length > 0 && (
  /* existing grouped-by-round rendering */
)}
```

Same pattern for `upcomingQ` / `upcoming`.

- [ ] **Step 7: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/Results.tsx
git commit -m "feat(public): wire Results.tsx to live Supabase data with /match links"
```

---

### Task 11: Manual end-to-end test

- [ ] **Step 1: Run dev server**

```bash
npm run dev
```

- [ ] **Step 2: Visual checks**

In the browser:

1. Open homepage → click "תוצאות" → see real games from active season
2. Click a game row → navigates to `/match/<uuid>`
3. Match page:
   - Header with logos + score (winner in orange)
   - Quarter scores table
   - Two box-score tables (home + away)
4. Click "← חזרה למשחקים" → returns to results
5. Refresh on a `/match/<uuid>` URL directly → page loads
6. Open a game without played status (if any) → header + "המשחק טרם שוחק"
7. Try a non-existent match URL `/match/00000000-0000-0000-0000-000000000000` → "המשחק לא נמצא"

If all 7 checks pass, deploy.

- [ ] **Step 3: Push**

```bash
git push
```

GitHub Pages workflow will deploy automatically.

---

## Summary

After all tasks complete:
- ✅ Public site connects to Supabase via anon key
- ✅ 6 RLS policies allow public read on relevant tables
- ✅ Results page (משחקים ותוצאות) shows live data
- ✅ Each played game links to `/match/:id`
- ✅ Match detail page with header + quarter scores + per-team box scores
- ✅ All loading/error states handled
- ✅ Deployed to wbpl.co.il via GitHub Pages
