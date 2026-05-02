# WBPL Admin — Players CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build full player management — list with advanced filters, create with team/season assignment, profile with details + season history, photo upload, and delete with safeguards.

**Architecture:** Three routes (`/players`, `/players/new`, `/players/:id`). Sortable table with 6 filters. Profile page uses tabs (פרטי שחקנית, היסטוריית קבוצות, future placeholders). New `classification` field separates league-eligibility status from operational status. Player photos upload to Supabase Storage. Country list provided by `i18n-iso-countries`.

**Tech Stack:** React 19, TypeScript, Supabase (DB + Storage), TanStack Query v5, react-hook-form, zod, shadcn/ui, i18n-iso-countries, Vitest.

---

## File Structure

All paths relative to `C:\Users\Dana\projects\wbpl-admin\`.

```
supabase/migrations/
  005_players_classification_photo.sql

src/lib/
  countries.ts                          # ISO code → Hebrew name lookup

src/features/players/
  players.types.ts
  players.schema.ts
  players.queries.ts
  PhotoUpload.tsx
  CountrySelect.tsx
  PlayersFilters.tsx
  PlayersTable.tsx
  PlayerForm.tsx
  PlayerHeader.tsx
  PlayerSeasonsTable.tsx
  AddPlayerSeasonDialog.tsx
  EditJerseyDialog.tsx
  RemovePlayerSeasonDialog.tsx
  DeletePlayerDialog.tsx

src/pages/
  PlayersListPage.tsx
  NewPlayerPage.tsx
  PlayerDetailPage.tsx

src/App.tsx                             # Add 3 routes
```

---

### Task 1: Database migration + storage bucket + i18n-iso-countries

**Files:**
- Create: `supabase/migrations/005_players_classification_photo.sql`
- Modify: `package.json` (add i18n-iso-countries)

- [ ] **Step 1: Install country library**

```bash
cd C:\Users\Dana\projects\wbpl-admin
npm install i18n-iso-countries
```

- [ ] **Step 2: Create migration file**

Create `supabase/migrations/005_players_classification_photo.sql`:

```sql
-- Add photo column
alter table players add column photo text;

-- Migrate existing status values that overlap with the new classification concept
update players set status = 'active' where status in ('foreign', 'israeli');
update players set status = 'college' where status = 'loaned';

-- Replace status check constraint
alter table players drop constraint players_status_check;
alter table players add constraint players_status_check
  check (status in ('active', 'injured', 'college', 'youth', 'inactive', 'other'));

-- Add classification column
alter table players add column classification text not null default 'israeli'
  check (classification in ('israeli', 'naturalized', 'foreign', 'bosman'));

-- Update position values to ensure they exist (no-op if check already in place)
-- (no change required; position constraint stays as-is)

-- Storage bucket for player photos
insert into storage.buckets (id, name, public)
values ('player-photos', 'player-photos', true)
on conflict (id) do nothing;

create policy "Public can read player photos"
  on storage.objects for select
  using (bucket_id = 'player-photos');

create policy "Authenticated users can upload player photos"
  on storage.objects for insert
  with check (bucket_id = 'player-photos' and auth.role() = 'authenticated');

create policy "Authenticated users can update player photos"
  on storage.objects for update
  using (bucket_id = 'player-photos' and auth.role() = 'authenticated');

create policy "Authenticated users can delete player photos"
  on storage.objects for delete
  using (bucket_id = 'player-photos' and auth.role() = 'authenticated');
```

- [ ] **Step 3: Apply in Supabase SQL Editor**

Open Supabase → SQL Editor → New query → paste the SQL above → Run.

Expected: "Success. No rows returned"

- [ ] **Step 4: Verify in Supabase dashboard**

1. Database → Tables → click `players` → confirm `photo` and `classification` columns exist
2. Storage → confirm `player-photos` bucket exists and is public

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/005_players_classification_photo.sql package.json package-lock.json
git commit -m "feat(db): players photo + classification + storage bucket"
```

---

### Task 2: Types + zod schema (TDD)

**Files:**
- Create: `src/features/players/players.types.ts`
- Create: `src/features/players/players.schema.ts`
- Create: `src/features/players/players.schema.test.ts`
- Modify: `src/types/database.types.ts` (add classification, photo, update status enum)

- [ ] **Step 1: Update database types**

In `src/types/database.types.ts`:

Find:
```ts
export type PlayerStatus = 'active' | 'injured' | 'loaned' | 'foreign' | 'israeli' | 'youth' | 'inactive' | 'other';
```

Replace with:
```ts
export type PlayerStatus = 'active' | 'injured' | 'college' | 'youth' | 'inactive' | 'other';
export type PlayerClassification = 'israeli' | 'naturalized' | 'foreign' | 'bosman';
```

Find the `players` table block (`Row:` definition) and update it:

```ts
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
    classification: PlayerClassification;
    photo: string | null;
  };
  Insert: Omit<Database['public']['Tables']['players']['Row'], 'id'> & { id?: string };
  Update: Partial<Database['public']['Tables']['players']['Row']>;
};
```

- [ ] **Step 2: Create types file**

Create `src/features/players/players.types.ts`:

```ts
import type { PlayerPosition, PlayerStatus, PlayerClassification } from '@/types/database.types';

export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  nationality: string | null;          // ISO 3166-1 alpha-2 code (e.g. 'IL', 'US')
  country_of_origin: string | null;    // ISO 3166-1 alpha-2 code
  height: number | null;
  position: PlayerPosition | null;
  status: PlayerStatus;
  classification: PlayerClassification;
  photo: string | null;
}

export interface PlayerInput {
  first_name: string;
  last_name: string;
  birth_date: string | null;
  nationality: string | null;
  country_of_origin: string | null;
  height: number | null;
  position: PlayerPosition | null;
  status: PlayerStatus;
  classification: PlayerClassification;
  photo: string | null;
}

export interface PlayerSeasonRow {
  player_id: string;
  team_id: string;
  season_id: string;
  jersey_number: number | null;
}

export interface PlayerFilters {
  search: string;
  season_id: string | null;            // null = current active season
  team_id: string | null;              // null = all teams
  position: PlayerPosition | null;     // null = all
  classification: PlayerClassification | null;
  status: PlayerStatus | null;
  nationality: string | null;
}
```

- [ ] **Step 3: Write failing schema test**

Create `src/features/players/players.schema.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { playerSchema, newPlayerSchema } from './players.schema';

const validPlayer = {
  first_name: 'ספרקל',
  last_name: 'טיילור',
  birth_date: '1996-05-15',
  nationality: 'US',
  country_of_origin: 'US',
  height: 180,
  position: 'small_forward',
  status: 'active',
  classification: 'foreign',
  photo: null,
};

describe('playerSchema', () => {
  it('accepts a valid full player', () => {
    expect(playerSchema.safeParse(validPlayer).success).toBe(true);
  });

  it('accepts minimal valid player', () => {
    expect(playerSchema.safeParse({
      first_name: 'דנה',
      last_name: 'כהן',
      birth_date: null,
      nationality: null,
      country_of_origin: null,
      height: null,
      position: null,
      status: 'active',
      classification: 'israeli',
      photo: null,
    }).success).toBe(true);
  });

  it('rejects empty first_name', () => {
    expect(playerSchema.safeParse({ ...validPlayer, first_name: '' }).success).toBe(false);
  });

  it('rejects empty last_name', () => {
    expect(playerSchema.safeParse({ ...validPlayer, last_name: '' }).success).toBe(false);
  });

  it('rejects height below 130', () => {
    expect(playerSchema.safeParse({ ...validPlayer, height: 100 }).success).toBe(false);
  });

  it('rejects height above 230', () => {
    expect(playerSchema.safeParse({ ...validPlayer, height: 250 }).success).toBe(false);
  });

  it('rejects invalid classification', () => {
    expect(playerSchema.safeParse({ ...validPlayer, classification: 'banana' }).success).toBe(false);
  });

  it('rejects invalid status', () => {
    expect(playerSchema.safeParse({ ...validPlayer, status: 'loaned' }).success).toBe(false);
  });
});

describe('newPlayerSchema', () => {
  it('requires team_id', () => {
    const result = newPlayerSchema.safeParse({ ...validPlayer, team_id: '', jersey_number: null });
    expect(result.success).toBe(false);
  });

  it('accepts valid team_id', () => {
    const result = newPlayerSchema.safeParse({
      ...validPlayer,
      team_id: '00000000-0000-0000-0000-000000000001',
      jersey_number: 23,
    });
    expect(result.success).toBe(true);
  });

  it('rejects jersey_number above 99', () => {
    const result = newPlayerSchema.safeParse({
      ...validPlayer,
      team_id: '00000000-0000-0000-0000-000000000001',
      jersey_number: 100,
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 4: Verify failure**

```bash
npm test -- --run src/features/players/players.schema.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 5: Implement schema**

Create `src/features/players/players.schema.ts`:

```ts
import { z } from 'zod';

const POSITIONS = ['point_guard', 'shooting_guard', 'small_forward', 'power_forward', 'center'] as const;
const STATUSES = ['active', 'injured', 'college', 'youth', 'inactive', 'other'] as const;
const CLASSIFICATIONS = ['israeli', 'naturalized', 'foreign', 'bosman'] as const;

export const playerSchema = z.object({
  first_name: z.string().trim().min(1, 'שם פרטי הוא שדה חובה').max(50, 'שם פרטי ארוך מדי'),
  last_name: z.string().trim().min(1, 'שם משפחה הוא שדה חובה').max(50, 'שם משפחה ארוך מדי'),
  birth_date: z.string().nullable(),
  nationality: z.string().nullable(),
  country_of_origin: z.string().nullable(),
  height: z.number().int().min(130, 'גובה מינימלי 130 ס"מ').max(230, 'גובה מקסימלי 230 ס"מ').nullable(),
  position: z.enum(POSITIONS).nullable(),
  status: z.enum(STATUSES),
  classification: z.enum(CLASSIFICATIONS),
  photo: z.string().nullable(),
});

export type PlayerFormValues = z.infer<typeof playerSchema>;

export const newPlayerSchema = playerSchema.extend({
  team_id: z.string().uuid('יש לבחור קבוצה'),
  jersey_number: z.number().int().min(0).max(99, 'מספר חולצה 0-99').nullable(),
});

export type NewPlayerFormValues = z.infer<typeof newPlayerSchema>;
```

- [ ] **Step 6: Run tests**

```bash
npm test -- --run src/features/players/players.schema.test.ts
```

Expected: 11 tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/features/players/ src/types/database.types.ts
git commit -m "feat(players): add types and zod schemas"
```

---

### Task 3: Countries lookup module (TDD)

**Files:**
- Create: `src/lib/countries.ts`
- Create: `src/lib/countries.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/lib/countries.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getCountryName, getAllCountries } from './countries';

describe('countries', () => {
  it('returns Hebrew name for ISO code', () => {
    expect(getCountryName('IL')).toBe('ישראל');
    expect(getCountryName('US')).toBe('ארצות הברית');
  });

  it('returns null for unknown code', () => {
    expect(getCountryName('XX')).toBeNull();
  });

  it('returns null for null input', () => {
    expect(getCountryName(null)).toBeNull();
  });

  it('lists all countries with code and name', () => {
    const all = getAllCountries();
    expect(all.length).toBeGreaterThan(200);
    expect(all.some((c) => c.code === 'IL' && c.name === 'ישראל')).toBe(true);
    expect(all.every((c) => typeof c.code === 'string' && typeof c.name === 'string')).toBe(true);
  });

  it('sorts countries alphabetically by Hebrew name', () => {
    const all = getAllCountries();
    const names = all.map((c) => c.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b, 'he'));
    expect(names).toEqual(sorted);
  });
});
```

- [ ] **Step 2: Verify failure**

```bash
npm test -- --run src/lib/countries.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement countries module**

Create `src/lib/countries.ts`:

```ts
import countries from 'i18n-iso-countries';
import heLocale from 'i18n-iso-countries/langs/he.json';

countries.registerLocale(heLocale);

export interface Country {
  code: string;
  name: string;
}

export const getCountryName = (code: string | null): string | null => {
  if (!code) return null;
  const name = countries.getName(code, 'he');
  return name || null;
};

export const getAllCountries = (): Country[] => {
  const namesObj = countries.getNames('he', { select: 'official' });
  return Object.entries(namesObj)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'he'));
};
```

- [ ] **Step 4: Run tests**

```bash
npm test -- --run src/lib/countries.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/
git commit -m "feat: add countries lookup module"
```

---

### Task 4: TanStack Query hooks (TDD)

**Files:**
- Create: `src/features/players/players.queries.ts`
- Create: `src/features/players/players.queries.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/features/players/players.queries.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type ReactNode } from 'react';
import { usePlayers } from './players.queries';

const orderMock = vi.fn();
const fromMock = vi.fn(() => ({ select: vi.fn(() => ({ order: orderMock })) }));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/p.png' } })),
      })),
    },
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
};

describe('usePlayers', () => {
  beforeEach(() => {
    fromMock.mockClear();
    orderMock.mockReset();
  });

  it('returns players sorted by last_name', async () => {
    orderMock.mockResolvedValue({
      data: [
        {
          id: 'p1', first_name: 'ספרקל', last_name: 'טיילור',
          birth_date: '1996-05-15', nationality: 'US', country_of_origin: 'US',
          height: 180, position: 'small_forward', status: 'active',
          classification: 'foreign', photo: null,
        },
      ],
      error: null,
    });
    const { result } = renderHook(
      () => usePlayers({ search: '', season_id: null, team_id: null, position: null, classification: null, status: null, nationality: null }),
      { wrapper }
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Verify failure**

```bash
npm test -- --run src/features/players/players.queries.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement queries**

Create `src/features/players/players.queries.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Player, PlayerInput, PlayerFilters, PlayerSeasonRow } from './players.types';

const KEY = ['players'];

interface PlayerWithCurrentTeam extends Player {
  current_team_id?: string | null;
  current_team_name?: string | null;
  current_jersey_number?: number | null;
}

export const usePlayers = (filters: PlayerFilters) =>
  useQuery({
    queryKey: [...KEY, 'list', filters],
    queryFn: async (): Promise<PlayerWithCurrentTeam[]> => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('last_name', { ascending: true });
      if (error) throw error;
      let rows = (data ?? []) as Player[];

      // Apply text filters client-side for the simple cases
      if (filters.search.trim()) {
        const term = filters.search.trim();
        rows = rows.filter((p) =>
          p.first_name.includes(term) || p.last_name.includes(term)
        );
      }
      if (filters.position) rows = rows.filter((p) => p.position === filters.position);
      if (filters.classification) rows = rows.filter((p) => p.classification === filters.classification);
      if (filters.status) rows = rows.filter((p) => p.status === filters.status);
      if (filters.nationality) rows = rows.filter((p) => p.nationality === filters.nationality);

      // Resolve current-season team for each player
      const seasonId = filters.season_id;
      let activeSeasonId = seasonId;
      if (!activeSeasonId) {
        const { data: active } = await supabase
          .from('seasons')
          .select('id')
          .eq('status', 'active')
          .maybeSingle();
        activeSeasonId = (active as { id: string } | null)?.id ?? null;
      }

      if (!activeSeasonId) {
        return rows.map((r) => ({ ...r }));
      }

      const playerIds = rows.map((p) => p.id);
      if (playerIds.length === 0) return [];

      const { data: pts } = await supabase
        .from('player_team_seasons')
        .select('player_id, team_id, jersey_number, teams(id, name)')
        .eq('season_id', activeSeasonId)
        .in('player_id', playerIds);

      const ptsMap = new Map<string, { team_id: string; team_name: string; jersey_number: number | null }>();
      (pts ?? []).forEach((row: { player_id: string; team_id: string; jersey_number: number | null; teams: { name: string } | null }) => {
        ptsMap.set(row.player_id, {
          team_id: row.team_id,
          team_name: row.teams?.name ?? '',
          jersey_number: row.jersey_number,
        });
      });

      let withTeams: PlayerWithCurrentTeam[] = rows.map((p) => {
        const cur = ptsMap.get(p.id);
        return {
          ...p,
          current_team_id: cur?.team_id ?? null,
          current_team_name: cur?.team_name ?? null,
          current_jersey_number: cur?.jersey_number ?? null,
        };
      });

      if (filters.team_id) {
        withTeams = withTeams.filter((p) => p.current_team_id === filters.team_id);
      }

      return withTeams;
    },
  });

export const usePlayer = (id: string | undefined) =>
  useQuery({
    queryKey: [...KEY, id],
    enabled: !!id,
    queryFn: async (): Promise<Player> => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Player;
    },
  });

export const useCreatePlayer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      input: PlayerInput & { team_id: string; jersey_number: number | null }
    ): Promise<Player> => {
      const { team_id, jersey_number, ...playerInput } = input;
      const { data, error } = await supabase
        .from('players')
        .insert(playerInput)
        .select()
        .single();
      if (error) throw error;

      const { data: activeSeason } = await supabase
        .from('seasons')
        .select('id')
        .eq('status', 'active')
        .maybeSingle();
      if (activeSeason) {
        await supabase.from('player_team_seasons').insert({
          player_id: (data as Player).id,
          team_id,
          season_id: (activeSeason as { id: string }).id,
          jersey_number,
        });
      }
      return data as Player;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUpdatePlayer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<PlayerInput> }): Promise<Player> => {
      const { data, error } = await supabase
        .from('players')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Player;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, v.id] });
    },
  });
};

export const useDeletePlayer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('players').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUploadPlayerPhoto = () =>
  useMutation({
    mutationFn: async ({ playerId, file }: { playerId: string; file: File }): Promise<string> => {
      const ext = file.name.split('.').pop();
      const path = `${playerId}/photo-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('player-photos')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('player-photos').getPublicUrl(path);
      return data.publicUrl;
    },
  });

interface PlayerSeasonWithRefs {
  team_id: string;
  season_id: string;
  jersey_number: number | null;
  teams: { id: string; name: string } | null;
  seasons: { id: string; name: string; status: string; start_date: string } | null;
}

export const usePlayerSeasons = (playerId: string | undefined) =>
  useQuery({
    queryKey: ['player_seasons', playerId],
    enabled: !!playerId,
    queryFn: async (): Promise<PlayerSeasonWithRefs[]> => {
      const { data, error } = await supabase
        .from('player_team_seasons')
        .select('team_id, season_id, jersey_number, teams(id, name), seasons(id, name, status, start_date)')
        .eq('player_id', playerId!);
      if (error) throw error;
      return ((data ?? []) as unknown as PlayerSeasonWithRefs[]).sort((a, b) => {
        const aDate = a.seasons?.start_date ?? '';
        const bDate = b.seasons?.start_date ?? '';
        return bDate.localeCompare(aDate);
      });
    },
  });

