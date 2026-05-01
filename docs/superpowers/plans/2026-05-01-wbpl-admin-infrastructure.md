# WBPL Admin — Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the wbpl-admin internal management app with Supabase backend, full database schema, authentication, protected routing, and a working app shell — ready for feature development.

**Architecture:** New React + TypeScript + Vite project at `C:\Users\Dana\projects\wbpl-admin`. Supabase provides PostgreSQL, auth, and Row Level Security. shadcn/ui provides the component system. The app shell (sidebar + topbar) wraps all authenticated pages.

**Tech Stack:** React 19, TypeScript, Vite, shadcn/ui, Tailwind CSS v4, React Router v7, Supabase JS SDK, TanStack Query v5, react-hook-form, zod, Vitest, React Testing Library

---

### Task 1: Scaffold the project

**Files:**
- Create: `C:\Users\Dana\projects\wbpl-admin\` (new directory)
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`

- [ ] **Step 1: Create the Vite project**

Open a terminal in `C:\Users\Dana\projects\` and run:

```bash
npm create vite@latest wbpl-admin -- --template react-ts
cd wbpl-admin
```

- [ ] **Step 2: Verify the scaffold runs**

```bash
npm install
npm run dev
```

Expected: Browser opens at `http://localhost:5173` showing default Vite + React page.

- [ ] **Step 3: Clean up boilerplate**

Delete `src/App.css` and `src/assets/react.svg`.

Replace `src/App.tsx` with:

```tsx
const App = () => <div>WBPL Admin</div>;
export default App;
```

Replace `src/index.css` with:

```css
@import "tailwindcss";
```

- [ ] **Step 4: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold vite react-ts project"
```

---

### Task 2: Install dependencies

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `tsconfig.json`

- [ ] **Step 1: Install all dependencies**

```bash
npm install @supabase/supabase-js @tanstack/react-query react-router-dom react-hook-form zod @hookform/resolvers
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Install shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Neutral**
- CSS variables: **Yes**

- [ ] **Step 3: Install initial shadcn components**

```bash
npx shadcn@latest add button input label card table badge select dropdown-menu avatar separator sheet
```

- [ ] **Step 4: Configure Vitest in vite.config.ts**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

- [ ] **Step 5: Create test setup file**

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom';
```

- [ ] **Step 6: Add test script to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 7: Add path alias to tsconfig.json**

In `tsconfig.json`, add inside `compilerOptions`:

```json
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}
```

- [ ] **Step 8: Verify tests work**

Create `src/test/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('true is true', () => {
    expect(true).toBe(true);
  });
});
```

Run:
```bash
npm test
```

Expected: `1 test passed`.

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: install dependencies and configure vitest + shadcn"
```

---

### Task 3: Set up Supabase project (manual)

**Files:**
- Create: `.env.local`
- Create: `.env.example`

- [ ] **Step 1: Create Supabase project**

1. Go to https://supabase.com and sign in
2. Click **New project**
3. Name: `wbpl-admin`
4. DB password: choose a strong password and save it
5. Region: **West EU (Ireland)** — closest to Israel
6. Click **Create new project** and wait ~2 minutes

- [ ] **Step 2: Get API credentials**

In the Supabase dashboard:
1. Go to **Project Settings → API**
2. Copy **Project URL** (looks like `https://xxxx.supabase.co`)
3. Copy **anon public** key (long JWT string)

- [ ] **Step 3: Create .env.local**

Create `wbpl-admin/.env.local` with your real values:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

- [ ] **Step 4: Create .env.example**

Create `wbpl-admin/.env.example`:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] **Step 5: Add .env.local to .gitignore**

Make sure `.gitignore` contains:
```
.env.local
```

- [ ] **Step 6: Commit**

```bash
git add .env.example .gitignore
git commit -m "feat: add supabase env config"
```

---

### Task 4: Create Supabase client and database types

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/lib/utils.ts`
- Create: `src/types/database.types.ts`

- [ ] **Step 1: Create the Supabase client**

Create `src/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env.local');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 2: Create utils.ts (shadcn helper)**

Create `src/lib/utils.ts`:

```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Create database types**

Create `src/types/database.types.ts`:

```ts
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type SeasonStatus = 'future' | 'active' | 'ended';
export type TeamStatus = 'active' | 'inactive' | 'forming' | 'other';
export type PlayerStatus = 'active' | 'injured' | 'loaned' | 'foreign' | 'israeli' | 'youth' | 'inactive' | 'other';
export type PlayerPosition = 'point_guard' | 'shooting_guard' | 'small_forward' | 'power_forward' | 'center';
export type StaffRoleType = 'head_coach' | 'assistant_coach' | 'fitness_coach' | 'physio' | 'team_manager' | 'scout' | 'doctor' | 'other';
export type StaffStatus = 'active' | 'inactive' | 'moved' | 'other';
export type ManagementRoleType = 'chairman' | 'ceo' | 'sport_director' | 'board_member' | 'owner' | 'ops_manager' | 'marketing_manager' | 'other';
export type ManagementStatus = 'active' | 'inactive' | 'other';
export type GameStatus = 'scheduled' | 'postponed' | 'played' | 'cancelled';
export type AchievementEntityType = 'player' | 'staff' | 'management' | 'team';
export type AchievementType = 'league_title' | 'state_cup' | 'winner_cup' | 'personal' | 'team_other';
export type UserRole = 'admin' | 'league_manager' | 'team_rep' | 'editor' | 'viewer';

export interface Database {
  public: {
    Tables: {
      seasons: {
        Row: {
          id: string;
          name: string;
          start_date: string;
          estimated_end_date: string | null;
          status: SeasonStatus;
        };
        Insert: Omit<Database['public']['Tables']['seasons']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['seasons']['Row']>;
      };
      teams: {
        Row: {
          id: string;
          name: string;
          city: string | null;
          hall_address: string | null;
          color: string | null;
          logo: string | null;
          website: string | null;
          social_links: Json | null;
          contact: Json | null;
          status: TeamStatus;
        };
        Insert: Omit<Database['public']['Tables']['teams']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['teams']['Row']>;
      };
      players: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          birth_date: string | null;
          nationality: string | null;
          country_of_origin: string | null;
          height: number | null;
          position: PlayerPosition | null;
          status: PlayerStatus;
        };
        Insert: Omit<Database['public']['Tables']['players']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['players']['Row']>;
      };
      staff: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          birth_date: string | null;
          role_type: StaffRoleType;
          status: StaffStatus;
        };
        Insert: Omit<Database['public']['Tables']['staff']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['staff']['Row']>;
      };
      management: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          role_type: ManagementRoleType;
          status: ManagementStatus;
        };
        Insert: Omit<Database['public']['Tables']['management']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['management']['Row']>;
      };
      games: {
        Row: {
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
          quarter_scores: Json | null;
          referees: string[] | null;
          watch_url: string | null;
          stats_url: string | null;
          video_url: string | null;
        };
        Insert: Omit<Database['public']['Tables']['games']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['games']['Row']>;
      };
      player_team_seasons: {
        Row: {
          player_id: string;
          team_id: string;
          season_id: string;
          jersey_number: number | null;
        };
        Insert: Database['public']['Tables']['player_team_seasons']['Row'];
        Update: Partial<Database['public']['Tables']['player_team_seasons']['Row']>;
      };
      staff_team_seasons: {
        Row: {
          staff_id: string;
          team_id: string;
          season_id: string;
          role: string | null;
        };
        Insert: Database['public']['Tables']['staff_team_seasons']['Row'];
        Update: Partial<Database['public']['Tables']['staff_team_seasons']['Row']>;
      };
      mgmt_team_seasons: {
        Row: {
          management_id: string;
          team_id: string;
          season_id: string;
          role: string | null;
        };
        Insert: Database['public']['Tables']['mgmt_team_seasons']['Row'];
        Update: Partial<Database['public']['Tables']['mgmt_team_seasons']['Row']>;
      };
      player_game_stats: {
        Row: {
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
        };
        Insert: Omit<Database['public']['Tables']['player_game_stats']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['player_game_stats']['Row']>;
      };
      achievements: {
        Row: {
          id: string;
          entity_type: AchievementEntityType;
          entity_id: string;
          season_id: string | null;
          team_id: string | null;
          type: AchievementType;
          notes: string | null;
        };
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['achievements']['Row']>;
      };
      user_roles: {
        Row: {
          user_id: string;
          role: UserRole;
          team_id: string | null;
        };
        Insert: Database['public']['Tables']['user_roles']['Row'];
        Update: Partial<Database['public']['Tables']['user_roles']['Row']>;
      };
    };
  };
}
```

- [ ] **Step 4: Write a test verifying the Supabase client initializes**

Create `src/lib/supabase.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: vi.fn() })),
}));