export const useAddPlayerSeason = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PlayerSeasonRow): Promise<void> => {
      const { error } = await supabase.from('player_team_seasons').insert(input);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['player_seasons', v.player_id] });
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useUpdatePlayerJersey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PlayerSeasonRow): Promise<void> => {
      const { error } = await supabase
        .from('player_team_seasons')
        .update({ jersey_number: input.jersey_number })
        .eq('player_id', input.player_id)
        .eq('team_id', input.team_id)
        .eq('season_id', input.season_id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['player_seasons', v.player_id] }),
  });
};

export const useRemovePlayerSeason = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<PlayerSeasonRow, 'jersey_number'>): Promise<void> => {
      const { error } = await supabase
        .from('player_team_seasons')
        .delete()
        .eq('player_id', input.player_id)
        .eq('team_id', input.team_id)
        .eq('season_id', input.season_id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['player_seasons', v.player_id] });
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const usePlayerStatsCount = (playerId: string | undefined, seasonId?: string) =>
  useQuery({
    queryKey: ['player_game_stats', 'count', playerId, seasonId],
    enabled: !!playerId,
    queryFn: async (): Promise<number> => {
      let q = supabase
        .from('player_game_stats')
        .select('*', { count: 'exact', head: true })
        .eq('player_id', playerId!);
      if (seasonId) {
        const { data: gameIds } = await supabase
          .from('games')
          .select('id')
          .eq('season_id', seasonId);
        const ids = (gameIds ?? []).map((r: { id: string }) => r.id);
        if (ids.length === 0) return 0;
        q = q.in('game_id', ids);
      }
      const { count, error } = await q;
      if (error) throw error;
      return count ?? 0;
    },
  });
```

- [ ] **Step 4: Run tests**

```bash
npm test -- --run src/features/players/players.queries.test.ts
```

Expected: 1 test passes.

- [ ] **Step 5: Commit**

```bash
git add src/features/players/
git commit -m "feat(players): add tanstack query hooks for CRUD + storage + seasons"
```

---

### Task 5: PhotoUpload + CountrySelect components (TDD)

**Files:**
- Create: `src/features/players/PhotoUpload.tsx`
- Create: `src/features/players/PhotoUpload.test.tsx`
- Create: `src/features/players/CountrySelect.tsx`
- Create: `src/features/players/CountrySelect.test.tsx`

- [ ] **Step 1: Write PhotoUpload test**

Create `src/features/players/PhotoUpload.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhotoUpload from './PhotoUpload';