describe('supabase client', () => {
  it('exports a supabase instance', async () => {
    const { supabase } = await import('./supabase');
    expect(supabase).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });
});
```

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: `2 tests passed`.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: add supabase client and database types"
```

---

### Task 5: Create database schema in Supabase

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Seasons ──────────────────────────────────────────────────────────────────
create table seasons (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  start_date date not null,
  estimated_end_date date,
  status text not null check (status in ('future', 'active', 'ended'))
);

-- ── Teams ────────────────────────────────────────────────────────────────────
create table teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  city text,
  hall_address text,
  color text,
  logo text,
  website text,
  social_links jsonb,
  contact jsonb,
  status text not null check (status in ('active', 'inactive', 'forming', 'other'))
);

-- ── Players ──────────────────────────────────────────────────────────────────
create table players (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  last_name text not null,
  birth_date date,
  nationality text,
  country_of_origin text,
  height integer,
  position text check (position in ('point_guard','shooting_guard','small_forward','power_forward','center')),
  status text not null check (status in ('active','injured','loaned','foreign','israeli','youth','inactive','other'))
);

-- ── Staff ────────────────────────────────────────────────────────────────────
create table staff (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  last_name text not null,
  birth_date date,
  role_type text not null check (role_type in ('head_coach','assistant_coach','fitness_coach','physio','team_manager','scout','doctor','other')),
  status text not null check (status in ('active','inactive','moved','other'))
);

-- ── Management ───────────────────────────────────────────────────────────────
create table management (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  last_name text not null,
  role_type text not null check (role_type in ('chairman','ceo','sport_director','board_member','owner','ops_manager','marketing_manager','other')),
  status text not null check (status in ('active','inactive','other'))
);

-- ── Games ────────────────────────────────────────────────────────────────────
create table games (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid not null references seasons(id),
  round text,
  date date,
  time time,
  home_team_id uuid not null references teams(id),
  away_team_id uuid not null references teams(id),
  hall text,
  status text not null check (status in ('scheduled','postponed','played','cancelled')),
  home_score integer,
  away_score integer,
  quarter_scores jsonb,
  referees text[],
  watch_url text,
  stats_url text,
  video_url text
);

-- ── Relationship tables ───────────────────────────────────────────────────────
create table player_team_seasons (
  player_id uuid not null references players(id),
  team_id uuid not null references teams(id),
  season_id uuid not null references seasons(id),
  jersey_number integer,
  primary key (player_id, team_id, season_id)
);

create table staff_team_seasons (
  staff_id uuid not null references staff(id),
  team_id uuid not null references teams(id),
  season_id uuid not null references seasons(id),
  role text,
  primary key (staff_id, team_id, season_id)
);

create table mgmt_team_seasons (
  management_id uuid not null references management(id),
  team_id uuid not null references teams(id),
  season_id uuid not null references seasons(id),
  role text,
  primary key (management_id, team_id, season_id)
);

-- ── Statistics ───────────────────────────────────────────────────────────────
create table player_game_stats (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id),
  game_id uuid not null references games(id),
  team_id uuid not null references teams(id),
  minutes integer,
  points integer,
  rebounds integer,
  offensive_rebounds integer,
  defensive_rebounds integer,
  assists integer,
  steals integer,
  blocks integer,
  turnovers integer,
  fouls integer,
  fg2_made integer,
  fg2_attempted integer,
  fg3_made integer,
  fg3_attempted integer,
  ft_made integer,
  ft_attempted integer,
  efficiency integer,
  unique (player_id, game_id)
);

-- ── Achievements ─────────────────────────────────────────────────────────────
create table achievements (
  id uuid primary key default uuid_generate_v4(),
  entity_type text not null check (entity_type in ('player','staff','management','team')),
  entity_id uuid not null,
  season_id uuid references seasons(id),
  team_id uuid references teams(id),
  type text not null check (type in ('league_title','state_cup','winner_cup','personal','team_other')),
  notes text
);

-- ── User roles ───────────────────────────────────────────────────────────────
create table user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','league_manager','team_rep','editor','viewer')),
  team_id uuid references teams(id)
);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table seasons enable row level security;
alter table teams enable row level security;
alter table players enable row level security;
alter table staff enable row level security;
alter table management enable row level security;
alter table games enable row level security;
alter table player_team_seasons enable row level security;
alter table staff_team_seasons enable row level security;
alter table mgmt_team_seasons enable row level security;
alter table player_game_stats enable row level security;
alter table achievements enable row level security;
alter table user_roles enable row level security;

-- Authenticated users can read all public tables
create policy "authenticated_read" on seasons for select using (auth.role() = 'authenticated');
create policy "authenticated_read" on teams for select using (auth.role() = 'authenticated');
create policy "authenticated_read" on players for select using (auth.role() = 'authenticated');
create policy "authenticated_read" on staff for select using (auth.role() = 'authenticated');
create policy "authenticated_read" on management for select using (auth.role() = 'authenticated');
create policy "authenticated_read" on games for select using (auth.role() = 'authenticated');
create policy "authenticated_read" on player_team_seasons for select using (auth.role() = 'authenticated');
create policy "authenticated_read" on staff_team_seasons for select using (auth.role() = 'authenticated');
create policy "authenticated_read" on mgmt_team_seasons for select using (auth.role() = 'authenticated');
create policy "authenticated_read" on player_game_stats for select using (auth.role() = 'authenticated');
create policy "authenticated_read" on achievements for select using (auth.role() = 'authenticated');

-- user_roles: users can only read their own role
create policy "own_role_read" on user_roles for select using (auth.uid() = user_id);

-- Write access: admin and league_manager can write everything (enforced in app layer for now)
create policy "admin_write" on seasons for all using (auth.role() = 'authenticated');
create policy "admin_write" on teams for all using (auth.role() = 'authenticated');
create policy "admin_write" on players for all using (auth.role() = 'authenticated');
create policy "admin_write" on staff for all using (auth.role() = 'authenticated');
create policy "admin_write" on management for all using (auth.role() = 'authenticated');
create policy "admin_write" on games for all using (auth.role() = 'authenticated');
create policy "admin_write" on player_team_seasons for all using (auth.role() = 'authenticated');
create policy "admin_write" on staff_team_seasons for all using (auth.role() = 'authenticated');
create policy "admin_write" on mgmt_team_seasons for all using (auth.role() = 'authenticated');
create policy "admin_write" on player_game_stats for all using (auth.role() = 'authenticated');
create policy "admin_write" on achievements for all using (auth.role() = 'authenticated');
```

- [ ] **Step 2: Apply migration in Supabase SQL Editor**

1. Open Supabase dashboard → **SQL Editor**
2. Click **New query**
3. Paste the entire contents of `001_initial_schema.sql`
4. Click **Run**

Expected: "Success. No rows returned"

- [ ] **Step 3: Verify tables were created**

In Supabase dashboard → **Table Editor**, confirm these tables appear:
`seasons`, `teams`, `players`, `staff`, `management`, `games`, `player_team_seasons`, `staff_team_seasons`, `mgmt_team_seasons`, `player_game_stats`, `achievements`, `user_roles`

- [ ] **Step 4: Commit the migration file**

```bash
git add supabase/
git commit -m "feat: add initial database schema with RLS"
```

---

### Task 6: Auth — useAuth hook

**Files:**
- Create: `src/hooks/useAuth.ts`
- Create: `src/hooks/useAuth.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useAuth.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: '123', email: 'admin@wbpl.co.il' } } },
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { role: 'admin', team_id: null },
            error: null,
          }),
        }),
      }),
    }),
  },
}));

describe('useAuth', () => {
  it('initializes with loading state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
  });

  it('exposes signIn and signOut functions', () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.signIn).toBe('function');
    expect(typeof result.current.signOut).toBe('function');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test
```

Expected: FAIL — `useAuth` not found.

- [ ] **Step 3: Implement useAuth**

Create `src/hooks/useAuth.ts`:

```ts
import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/database.types';

interface AuthUser extends User {
  appRole?: UserRole;
  appTeamId?: string | null;
}

interface UseAuthReturn {
  session: Session | null;
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string): Promise<{ role: UserRole; team_id: string | null } | null> => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, team_id')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data as { role: UserRole; team_id: string | null };
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const roleData = await fetchUserRole(session.user.id);
        setUser({ ...session.user, appRole: roleData?.role, appTeamId: roleData?.team_id });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const roleData = await fetchUserRole(session.user.id);
        setUser({ ...session.user, appRole: roleData?.role, appTeamId: roleData?.team_id });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, user, loading, signIn, signOut };
};
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: `3 tests passed`.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/
git commit -m "feat: add useAuth hook with session and role management"
```

---

### Task 7: Login page

**Files:**
- Create: `src/pages/LoginPage.tsx`
- Create: `src/pages/LoginPage.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/pages/LoginPage.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