describe('PhotoUpload', () => {
  it('renders preview when photoUrl is set', () => {
    render(<PhotoUpload photoUrl="https://example.com/p.png" onFileSelected={vi.fn()} uploading={false} />);
    expect(screen.getByRole('img', { name: /תמונה/i })).toHaveAttribute('src', 'https://example.com/p.png');
  });

  it('renders placeholder when no photo', () => {
    render(<PhotoUpload photoUrl={null} onFileSelected={vi.fn()} uploading={false} />);
    expect(screen.getByText(/בחרי תמונה/i)).toBeInTheDocument();
  });

  it('calls onFileSelected when file chosen', async () => {
    const onFileSelected = vi.fn();
    render(<PhotoUpload photoUrl={null} onFileSelected={onFileSelected} uploading={false} />);
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/בחירת תמונה/i) as HTMLInputElement;
    await userEvent.upload(input, file);
    expect(onFileSelected).toHaveBeenCalledWith(file);
  });

  it('shows uploading state', () => {
    render(<PhotoUpload photoUrl={null} onFileSelected={vi.fn()} uploading />);
    expect(screen.getByText(/מעלה/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Verify failure + Implement PhotoUpload**

Run test, verify FAIL. Then create `src/features/players/PhotoUpload.tsx`:

```tsx
import { useRef } from 'react';
import { Upload, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  photoUrl: string | null;
  onFileSelected: (file: File) => void;
  uploading: boolean;
}

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ACCEPTED = 'image/png,image/jpeg,image/webp';

const PhotoUpload = ({ photoUrl, onFileSelected, uploading }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_BYTES) {
      alert('קובץ גדול מדי. גודל מקסימלי: 2MB');
      return;
    }
    onFileSelected(file);
  };

  return (
    <div className="flex items-center gap-4" dir="rtl">
      <div className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
        {photoUrl ? (
          <img src={photoUrl} alt="תמונה של השחקנית" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center text-gray-400 text-xs">
            <User className="w-8 h-8 mx-auto mb-1" />
            <span>בחרי תמונה</span>
          </div>
        )}
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={handleChange}
          className="sr-only"
          aria-label="בחירת תמונה"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="w-4 h-4 ml-2" />
          {uploading ? 'מעלה...' : photoUrl ? 'החלף תמונה' : 'העלה תמונה'}
        </Button>
        <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP · עד 2MB</p>
      </div>
    </div>
  );
};

export default PhotoUpload;
```

- [ ] **Step 3: Write CountrySelect test**

Create `src/features/players/CountrySelect.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CountrySelect from './CountrySelect';

describe('CountrySelect', () => {
  it('renders selected country', () => {
    render(<CountrySelect value="IL" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('ישראל')).toBeInTheDocument();
  });

  it('renders empty placeholder when value is null', () => {
    render(<CountrySelect value={null} onChange={vi.fn()} placeholder="בחר מדינה" />);
    expect(screen.getByPlaceholderText('בחר מדינה')).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Implement CountrySelect**

Create `src/features/players/CountrySelect.tsx`:

We need a searchable dropdown. shadcn doesn't ship a "Combobox" by default, but we can build a simple input + dropdown using local state.

```tsx
import { useMemo, useRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Check, ChevronDown } from 'lucide-react';
import { getAllCountries, getCountryName } from '@/lib/countries';

interface Props {
  value: string | null;
  onChange: (code: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

const CountrySelect = ({ value, onChange, placeholder = 'בחרי מדינה', disabled, id }: Props) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string>(getCountryName(value) ?? '');
  const containerRef = useRef<HTMLDivElement>(null);

  const all = useMemo(() => getAllCountries(), []);
  const filtered = useMemo(() => {
    if (!open) return [];
    const q = query.trim();
    if (!q) return all;
    return all.filter((c) => c.name.includes(q));
  }, [all, open, query]);

  // Sync query when external value changes
  useEffect(() => {
    setQuery(getCountryName(value) ?? '');
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(getCountryName(value) ?? '');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, value]);

  const select = (code: string) => {
    onChange(code);
    setQuery(getCountryName(code) ?? '');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative" dir="rtl">
      <Input
        id={id}
        value={query}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
      />
      <ChevronDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-white border rounded-lg shadow-md py-1">
          {filtered.map((c) => (
            <button
              key={c.code}
              type="button"
              className="flex items-center justify-between w-full px-3 py-1.5 text-sm hover:bg-gray-100 text-right"
              onClick={() => select(c.code)}
            >
              <span>{c.name}</span>
              {c.code === value && <Check className="w-4 h-4 text-orange-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountrySelect;
```

- [ ] **Step 5: Run tests**

```bash
npm test -- --run src/features/players/PhotoUpload.test.tsx src/features/players/CountrySelect.test.tsx
```

Expected: 6 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/features/players/
git commit -m "feat(players): add PhotoUpload and CountrySelect components"
```

---

### Task 6: PlayersFilters + PlayersTable (TDD)

**Files:**
- Create: `src/features/players/PlayersFilters.tsx`
- Create: `src/features/players/PlayersFilters.test.tsx`
- Create: `src/features/players/PlayersTable.tsx`
- Create: `src/features/players/PlayersTable.test.tsx`

- [ ] **Step 1: Write PlayersFilters test**

Create `src/features/players/PlayersFilters.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlayersFilters from './PlayersFilters';

const teams = [{ id: 't1', name: 'מכבי רמת גן' }];
const seasons = [{ id: 's1', name: '2025/26', status: 'active' as const }];

const baseFilters = {
  search: '',
  season_id: null,
  team_id: null,
  position: null,
  classification: null,
  status: null,
  nationality: null,
};

describe('PlayersFilters', () => {
  it('renders search input', () => {
    render(<PlayersFilters filters={baseFilters} onChange={vi.fn()} teams={teams} seasons={seasons} />);
    expect(screen.getByPlaceholderText(/חיפוש/i)).toBeInTheDocument();
  });

  it('calls onChange when search typed', async () => {
    const onChange = vi.fn();
    render(<PlayersFilters filters={baseFilters} onChange={onChange} teams={teams} seasons={seasons} />);
    await userEvent.type(screen.getByPlaceholderText(/חיפוש/i), 'דנה');
    expect(onChange).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Implement PlayersFilters**

Create `src/features/players/PlayersFilters.tsx`:

```tsx
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import CountrySelect from './CountrySelect';
import type { PlayerFilters } from './players.types';
import type { PlayerPosition, PlayerStatus, PlayerClassification } from '@/types/database.types';

interface TeamOpt { id: string; name: string }
interface SeasonOpt { id: string; name: string; status: 'future' | 'active' | 'ended' }

interface Props {
  filters: PlayerFilters;
  onChange: (next: PlayerFilters) => void;
  teams: TeamOpt[];
  seasons: SeasonOpt[];
}

const POSITION_LABELS: Record<PlayerPosition, string> = {
  point_guard: 'גארד מוביל',
  shooting_guard: 'שוטינג גארד',
  small_forward: 'חלוצה קלה',
  power_forward: 'חלוצה כבדה',
  center: 'מרכזת',
};

const STATUS_LABELS: Record<PlayerStatus, string> = {
  active: 'פעילה',
  injured: 'פצועה',
  college: 'מכללה',
  youth: 'צעירה',
  inactive: 'לא פעילה',
  other: 'אחר',
};

const CLASSIFICATION_LABELS: Record<PlayerClassification, string> = {
  israeli: 'ישראלית',
  naturalized: 'מתאזרחת',
  foreign: 'זרה',
  bosman: 'בוסמנית',
};

const ALL = '__all__';

const PlayersFilters = ({ filters, onChange, teams, seasons }: Props) => {
  const set = <K extends keyof PlayerFilters>(key: K, value: PlayerFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3" dir="rtl">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder="חיפוש לפי שם..."
          className="pr-9"
        />
      </div>

      <Select value={filters.season_id ?? ALL} onValueChange={(v) => set('season_id', v === ALL ? null : v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="עונה" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>עונה פעילה</SelectItem>
          {seasons.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.team_id ?? ALL} onValueChange={(v) => set('team_id', v === ALL ? null : v)}>
        <SelectTrigger className="w-44"><SelectValue placeholder="קבוצה" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>כל הקבוצות</SelectItem>
          {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.position ?? ALL} onValueChange={(v) => set('position', v === ALL ? null : v as PlayerPosition)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="עמדה" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>כל העמדות</SelectItem>
          {Object.entries(POSITION_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.classification ?? ALL} onValueChange={(v) => set('classification', v === ALL ? null : v as PlayerClassification)}>
        <SelectTrigger className="w-32"><SelectValue placeholder="סיווג" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>כל הסיווגים</SelectItem>
          {Object.entries(CLASSIFICATION_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.status ?? ALL} onValueChange={(v) => set('status', v === ALL ? null : v as PlayerStatus)}>
        <SelectTrigger className="w-32"><SelectValue placeholder="סטטוס" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>כל הסטטוסים</SelectItem>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="w-44">
        <CountrySelect value={filters.nationality} onChange={(v) => set('nationality', v)} placeholder="לאום" />
      </div>
    </div>
  );
};

export default PlayersFilters;
```

- [ ] **Step 3: Write PlayersTable test**

Create `src/features/players/PlayersTable.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PlayersTable from './PlayersTable';

const players = [
  {
    id: 'p1', first_name: 'ספרקל', last_name: 'טיילור',
    birth_date: '1996-05-15', nationality: 'US', country_of_origin: 'US',
    height: 180, position: 'small_forward' as const, status: 'active' as const,
    classification: 'foreign' as const, photo: null,
    current_team_id: 't1', current_team_name: 'בנות פתח תקווה', current_jersey_number: 23,
  },
];

describe('PlayersTable', () => {
  it('renders players with name, team, jersey and age', () => {
    render(<MemoryRouter><PlayersTable players={players} /></MemoryRouter>);
    expect(screen.getByText('ספרקל טיילור')).toBeInTheDocument();
    expect(screen.getByText('בנות פתח תקווה')).toBeInTheDocument();
    expect(screen.getByText('23')).toBeInTheDocument();
  });

  it('renders empty state when no players', () => {
    render(<MemoryRouter><PlayersTable players={[]} /></MemoryRouter>);
    expect(screen.getByText(/אין שחקניות/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Implement PlayersTable**

Create `src/features/players/PlayersTable.tsx`:

```tsx
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Player } from './players.types';
import type { PlayerPosition, PlayerStatus, PlayerClassification } from '@/types/database.types';
import { getCountryName } from '@/lib/countries';

interface PlayerWithTeam extends Player {
  current_team_id?: string | null;
  current_team_name?: string | null;
  current_jersey_number?: number | null;
}

interface Props {
  players: PlayerWithTeam[];
}

const POSITION_LABELS: Record<PlayerPosition, string> = {
  point_guard: 'גארד מוביל',
  shooting_guard: 'שוטינג גארד',
  small_forward: 'חלוצה קלה',
  power_forward: 'חלוצה כבדה',
  center: 'מרכזת',
};

const STATUS_LABELS: Record<PlayerStatus, string> = {
  active: 'פעילה',
  injured: 'פצועה',
  college: 'מכללה',
  youth: 'צעירה',
  inactive: 'לא פעילה',
  other: 'אחר',
};

const CLASSIFICATION_LABELS: Record<PlayerClassification, string> = {
  israeli: 'ישראלית',
  naturalized: 'מתאזרחת',
  foreign: 'זרה',
  bosman: 'בוסמנית',
};

const calcAge = (birth: string | null): string => {
  if (!birth) return '—';
  const today = new Date();
  const bd = new Date(birth);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return String(age);
};

const initials = (first: string, last: string) => (first[0] ?? '') + (last[0] ?? '');

const PlayersTable = ({ players }: Props) => {
  const navigate = useNavigate();

  if (players.length === 0) {
    return (
      <div className="border border-dashed rounded-lg py-16 text-center text-gray-500" dir="rtl">
        אין שחקניות במערכת. הוסיפי שחקנית חדשה.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden" dir="rtl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right w-12"></TableHead>
            <TableHead className="text-right">שם</TableHead>
            <TableHead className="text-right">קבוצה</TableHead>
            <TableHead className="text-right">עמדה</TableHead>
            <TableHead className="text-right">מס׳</TableHead>
            <TableHead className="text-right">גיל</TableHead>
            <TableHead className="text-right">גובה</TableHead>
            <TableHead className="text-right">לאום</TableHead>
            <TableHead className="text-right">סיווג</TableHead>
            <TableHead className="text-right">סטטוס</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((p) => (
            <TableRow
              key={p.id}
              className="cursor-pointer"
              onClick={() => navigate(`/players/${p.id}`)}
            >
              <TableCell>
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {p.photo
                    ? <img src={p.photo} alt={`${p.first_name} ${p.last_name}`} className="w-full h-full object-cover" />
                    : <span className="text-xs font-bold text-gray-500">{initials(p.first_name, p.last_name)}</span>
                  }
                </div>
              </TableCell>
              <TableCell className="font-semibold">{p.first_name} {p.last_name}</TableCell>
              <TableCell className="text-gray-700">{p.current_team_name ?? '—'}</TableCell>
              <TableCell>{p.position ? POSITION_LABELS[p.position] : '—'}</TableCell>
              <TableCell className="tabular-nums">{p.current_jersey_number ?? '—'}</TableCell>
              <TableCell className="tabular-nums">{calcAge(p.birth_date)}</TableCell>
              <TableCell className="tabular-nums">{p.height ?? '—'}</TableCell>
              <TableCell>{getCountryName(p.nationality) ?? '—'}</TableCell>
              <TableCell><Badge variant="outline">{CLASSIFICATION_LABELS[p.classification]}</Badge></TableCell>
              <TableCell><Badge variant="outline">{STATUS_LABELS[p.status]}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PlayersTable;
```

- [ ] **Step 5: Run tests**

```bash
npm test -- --run src/features/players/PlayersTable.test.tsx src/features/players/PlayersFilters.test.tsx
```

Expected: 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/features/players/
git commit -m "feat(players): add PlayersFilters and PlayersTable"
```

---

### Task 7: PlayerForm shared component (TDD)

**Files:**
- Create: `src/features/players/PlayerForm.tsx`
- Create: `src/features/players/PlayerForm.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/features/players/PlayerForm.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlayerForm from './PlayerForm';

const teams = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'מכבי רמת גן' },
];

describe('PlayerForm', () => {
  it('renders empty form in create mode', () => {
    render(
      <PlayerForm
        mode="create"
        initial={null}
        onSubmit={vi.fn()}
        onPhotoUpload={vi.fn()}
        submitting={false}
        uploading={false}
        submitLabel="צור שחקנית"
        teams={teams}
      />
    );
    expect(screen.getByLabelText(/שם פרטי/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /צור שחקנית/i })).toBeInTheDocument();
  });

  it('shows team selector in create mode', () => {
    render(
      <PlayerForm
        mode="create"
        initial={null}
        onSubmit={vi.fn()}
        onPhotoUpload={vi.fn()}
        submitting={false}
        uploading={false}
        submitLabel="צור שחקנית"
        teams={teams}
      />
    );
    expect(screen.getByText(/שיוך לקבוצה/i)).toBeInTheDocument();
  });

  it('hides team selector in edit mode', () => {
    render(
      <PlayerForm
        mode="edit"
        initial={{
          id: 'p1', first_name: 'דנה', last_name: 'כהן',
          birth_date: null, nationality: null, country_of_origin: null,
          height: null, position: null, status: 'active',
          classification: 'israeli', photo: null,
        }}
        onSubmit={vi.fn()}
        onPhotoUpload={vi.fn()}
        submitting={false}
        uploading={false}
        submitLabel="שמירה"
        teams={teams}
      />
    );
    expect(screen.queryByText(/שיוך לקבוצה/i)).not.toBeInTheDocument();
  });

  it('shows validation error for empty first_name', async () => {
    render(
      <PlayerForm
        mode="create"
        initial={null}
        onSubmit={vi.fn()}
        onPhotoUpload={vi.fn()}
        submitting={false}
        uploading={false}
        submitLabel="צור שחקנית"
        teams={teams}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /צור שחקנית/i }));
    expect(await screen.findByText(/שם פרטי הוא שדה חובה/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Implement PlayerForm**

Create `src/features/players/PlayerForm.tsx`:

```tsx
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import PhotoUpload from './PhotoUpload';
import CountrySelect from './CountrySelect';
import { playerSchema, newPlayerSchema, type PlayerFormValues, type NewPlayerFormValues } from './players.schema';
import type { Player, PlayerInput } from './players.types';

type Mode = 'create' | 'edit';

interface TeamOpt { id: string; name: string }

interface Props {
  mode: Mode;
  initial: Player | null;
  onSubmit: (input: PlayerInput | (PlayerInput & { team_id: string; jersey_number: number | null })) => void | Promise<void>;
  onPhotoUpload: (file: File) => Promise<string>;
  submitting: boolean;
  uploading: boolean;
  submitLabel: string;
  teams: TeamOpt[];
  onCancel?: () => void;
  readOnly?: boolean;
  onEdit?: () => void;
}

const DEFAULTS: PlayerFormValues = {
  first_name: '', last_name: '',
  birth_date: null, nationality: null, country_of_origin: null,
  height: null, position: null, status: 'active', classification: 'israeli', photo: null,
};

const fillDefaults = (p: Player | null): PlayerFormValues => {
  if (!p) return DEFAULTS;
  return {
    first_name: p.first_name,
    last_name: p.last_name,
    birth_date: p.birth_date,
    nationality: p.nationality,
    country_of_origin: p.country_of_origin,
    height: p.height,
    position: p.position,
    status: p.status,
    classification: p.classification,
    photo: p.photo,
  };
};

const cleanString = (v: string | null): string | null => {
  const t = (v ?? '').trim();
  return t === '' ? null : t;
};

const PlayerForm = ({
  mode, initial, onSubmit, onPhotoUpload, submitting, uploading,
  submitLabel, teams, onCancel, readOnly = false, onEdit,
}: Props) => {
  type FormValues = PlayerFormValues & { team_id?: string; jersey_number?: number | null };

  const isCreate = mode === 'create';
  const schema = isCreate ? newPlayerSchema : playerSchema;

  const {
    register, handleSubmit, control, reset, watch, setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: isCreate
      ? { ...DEFAULTS, team_id: '', jersey_number: null }
      : fillDefaults(initial),
  });

  useEffect(() => {
    if (isCreate) {
      reset({ ...DEFAULTS, team_id: '', jersey_number: null } as FormValues);
    } else {
      reset(fillDefaults(initial) as FormValues);
    }
  }, [initial, reset, isCreate]);

  const submit = handleSubmit(async (values) => {
    const cleaned: PlayerInput = {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      birth_date: cleanString(values.birth_date),
      nationality: cleanString(values.nationality),
      country_of_origin: cleanString(values.country_of_origin),
      height: values.height ?? null,
      position: values.position ?? null,
      status: values.status,
      classification: values.classification,
      photo: cleanString(values.photo),
    };
    if (isCreate) {
      const v = values as NewPlayerFormValues;
      await onSubmit({ ...cleaned, team_id: v.team_id, jersey_number: v.jersey_number ?? null });
    } else {
      await onSubmit(cleaned);
    }
  });

  const handlePhotoFile = async (file: File) => {
    const url = await onPhotoUpload(file);
    setValue('photo', url, { shouldDirty: true });
  };

  // For age display
  const birthDate = watch('birth_date');
  const computedAge = (() => {
    if (!birthDate) return '';
    const today = new Date();
    const bd = new Date(birthDate);
    let age = today.getFullYear() - bd.getFullYear();
    const m = today.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
    return Number.isFinite(age) ? String(age) : '';
  })();

  return (
    <form onSubmit={submit} className="space-y-8" dir="rtl">
      <fieldset disabled={readOnly} className="space-y-8 disabled:opacity-90">
        {/* פרטים אישיים */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">פרטים אישיים</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="first_name">שם פרטי</Label>
              <Input id="first_name" {...register('first_name')} placeholder="ספרקל" />
              {errors.first_name && <p className="text-red-500 text-xs">{(errors.first_name as { message?: string }).message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="last_name">שם משפחה</Label>
              <Input id="last_name" {...register('last_name')} placeholder="טיילור" />
              {errors.last_name && <p className="text-red-500 text-xs">{(errors.last_name as { message?: string }).message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="birth_date">תאריך לידה</Label>
              <Input id="birth_date" type="date" {...register('birth_date')} />
            </div>
            <div className="space-y-1">
              <Label>גיל</Label>
              <Input value={computedAge} readOnly tabIndex={-1} className="bg-gray-50" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="height">גובה (ס"מ)</Label>
              <Input
                id="height"
                type="number"
                {...register('height', { setValueAs: (v) => (v === '' || v == null ? null : Number(v)) })}
                placeholder="180"
              />
              {errors.height && <p className="text-red-500 text-xs">{(errors.height as { message?: string }).message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label>תמונה</Label>
            <PhotoUpload
              photoUrl={watch('photo') ?? null}
              onFileSelected={handlePhotoFile}
              uploading={uploading}
            />
          </div>
        </section>

        {/* שיוך וזהות */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">שיוך וזהות</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="nationality">לאום</Label>
              <Controller
                control={control}
                name="nationality"
                render={({ field }) => (
                  <CountrySelect id="nationality" value={field.value ?? null} onChange={field.onChange} placeholder="בחרי מדינה" />
                )}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="country_of_origin">ארץ מוצא</Label>
              <Controller
                control={control}
                name="country_of_origin"
                render={({ field }) => (
                  <CountrySelect id="country_of_origin" value={field.value ?? null} onChange={field.onChange} placeholder="בחרי מדינה" />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="classification">סיווג</Label>
              <Controller
                control={control}
                name="classification"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="classification"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="israeli">ישראלית</SelectItem>
                      <SelectItem value="naturalized">מתאזרחת</SelectItem>
                      <SelectItem value="foreign">זרה</SelectItem>
                      <SelectItem value="bosman">בוסמנית</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="position">עמדה</Label>
              <Controller
                control={control}
                name="position"
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                    <SelectTrigger id="position"><SelectValue placeholder="בחרי" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="point_guard">גארד מוביל</SelectItem>
                      <SelectItem value="shooting_guard">שוטינג גארד</SelectItem>
                      <SelectItem value="small_forward">חלוצה קלה</SelectItem>
                      <SelectItem value="power_forward">חלוצה כבדה</SelectItem>
                      <SelectItem value="center">מרכזת</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="status">סטטוס</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">פעילה</SelectItem>
                      <SelectItem value="injured">פצועה</SelectItem>
                      <SelectItem value="college">מכללה</SelectItem>
                      <SelectItem value="youth">צעירה</SelectItem>
                      <SelectItem value="inactive">לא פעילה</SelectItem>
                      <SelectItem value="other">אחר</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </section>

        {isCreate && (
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">שיוך לקבוצה (עונה פעילה)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="team_id">קבוצה</Label>
                <Controller
                  control={control}
                  name="team_id"
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger id="team_id"><SelectValue placeholder="בחרי קבוצה" /></SelectTrigger>
                      <SelectContent>
                        {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {(errors as { team_id?: { message?: string } }).team_id && (
                  <p className="text-red-500 text-xs">{(errors as { team_id?: { message?: string } }).team_id?.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="jersey_number">מספר חולצה</Label>
                <Input
                  id="jersey_number"
                  type="number"
                  {...register('jersey_number', { setValueAs: (v) => (v === '' || v == null ? null : Number(v)) })}
                  placeholder="23"
                />
                {(errors as { jersey_number?: { message?: string } }).jersey_number && (
                  <p className="text-red-500 text-xs">{(errors as { jersey_number?: { message?: string } }).jersey_number?.message}</p>
                )}
              </div>
            </div>
          </section>
        )}
      </fieldset>

      <div className="flex justify-end gap-2 pt-4 border-t">
        {readOnly ? (
          onEdit && (
            <Button type="button" onClick={onEdit}>
              ערוך
            </Button>
          )
        ) : (
          <>
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                ביטול
              </Button>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'שומר...' : submitLabel}
            </Button>
          </>
        )}
      </div>
    </form>
  );
};

export default PlayerForm;
```

- [ ] **Step 3: Run tests**

```bash
npm test -- --run src/features/players/PlayerForm.test.tsx
```

Expected: 4 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/features/players/
git commit -m "feat(players): add shared PlayerForm component"
```

---

### Task 8: PlayerHeader + DeletePlayerDialog (TDD)

**Files:**
- Create: `src/features/players/PlayerHeader.tsx`
- Create: `src/features/players/PlayerHeader.test.tsx`
- Create: `src/features/players/DeletePlayerDialog.tsx`
- Create: `src/features/players/DeletePlayerDialog.test.tsx`

- [ ] **Step 1: PlayerHeader test**

Create `src/features/players/PlayerHeader.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlayerHeader from './PlayerHeader';

const player = {
  id: 'p1', first_name: 'ספרקל', last_name: 'טיילור',
  birth_date: '1996-05-15', nationality: 'US', country_of_origin: 'US',
  height: 180, position: 'small_forward' as const, status: 'active' as const,
  classification: 'foreign' as const, photo: null,
};

describe('PlayerHeader', () => {
  it('renders name and meta line', () => {
    render(<PlayerHeader player={player} teamName="ב. פ"ת" jerseyNumber={23} onDelete={vi.fn()} />);
    expect(screen.getByText(/ספרקל טיילור/)).toBeInTheDocument();
    expect(screen.getByText(/חלוצה קלה/)).toBeInTheDocument();
  });

  it('opens delete from menu', async () => {
    const onDelete = vi.fn();
    render(<PlayerHeader player={player} teamName={null} jerseyNumber={null} onDelete={onDelete} />);
    await userEvent.click(screen.getByLabelText(/פעולות/i));
    await userEvent.click(screen.getByRole('menuitem', { name: /מחק שחקנית/i }));
    expect(onDelete).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Implement PlayerHeader**

Create `src/features/players/PlayerHeader.tsx`:

```tsx
import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
import type { Player } from './players.types';
import type { PlayerPosition, PlayerClassification } from '@/types/database.types';
import { getCountryName } from '@/lib/countries';

interface Props {
  player: Player;
  teamName: string | null;
  jerseyNumber: number | null;
  onDelete: () => void;
}

const POSITION_LABELS: Record<PlayerPosition, string> = {
  point_guard: 'גארד מוביל',
  shooting_guard: 'שוטינג גארד',
  small_forward: 'חלוצה קלה',
  power_forward: 'חלוצה כבדה',
  center: 'מרכזת',
};

const CLASSIFICATION_LABELS: Record<PlayerClassification, string> = {
  israeli: 'ישראלית',
  naturalized: 'מתאזרחת',
  foreign: 'זרה',
  bosman: 'בוסמנית',
};

const calcAge = (birth: string | null): string | null => {
  if (!birth) return null;
  const today = new Date();
  const bd = new Date(birth);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return String(age);
};

const initials = (first: string, last: string) => (first[0] ?? '') + (last[0] ?? '');

const PlayerHeader = ({ player, teamName, jerseyNumber, onDelete }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const age = calcAge(player.birth_date);
  const nationalityName = getCountryName(player.nationality);

  const metaParts = [
    teamName,
    jerseyNumber != null ? `#${jerseyNumber}` : null,
    player.position ? POSITION_LABELS[player.position] : null,
    age ? `גיל ${age}` : null,
  ].filter(Boolean);

  const subParts = [
    CLASSIFICATION_LABELS[player.classification],
    nationalityName,
  ].filter(Boolean);

  return (
    <div className="flex items-start gap-4 bg-white rounded-lg border p-6" dir="rtl">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
        {player.photo
          ? <img src={player.photo} alt={`${player.first_name} ${player.last_name}`} className="w-full h-full object-cover" />
          : <span className="text-2xl font-bold text-gray-500">{initials(player.first_name, player.last_name)}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold leading-tight">{player.first_name} {player.last_name}</h1>
        {metaParts.length > 0 && (
          <div className="text-gray-600 text-sm mt-1">{metaParts.join(' · ')}</div>
        )}
        {subParts.length > 0 && (
          <div className="text-gray-500 text-sm mt-0.5">{subParts.join(' · ')}</div>
        )}
      </div>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="פעולות"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="inline-flex items-center justify-center rounded-lg p-1.5 hover:bg-muted transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        {menuOpen && (
          <div
            role="menu"
            className="absolute left-0 mt-1 w-44 bg-white border rounded-lg shadow-md py-1 z-50"
            dir="rtl"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => { setMenuOpen(false); onDelete(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-right"
            >
              <Trash2 className="w-4 h-4" />
              מחק שחקנית
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerHeader;
```

- [ ] **Step 3: DeletePlayerDialog test**

Create `src/features/players/DeletePlayerDialog.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeletePlayerDialog from './DeletePlayerDialog';

const player = {
  id: 'p1', first_name: 'ספרקל', last_name: 'טיילור',
  birth_date: null, nationality: null, country_of_origin: null,
  height: null, position: null, status: 'active' as const,
  classification: 'foreign' as const, photo: null,
};

describe('DeletePlayerDialog', () => {
  it('shows player name in confirmation', () => {
    render(
      <DeletePlayerDialog open onOpenChange={vi.fn()} player={player} statsCount={0} onConfirm={vi.fn()} deleting={false} />
    );
    expect(screen.getByText(/ספרקל טיילור/)).toBeInTheDocument();
  });

  it('blocks deletion when stats exist', () => {
    render(
      <DeletePlayerDialog open onOpenChange={vi.fn()} player={player} statsCount={5} onConfirm={vi.fn()} deleting={false} />
    );
    expect(screen.getByText(/לא ניתן למחוק/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^מחיקה$/i })).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirmed', async () => {
    const onConfirm = vi.fn();
    render(
      <DeletePlayerDialog open onOpenChange={vi.fn()} player={player} statsCount={0} onConfirm={onConfirm} deleting={false} />
    );
    await userEvent.click(screen.getByRole('button', { name: /^מחיקה$/i }));
    expect(onConfirm).toHaveBeenCalled();
  });
});
```

- [ ] **Step 4: Implement DeletePlayerDialog**

Create `src/features/players/DeletePlayerDialog.tsx`:

```tsx
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Player } from './players.types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player | null;
  statsCount: number;
  onConfirm: () => void;
  deleting: boolean;
}

const DeletePlayerDialog = ({ open, onOpenChange, player, statsCount, onConfirm, deleting }: Props) => {
  if (!player) return null;
  const blocked = statsCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {blocked ? 'לא ניתן למחוק שחקנית' : `למחוק את ${player.first_name} ${player.last_name}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {blocked
              ? `יש ${statsCount} סטטיסטיקות משחקים מקושרות. השתמשי ב"הסר מהעונה" במקום זאת כדי לשמר את ההיסטוריה.`
              : 'פעולה זו לא ניתנת לביטול. כל נתוני השחקנית יימחקו.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel>ביטול</AlertDialogCancel>
          {!blocked && (
            <AlertDialogAction
              onClick={onConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'מוחק...' : 'מחיקה'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePlayerDialog;
```

- [ ] **Step 5: Run tests, commit**

```bash
npm test -- --run src/features/players/PlayerHeader.test.tsx src/features/players/DeletePlayerDialog.test.tsx
git add src/features/players/
git commit -m "feat(players): add PlayerHeader and DeletePlayerDialog"
```

---

### Task 9: Season-history components (TDD)

**Files:**
- Create: `src/features/players/PlayerSeasonsTable.tsx`
- Create: `src/features/players/PlayerSeasonsTable.test.tsx`
- Create: `src/features/players/AddPlayerSeasonDialog.tsx`
- Create: `src/features/players/EditJerseyDialog.tsx`
- Create: `src/features/players/RemovePlayerSeasonDialog.tsx`

- [ ] **Step 1: PlayerSeasonsTable test**

Create `src/features/players/PlayerSeasonsTable.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlayerSeasonsTable from './PlayerSeasonsTable';

const rows = [
  {
    team_id: 't1', season_id: 's1', jersey_number: 23,
    teams: { id: 't1', name: 'ב. פ"ת' },
    seasons: { id: 's1', name: '2025/26', status: 'active', start_date: '2025-10-01' },
  },
];

describe('PlayerSeasonsTable', () => {
  it('renders rows', () => {
    render(<PlayerSeasonsTable rows={rows} onEditJersey={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText('2025/26')).toBeInTheDocument();
    expect(screen.getByText('ב. פ"ת')).toBeInTheDocument();
    expect(screen.getByText('23')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(<PlayerSeasonsTable rows={[]} onEditJersey={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText(/אין היסטוריה/i)).toBeInTheDocument();
  });

  it('calls onRemove when remove clicked', async () => {
    const onRemove = vi.fn();
    render(<PlayerSeasonsTable rows={rows} onEditJersey={vi.fn()} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: /הסר/i }));
    expect(onRemove).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Implement PlayerSeasonsTable**

Create `src/features/players/PlayerSeasonsTable.tsx`:

```tsx
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Row {
  team_id: string;
  season_id: string;
  jersey_number: number | null;
  teams: { id: string; name: string } | null;
  seasons: { id: string; name: string; status: string; start_date: string } | null;
}

interface Props {
  rows: Row[];
  onEditJersey: (row: Row) => void;
  onRemove: (row: Row) => void;
}

const STATUS_LABEL: Record<string, string> = {
  active: 'פעילה',
  future: 'עתידית',
  ended: 'הסתיימה',
};

const PlayerSeasonsTable = ({ rows, onEditJersey, onRemove }: Props) => {
  if (rows.length === 0) {
    return (
      <div className="border border-dashed rounded-lg py-12 text-center text-gray-500" dir="rtl">
        אין היסטוריה במערכת לשחקנית זו.
      </div>
    );
  }
  return (
    <div className="border rounded-lg overflow-hidden" dir="rtl">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">עונה</th>
            <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">קבוצה</th>
            <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">מספר</th>
            <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">סטטוס</th>
            <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 w-44">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.team_id}-${r.season_id}`} className="border-t">
              <td className="px-4 py-3 font-semibold">{r.seasons?.name ?? '—'}</td>
              <td className="px-4 py-3">{r.teams?.name ?? '—'}</td>
              <td className="px-4 py-3 tabular-nums">{r.jersey_number ?? '—'}</td>
              <td className="px-4 py-3">
                <Badge variant="outline">{STATUS_LABEL[r.seasons?.status ?? ''] ?? '—'}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEditJersey(r)}>
                    <Pencil className="w-4 h-4 ml-1" /> ערוך מספר
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onRemove(r)} className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4 ml-1" /> הסר
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerSeasonsTable;
```

- [ ] **Step 3: Implement AddPlayerSeasonDialog**

Create `src/features/players/AddPlayerSeasonDialog.tsx`:

```tsx
import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Opt { id: string; name: string }

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableSeasons: Opt[];
  teams: Opt[];
  onConfirm: (input: { season_id: string; team_id: string; jersey_number: number | null }) => void | Promise<void>;
  saving: boolean;
}

const AddPlayerSeasonDialog = ({ open, onOpenChange, availableSeasons, teams, onConfirm, saving }: Props) => {
  const [seasonId, setSeasonId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [jersey, setJersey] = useState<string>('');

  useEffect(() => {
    if (open) {
      setSeasonId('');
      setTeamId('');
      setJersey('');
    }
  }, [open]);

  const canSubmit = !!seasonId && !!teamId && !saving;

  const submit = async () => {
    if (!canSubmit) return;
    const num = jersey === '' ? null : Number(jersey);
    await onConfirm({ season_id: seasonId, team_id: teamId, jersey_number: num });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>הוסף לעונה</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>עונה</Label>
            <Select value={seasonId} onValueChange={setSeasonId}>
              <SelectTrigger><SelectValue placeholder="בחרי עונה" /></SelectTrigger>
              <SelectContent>
                {availableSeasons.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>קבוצה</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger><SelectValue placeholder="בחרי קבוצה" /></SelectTrigger>
              <SelectContent>
                {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>מספר חולצה</Label>
            <Input type="number" min={0} max={99} value={jersey} onChange={(e) => setJersey(e.target.value)} placeholder="23" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>ביטול</Button>
          <Button type="button" disabled={!canSubmit} onClick={submit}>
            {saving ? 'שומר...' : 'הוסף'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlayerSeasonDialog;
```

- [ ] **Step 4: Implement EditJerseyDialog**

Create `src/features/players/EditJerseyDialog.tsx`:

```tsx
import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialJersey: number | null;
  seasonName: string;
  onConfirm: (jersey: number | null) => void | Promise<void>;
  saving: boolean;
}

const EditJerseyDialog = ({ open, onOpenChange, initialJersey, seasonName, onConfirm, saving }: Props) => {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (open) setValue(initialJersey == null ? '' : String(initialJersey));
  }, [open, initialJersey]);

  const submit = async () => {
    const n = value === '' ? null : Number(value);
    if (n != null && (n < 0 || n > 99)) {
      alert('מספר חולצה חייב להיות 0-99');
      return;
    }
    await onConfirm(n);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>עריכת מספר חולצה — {seasonName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          <Label htmlFor="jersey">מספר חולצה</Label>
          <Input id="jersey" type="number" min={0} max={99} value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>ביטול</Button>
          <Button type="button" disabled={saving} onClick={submit}>
            {saving ? 'שומר...' : 'שמירה'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditJerseyDialog;
```

- [ ] **Step 5: Implement RemovePlayerSeasonDialog**

Create `src/features/players/RemovePlayerSeasonDialog.tsx`:

```tsx
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seasonName: string;
  teamName: string;
  statsCount: number;
  onConfirm: () => void;
  removing: boolean;
}

const RemovePlayerSeasonDialog = ({ open, onOpenChange, seasonName, teamName, statsCount, onConfirm, removing }: Props) => {
  const blocked = statsCount > 0;
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {blocked ? 'לא ניתן להסיר מהעונה' : `להסיר מ${teamName} בעונה ${seasonName}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {blocked
              ? `יש ${statsCount} סטטיסטיקות משחקים בעונה זו. מחקי קודם את הסטטיסטיקות הקשורות.`
              : 'הקישור לעונה יוסר. נתוני השחקנית עצמם יישמרו.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel>ביטול</AlertDialogCancel>
          {!blocked && (
            <AlertDialogAction onClick={onConfirm} disabled={removing}>
              {removing ? 'מסיר...' : 'הסר מהעונה'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemovePlayerSeasonDialog;
```

- [ ] **Step 6: Run tests, commit**

```bash
npm test -- --run src/features/players/PlayerSeasonsTable.test.tsx
git add src/features/players/
git commit -m "feat(players): add season history components"
```

---

### Task 10: PlayersListPage

**Files:**
- Create: `src/pages/PlayersListPage.tsx`

- [ ] **Step 1: Implement page**

Create `src/pages/PlayersListPage.tsx`:

```tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeams } from '@/features/teams/teams.queries';
import { useSeasons } from '@/features/seasons/seasons.queries';
import { usePlayers } from '@/features/players/players.queries';
import PlayersFilters from '@/features/players/PlayersFilters';
import PlayersTable from '@/features/players/PlayersTable';
import type { PlayerFilters } from '@/features/players/players.types';

const DEFAULT_FILTERS: PlayerFilters = {
  search: '',
  season_id: null,
  team_id: null,
  position: null,
  classification: null,
  status: null,
  nationality: null,
};

const PlayersListPage = () => {
  const [filters, setFilters] = useState<PlayerFilters>(DEFAULT_FILTERS);
  const playersQ = usePlayers(filters);
  const teamsQ = useTeams('all');
  const seasonsQ = useSeasons();

  const teams = useMemo(() => (teamsQ.data ?? []).map((t) => ({ id: t.id, name: t.name })), [teamsQ.data]);
  const seasons = useMemo(
    () => (seasonsQ.data ?? []).map((s) => ({ id: s.id, name: s.name, status: s.status })),
    [seasonsQ.data]
  );

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">שחקניות</h1>
        <Button asChild>
          <Link to="/players/new">
            <Plus className="w-4 h-4 ml-1" />
            הוסף שחקנית
          </Link>
        </Button>
      </div>

      <PlayersFilters filters={filters} onChange={setFilters} teams={teams} seasons={seasons} />

      {playersQ.isLoading && <div className="text-gray-500">טוען...</div>}
      {playersQ.error && (
        <div className="text-red-600 bg-red-50 p-4 rounded">
          שגיאה בטעינת השחקניות. נסי לרענן את הדף.
        </div>
      )}
      {playersQ.data && <PlayersTable players={playersQ.data} />}
    </div>
  );
};

export default PlayersListPage;
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit -p tsconfig.app.json
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/PlayersListPage.tsx
git commit -m "feat(players): add PlayersListPage"
```

---

### Task 11: NewPlayerPage

**Files:**
- Create: `src/pages/NewPlayerPage.tsx`

- [ ] **Step 1: Implement page**

Create `src/pages/NewPlayerPage.tsx`:

```tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PlayerForm from '@/features/players/PlayerForm';
import { useCreatePlayer, useUploadPlayerPhoto } from '@/features/players/players.queries';
import { useTeams } from '@/features/teams/teams.queries';
import type { PlayerInput } from '@/features/players/players.types';

const NewPlayerPage = () => {
  const navigate = useNavigate();
  const createM = useCreatePlayer();
  const uploadM = useUploadPlayerPhoto();
  const teamsQ = useTeams('all');
  const [tempId] = useState(() => crypto.randomUUID());

  const handleSubmit = async (input: PlayerInput | (PlayerInput & { team_id: string; jersey_number: number | null })) => {
    if (!('team_id' in input)) return;
    const player = await createM.mutateAsync(input);
    navigate(`/players/${player.id}`);
  };

  const handlePhotoUpload = async (file: File): Promise<string> => {
    return uploadM.mutateAsync({ playerId: tempId, file });
  };

  return (
    <div dir="rtl" className="max-w-3xl mx-auto space-y-6">
      <Link to="/players" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
        <ArrowRight className="w-4 h-4" />
        חזרה לשחקניות
      </Link>
      <h1 className="text-2xl font-bold">הוספת שחקנית חדשה</h1>
      <div className="bg-white rounded-lg border p-6">
        <PlayerForm
          mode="create"
          initial={null}
          onSubmit={handleSubmit}
          onPhotoUpload={handlePhotoUpload}
          submitting={createM.isPending}
          uploading={uploadM.isPending}
          submitLabel="צור שחקנית"
          teams={(teamsQ.data ?? []).map((t) => ({ id: t.id, name: t.name }))}
          onCancel={() => navigate('/players')}
        />
      </div>
    </div>
  );
};

export default NewPlayerPage;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/NewPlayerPage.tsx
git commit -m "feat(players): add NewPlayerPage"
```

---

### Task 12: PlayerDetailPage with tabs

**Files:**
- Create: `src/pages/PlayerDetailPage.tsx`

- [ ] **Step 1: Implement page**

Create `src/pages/PlayerDetailPage.tsx`:

```tsx
import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PlayerHeader from '@/features/players/PlayerHeader';
import PlayerForm from '@/features/players/PlayerForm';
import PlayerSeasonsTable from '@/features/players/PlayerSeasonsTable';
import DeletePlayerDialog from '@/features/players/DeletePlayerDialog';
import AddPlayerSeasonDialog from '@/features/players/AddPlayerSeasonDialog';
import EditJerseyDialog from '@/features/players/EditJerseyDialog';
import RemovePlayerSeasonDialog from '@/features/players/RemovePlayerSeasonDialog';
import {
  usePlayer, useUpdatePlayer, useDeletePlayer, useUploadPlayerPhoto,
  usePlayerSeasons, useAddPlayerSeason, useUpdatePlayerJersey, useRemovePlayerSeason,
  usePlayerStatsCount,
} from '@/features/players/players.queries';
import { useTeams } from '@/features/teams/teams.queries';
import { useSeasons } from '@/features/seasons/seasons.queries';
import type { PlayerInput } from '@/features/players/players.types';

interface SeasonRow {
  team_id: string;
  season_id: string;
  jersey_number: number | null;
  teams: { id: string; name: string } | null;
  seasons: { id: string; name: string; status: string; start_date: string } | null;
}

const PlayerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const playerQ = usePlayer(id);
  const seasonsRowsQ = usePlayerSeasons(id);
  const teamsQ = useTeams('all');
  const allSeasonsQ = useSeasons();

  const updateM = useUpdatePlayer();
  const deleteM = useDeletePlayer();
  const uploadM = useUploadPlayerPhoto();
  const addSeasonM = useAddPlayerSeason();
  const updateJerseyM = useUpdatePlayerJersey();
  const removeSeasonM = useRemovePlayerSeason();

  const [editingDetails, setEditingDetails] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addingSeason, setAddingSeason] = useState(false);
  const [editingJerseyRow, setEditingJerseyRow] = useState<SeasonRow | null>(null);
  const [removingRow, setRemovingRow] = useState<SeasonRow | null>(null);

  const totalStatsQ = usePlayerStatsCount(id);
  const seasonStatsQ = usePlayerStatsCount(id, removingRow?.season_id);

  const teams = useMemo(() => (teamsQ.data ?? []).map((t) => ({ id: t.id, name: t.name })), [teamsQ.data]);

  if (playerQ.isLoading) return <div className="text-gray-500" dir="rtl">טוען...</div>;
  if (playerQ.error || !playerQ.data) {
    return (
      <div dir="rtl" className="text-red-600 bg-red-50 p-4 rounded">
        שגיאה בטעינת השחקנית. <Link to="/players" className="underline">חזרה לרשימה</Link>
      </div>
    );
  }
  const player = playerQ.data;

  // Find current-season info from rows for header
  const headerRow = (seasonsRowsQ.data ?? []).find((r) => r.seasons?.status === 'active') ?? null;

  const handleSave = async (input: PlayerInput | (PlayerInput & { team_id: string; jersey_number: number | null })) => {
    const stripped: PlayerInput = 'team_id' in input
      ? (() => { const { team_id: _t, jersey_number: _j, ...rest } = input; void _t; void _j; return rest; })()
      : input;
    await updateM.mutateAsync({ id: player.id, input: stripped });
    setEditingDetails(false);
  };

  const handlePhotoUpload = async (file: File): Promise<string> => uploadM.mutateAsync({ playerId: player.id, file });

  const handleDelete = async () => {
    await deleteM.mutateAsync(player.id);
    navigate('/players');
  };

  const playerSeasonIds = new Set((seasonsRowsQ.data ?? []).map((r) => r.season_id));
  const availableSeasons = (allSeasonsQ.data ?? []).filter((s) => !playerSeasonIds.has(s.id));

  return (
    <div dir="rtl" className="space-y-6 max-w-4xl mx-auto">
      <Link to="/players" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
        <ArrowRight className="w-4 h-4" />
        חזרה לשחקניות
      </Link>

      <PlayerHeader
        player={player}
        teamName={headerRow?.teams?.name ?? null}
        jerseyNumber={headerRow?.jersey_number ?? null}
        onDelete={() => setConfirmDelete(true)}
      />

      <Tabs defaultValue="details">
        <TabsList dir="rtl">
          <TabsTrigger value="details">פרטי שחקנית</TabsTrigger>
          <TabsTrigger value="history">היסטוריית קבוצות</TabsTrigger>
          <TabsTrigger value="stats" disabled>סטטיסטיקה (בקרוב)</TabsTrigger>
          <TabsTrigger value="achievements" disabled>תארים (בקרוב)</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="bg-white rounded-lg border p-6">
            <PlayerForm
              mode="edit"
              initial={player}
              onSubmit={handleSave}
              onPhotoUpload={handlePhotoUpload}
              submitting={updateM.isPending}
              uploading={uploadM.isPending}
              submitLabel="שמירה"
              teams={teams}
              readOnly={!editingDetails}
              onEdit={() => setEditingDetails(true)}
              onCancel={() => setEditingDetails(false)}
            />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <PlayerSeasonsTable
              rows={seasonsRowsQ.data ?? []}
              onEditJersey={(r) => setEditingJerseyRow(r)}
              onRemove={(r) => setRemovingRow(r)}
            />
            {availableSeasons.length > 0 && (
              <div>
                <Button onClick={() => setAddingSeason(true)}>
                  <Plus className="w-4 h-4 ml-1" /> הוסף לעונה
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <DeletePlayerDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        player={player}
        statsCount={totalStatsQ.data ?? 0}
        onConfirm={handleDelete}
        deleting={deleteM.isPending}
      />

      <AddPlayerSeasonDialog
        open={addingSeason}
        onOpenChange={setAddingSeason}
        availableSeasons={availableSeasons.map((s) => ({ id: s.id, name: s.name }))}
        teams={teams}
        saving={addSeasonM.isPending}
        onConfirm={async ({ season_id, team_id, jersey_number }) => {
          await addSeasonM.mutateAsync({ player_id: player.id, season_id, team_id, jersey_number });
          setAddingSeason(false);
        }}
      />

      <EditJerseyDialog
        open={!!editingJerseyRow}
        onOpenChange={(open) => !open && setEditingJerseyRow(null)}
        initialJersey={editingJerseyRow?.jersey_number ?? null}
        seasonName={editingJerseyRow?.seasons?.name ?? ''}
        saving={updateJerseyM.isPending}
        onConfirm={async (jersey) => {
          if (!editingJerseyRow) return;
          await updateJerseyM.mutateAsync({
            player_id: player.id,
            team_id: editingJerseyRow.team_id,
            season_id: editingJerseyRow.season_id,
            jersey_number: jersey,
          });
          setEditingJerseyRow(null);
        }}
      />

      <RemovePlayerSeasonDialog
        open={!!removingRow}
        onOpenChange={(open) => !open && setRemovingRow(null)}
        seasonName={removingRow?.seasons?.name ?? ''}
        teamName={removingRow?.teams?.name ?? ''}
        statsCount={seasonStatsQ.data ?? 0}
        removing={removeSeasonM.isPending}
        onConfirm={async () => {
          if (!removingRow) return;
          await removeSeasonM.mutateAsync({
            player_id: player.id,
            team_id: removingRow.team_id,
            season_id: removingRow.season_id,
          });
          setRemovingRow(null);
        }}
      />
    </div>
  );
};

export default PlayerDetailPage;
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit -p tsconfig.app.json
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/PlayerDetailPage.tsx
git commit -m "feat(players): add PlayerDetailPage with tabs"
```

---

### Task 13: Wire up routes + manual E2E

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update App.tsx**

In `src/App.tsx`:

1. Add imports near other page imports:
```tsx
import PlayersListPage from '@/pages/PlayersListPage';
import NewPlayerPage from '@/pages/NewPlayerPage';
import PlayerDetailPage from '@/pages/PlayerDetailPage';
```

2. Find the line:
```tsx
<Route path="/players"      element={<Placeholder title="שחקניות" />} />
```

Replace with three routes:
```tsx
<Route path="/players" element={<PlayersListPage />} />
<Route path="/players/new" element={<NewPlayerPage />} />
<Route path="/players/:id" element={<PlayerDetailPage />} />
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

Then:
1. Login → "שחקניות" in sidebar — empty state visible
2. "+ הוסף שחקנית" — fill all fields, choose team and jersey 23 → submit
3. Redirects to player profile, header shows team + jersey
4. Filters work: search by name, change team, change classification, etc.
5. Click "ערוך" → change height → save → re-render with new value
6. Tab "היסטוריית קבוצות" — see active season row, click "הוסף לעונה" → pick another season → row appears
7. Click "ערוך מספר" → change jersey → saves
8. Click "הסר" → confirmation → row removed
9. ⋯ → "מחק שחקנית" → confirmation → deleted, back to list

If all steps work, feature is complete.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up player routes (list, new, detail)"
```

---

## Summary

After all tasks complete:
- ✅ Database: `photo` and `classification` columns + status migration + storage bucket `player-photos`
- ✅ 3 routes (`/players`, `/players/new`, `/players/:id`)
- ✅ Sortable table with 6 filters + search
- ✅ Photo upload with preview
- ✅ Country dropdown with all 200+ countries in Hebrew
- ✅ Profile page with read-only mode + edit toggle
- ✅ Season history management (add/remove/edit jersey)
- ✅ Smart deletes that block when stats exist
- ✅ ~30 new passing tests