const mockSignIn = vi.fn().mockResolvedValue({ error: null });

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    loading: false,
    user: null,
    session: null,
    signOut: vi.fn(),
  }),
}));

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    expect(screen.getByLabelText(/אימייל/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/סיסמה/i)).toBeInTheDocument();
  });

  it('calls signIn on form submit', async () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    await userEvent.type(screen.getByLabelText(/אימייל/i), 'admin@wbpl.co.il');
    await userEvent.type(screen.getByLabelText(/סיסמה/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /כניסה/i }));
    expect(mockSignIn).toHaveBeenCalledWith('admin@wbpl.co.il', 'password123');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test
```

Expected: FAIL — `LoginPage` not found.

- [ ] **Step 3: Implement LoginPage**

Create `src/pages/LoginPage.tsx`:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    const { error } = await signIn(data.email, data.password);
    if (error) {
      setServerError('אימייל או סיסמה שגויים');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">ליגת אתנה וינר</CardTitle>
          <p className="text-gray-500 text-sm mt-1">מערכת ניהול פנימית</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">אימייל</Label>
              <Input id="email" type="email" {...register('email')} placeholder="name@wbpl.co.il" />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">סיסמה</Label>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            {serverError && (
              <p className="text-red-500 text-sm text-center">{serverError}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'מתחבר...' : 'כניסה'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
```

- [ ] **Step 4: Run tests**

```bash
npm test
```

Expected: `5 tests passed`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/LoginPage.tsx src/pages/LoginPage.test.tsx
git commit -m "feat: add login page with form validation"
```

---

### Task 8: App shell (layout + sidebar)

**Files:**
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/TopBar.tsx`
- Create: `src/components/layout/AppLayout.tsx`
- Create: `src/pages/DashboardPage.tsx`

- [ ] **Step 1: Create Sidebar**

Create `src/components/layout/Sidebar.tsx`:

```tsx
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/',            label: 'דשבורד' },
  { to: '/seasons',     label: 'עונות' },
  { to: '/teams',       label: 'קבוצות' },
  { to: '/players',     label: 'שחקניות' },
  { to: '/staff',       label: 'צוות מקצועי' },
  { to: '/management',  label: 'הנהלה' },
  { to: '/games',       label: 'משחקים' },
  { to: '/stats',       label: 'סטטיסטיקה' },
  { to: '/achievements',label: 'תארים' },
];

const Sidebar = () => (
  <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col" dir="rtl">
    <div className="px-4 py-5 border-b border-gray-700">
      <span className="font-bold text-lg">WBPL Admin</span>
    </div>
    <nav className="flex-1 py-4">
      {NAV_ITEMS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'block px-4 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-orange-500 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
```

- [ ] **Step 2: Create TopBar**

Create `src/components/layout/TopBar.tsx`:

```tsx
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const TopBar = () => {
  const { user, signOut } = useAuth();

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : '??';

  return (
    <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white" dir="rtl">
      <span className="text-sm text-gray-500">
        תפקיד: <span className="font-semibold text-gray-800">{user?.appRole ?? '—'}</span>
      </span>
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-xs bg-orange-100 text-orange-600">{initials}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-gray-600">{user?.email}</span>
        <Button variant="ghost" size="sm" onClick={signOut}>
          יציאה
        </Button>
      </div>
    </header>
  );
};

export default TopBar;
```

- [ ] **Step 3: Create AppLayout**

Create `src/components/layout/AppLayout.tsx`:

```tsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AppLayout = () => (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <TopBar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  </div>
);

export default AppLayout;
```

- [ ] **Step 4: Create placeholder DashboardPage**

Create `src/pages/DashboardPage.tsx`:

```tsx
const DashboardPage = () => (
  <div dir="rtl">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">דשבורד</h1>
    <p className="text-gray-500">ברוכה הבאה למערכת הניהול של ליגת אתנה וינר.</p>
  </div>
);

export default DashboardPage;
```

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/ src/pages/DashboardPage.tsx
git commit -m "feat: add app shell with sidebar, topbar, and layout"
```

---

### Task 9: Routing with protected routes

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/ProtectedRoute.tsx`

- [ ] **Step 1: Write test for ProtectedRoute**

Create `src/components/ProtectedRoute.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/hooks/useAuth';

describe('ProtectedRoute', () => {
  it('shows loading when auth is loading', () => {
    vi.mocked(useAuth).mockReturnValue({ loading: true, user: null, session: null, signIn: vi.fn(), signOut: vi.fn() });
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Protected</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({ loading: false, user: null, session: null, signIn: vi.fn(), signOut: vi.fn() });
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Protected</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      loading: false,
      user: { id: '1', email: 'a@b.com', appRole: 'admin' } as any,
      session: {} as any,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Protected</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Protected')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test
```

Expected: FAIL — `ProtectedRoute` not found.

- [ ] **Step 3: Implement ProtectedRoute**

Create `src/components/ProtectedRoute.tsx`:

```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
```

- [ ] **Step 4: Wire up App.tsx**

Replace `src/App.tsx` with:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/seasons"      element={<div dir="rtl"><h1 className="text-2xl font-bold">עונות</h1><p className="text-gray-400 mt-2">בקרוב</p></div>} />
            <Route path="/teams"        element={<div dir="rtl"><h1 className="text-2xl font-bold">קבוצות</h1><p className="text-gray-400 mt-2">בקרוב</p></div>} />
            <Route path="/players"      element={<div dir="rtl"><h1 className="text-2xl font-bold">שחקניות</h1><p className="text-gray-400 mt-2">בקרוב</p></div>} />
            <Route path="/staff"        element={<div dir="rtl"><h1 className="text-2xl font-bold">צוות מקצועי</h1><p className="text-gray-400 mt-2">בקרוב</p></div>} />
            <Route path="/management"   element={<div dir="rtl"><h1 className="text-2xl font-bold">הנהלה</h1><p className="text-gray-400 mt-2">בקרוב</p></div>} />
            <Route path="/games"        element={<div dir="rtl"><h1 className="text-2xl font-bold">משחקים</h1><p className="text-gray-400 mt-2">בקרוב</p></div>} />
            <Route path="/stats"        element={<div dir="rtl"><h1 className="text-2xl font-bold">סטטיסטיקה</h1><p className="text-gray-400 mt-2">בקרוב</p></div>} />
            <Route path="/achievements" element={<div dir="rtl"><h1 className="text-2xl font-bold">תארים</h1><p className="text-gray-400 mt-2">בקרוב</p></div>} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
```

- [ ] **Step 5: Run tests**

```bash
npm test
```

Expected: `8 tests passed`.

- [ ] **Step 6: Start dev server and test manually**

```bash
npm run dev
```

1. Open `http://localhost:5173` — should redirect to `/login`
2. The login form should render in Hebrew RTL
3. Try wrong credentials — should show "אימייל או סיסמה שגויים"

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: add protected routing and full app shell"
```

---

### Task 10: Deploy to Vercel

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create vercel.json for SPA routing**

Create `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 2: Push to GitHub**

```bash
git add vercel.json
git commit -m "feat: add vercel config for SPA routing"

git remote add origin https://github.com/danasender4124/wbpl-admin.git
git push -u origin master
```

(Create the `wbpl-admin` repo on GitHub first if it doesn't exist.)

- [ ] **Step 3: Deploy on Vercel**

1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New → Project**
3. Import `wbpl-admin` from GitHub
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click **Deploy**

- [ ] **Step 4: Set up first admin user**

1. In Supabase dashboard → **Authentication → Users** → **Invite user**
2. Enter email address for the admin user
3. After the user accepts the invite and sets a password, run in Supabase SQL Editor:

```sql
insert into user_roles (user_id, role, team_id)
values ('<USER_UUID_FROM_AUTH_USERS>', 'admin', null);
```

(Replace `<USER_UUID_FROM_AUTH_USERS>` with the actual UUID from Supabase Auth → Users table.)

- [ ] **Step 5: Verify live deployment**

1. Open the Vercel URL
2. Confirm redirect to `/login`
3. Sign in with the admin user
4. Confirm you see the dashboard with sidebar navigation

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: deploy to vercel with supabase auth"
git push
```

---

## Summary

After completing all tasks you will have:
- ✅ New `wbpl-admin` repo on GitHub
- ✅ Full database schema in Supabase with all 12 tables and RLS
- ✅ Auth system with email/password login and role fetching
- ✅ Protected routing — unauthenticated users redirected to `/login`
- ✅ App shell with Hebrew RTL sidebar and all 9 navigation sections (placeholder pages)
- ✅ Live deployment on Vercel
- ✅ 8 passing tests (auth, login form, protected route)
