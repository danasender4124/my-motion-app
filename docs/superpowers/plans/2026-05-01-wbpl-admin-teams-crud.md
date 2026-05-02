# WBPL Admin — Teams CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build full team management — list, create, view profile with tabs, edit, season participation, logo upload, delete with safeguards.

**Architecture:** Three routes (`/teams`, `/teams/new`, `/teams/:id`). Card grid for list. Profile page uses tabs (פרטי קבוצה, עונות + future placeholders). New `team_seasons` join table tracks season participation so teams can leave the league without losing history. Logos upload to Supabase Storage.

**Tech Stack:** React 19, TypeScript, Supabase (DB + Storage), TanStack Query v5, react-hook-form, zod, shadcn/ui (tabs, tooltip), Vitest, React Testing Library.

---

## File Structure

All paths relative to `C:\Users\Dana\projects\wbpl-admin\`.

```
supabase/migrations/
  003_teams_team_seasons.sql        # team_seasons + unique on teams.name + storage bucket SQL

src/features/teams/
  teams.types.ts                    # Team, TeamInput, TeamSeason types
  teams.schema.ts                   # zod schema
  teams.queries.ts                  # TanStack Query hooks (CRUD + storage + team_seasons)
  ColorPicker.tsx                   # Hex color picker with input
  LogoUpload.tsx                    # Logo file upload + preview
  TeamCard.tsx                      # Single card on the list grid
  TeamsGrid.tsx                     # Grid layout, empty/loading states
  TeamForm.tsx                      # Shared form for new + edit
  TeamHeader.tsx                    # Profile page header (logo + name + status)
  TeamSeasonsList.tsx               # Profile page "עונות" tab content
  DeleteTeamDialog.tsx              # Delete confirmation
  RemoveFromSeasonDialog.tsx        # "Remove from current season" confirmation

src/pages/
  TeamsListPage.tsx                 # /teams
  NewTeamPage.tsx                   # /teams/new
  TeamDetailPage.tsx                # /teams/:id (tabs)

src/App.tsx                         # Add 3 routes
```

shadcn components to install: `tabs`, `tooltip`.

---

### Task 1: Database migration + storage bucket

**Files:**
- Create: `supabase/migrations/003_teams_team_seasons.sql`

- [ ] **Step 1: Create migration file**

Create `C:\Users\Dana\projects\wbpl-admin\supabase\migrations\003_teams_team_seasons.sql`:

```sql
-- Add unique constraint on teams.name
alter table teams add constraint teams_name_unique unique (name);

-- team_seasons join table — tracks team participation per season
create table team_seasons (
  team_id uuid not null references teams(id) on delete cascade,
  season_id uuid not null references seasons(id) on delete cascade,
  primary key (team_id, season_id)
);

alter table team_seasons enable row level security;
create policy "authenticated_read" on team_seasons for select using (auth.role() = 'authenticated');
create policy "auth_write" on team_seasons for all using (auth.role() = 'authenticated');

-- Storage bucket for team logos (public read, authenticated write)
insert into storage.buckets (id, name, public)
values ('team-logos', 'team-logos', true)
on conflict (id) do nothing;

create policy "Public can read team logos"
  on storage.objects for select
  using (bucket_id = 'team-logos');

create policy "Authenticated users can upload team logos"
  on storage.objects for insert
  with check (bucket_id = 'team-logos' and auth.role() = 'authenticated');

create policy "Authenticated users can update team logos"
  on storage.objects for update
  using (bucket_id = 'team-logos' and auth.role() = 'authenticated');

create policy "Authenticated users can delete team logos"
  on storage.objects for delete
  using (bucket_id = 'team-logos' and auth.role() = 'authenticated');
```

- [ ] **Step 2: Apply migration in Supabase SQL Editor**

Open Supabase dashboard → SQL Editor → New query → paste the SQL above → Run.

Expected: "Success. No rows returned"

- [ ] **Step 3: Verify in Supabase dashboard**

1. Database → Tables → confirm `team_seasons` exists
2. Storage → confirm `team-logos` bucket exists and is public

- [ ] **Step 4: Commit**

```bash
cd C:\Users\Dana\projects\wbpl-admin
git add supabase/migrations/003_teams_team_seasons.sql
git commit -m "feat(db): add team_seasons table and team-logos storage bucket"
```

---

### Task 2: Install shadcn tabs + tooltip

- [ ] **Step 1: Install components**

```bash
cd C:\Users\Dana\projects\wbpl-admin
npx shadcn@latest add tabs tooltip --overwrite
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add shadcn tabs and tooltip"
```

---

### Task 3: Types + zod schema (TDD)

**Files:**
- Create: `src/features/teams/teams.types.ts`
- Create: `src/features/teams/teams.schema.ts`
- Create: `src/features/teams/teams.schema.test.ts`

- [ ] **Step 1: Create types**

Create `src/features/teams/teams.types.ts`:

```ts
import type { TeamStatus } from '@/types/database.types';

export interface SocialLinks {
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  twitter?: string | null;
}

export interface ContactInfo {
  phone?: string | null;
  email?: string | null;
}

export interface Team {
  id: string;
  name: string;
  city: string | null;
  hall_address: string | null;
  color: string | null;
  logo: string | null;
  website: string | null;
  social_links: SocialLinks | null;
  contact: ContactInfo | null;
  status: TeamStatus;
}

export interface TeamInput {
  name: string;
  city: string | null;
  hall_address: string | null;
  color: string | null;
  logo: string | null;
  website: string | null;
  social_links: SocialLinks | null;
  contact: ContactInfo | null;
  status: TeamStatus;
}

export interface TeamSeason {
  team_id: string;
  season_id: string;
}
```

- [ ] **Step 2: Write failing schema test**

Create `src/features/teams/teams.schema.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { teamSchema } from './teams.schema';

const valid = {
  name: 'מכבי רמת גן',
  city: 'רמת גן',
  hall_address: 'דרך הטייסים 85',
  color: '#FF4D00',
  logo: null,
  website: 'https://example.com',
  social_links: { instagram: 'https://instagram.com/x', facebook: null, youtube: null, twitter: null },
  contact: { phone: '03-1234567', email: 'team@example.com' },
  status: 'active',
};

describe('teamSchema', () => {
  it('accepts a valid full team', () => {
    expect(teamSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a minimal team with only name and status', () => {
    expect(teamSchema.safeParse({
      ...valid,
      city: null, hall_address: null, color: null, logo: null, website: null,
      social_links: null, contact: null,
    }).success).toBe(true);
  });

  it('rejects empty name', () => {
    expect(teamSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('rejects name longer than 100 chars', () => {
    expect(teamSchema.safeParse({ ...valid, name: 'a'.repeat(101) }).success).toBe(false);
  });

  it('rejects invalid color (not hex)', () => {
    expect(teamSchema.safeParse({ ...valid, color: 'red' }).success).toBe(false);
  });

  it('accepts null color', () => {
    expect(teamSchema.safeParse({ ...valid, color: null }).success).toBe(true);
  });

  it('rejects invalid website URL', () => {
    expect(teamSchema.safeParse({ ...valid, website: 'not a url' }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(teamSchema.safeParse({
      ...valid,
      contact: { phone: null, email: 'not-an-email' },
    }).success).toBe(false);
  });

  it('rejects invalid status', () => {
    expect(teamSchema.safeParse({ ...valid, status: 'banana' }).success).toBe(false);
  });
});
```

- [ ] **Step 3: Run test, verify failure**

```bash
cd C:\Users\Dana\projects\wbpl-admin
npm test -- --run src/features/teams/teams.schema.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement schema**

Create `src/features/teams/teams.schema.ts`:

```ts
import { z } from 'zod';

const optionalUrl = z
  .string()
  .nullable()
  .refine((v) => !v || /^https?:\/\/.+/.test(v), 'כתובת URL לא תקינה');

const optionalEmail = z
  .string()
  .nullable()
  .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'כתובת אימייל לא תקינה');

const optionalHexColor = z
  .string()
  .nullable()
  .refine((v) => !v || /^#[0-9A-Fa-f]{6}$/.test(v), 'צבע חייב להיות בפורמט #RRGGBB');

export const teamSchema = z.object({
  name: z.string().trim().min(1, 'שם קבוצה הוא שדה חובה').max(100, 'שם קבוצה ארוך מדי'),
  city: z.string().nullable(),
  hall_address: z.string().nullable(),
  color: optionalHexColor,
  logo: z.string().nullable(),
  website: optionalUrl,
  social_links: z.object({
    instagram: optionalUrl,
    facebook: optionalUrl,
    youtube: optionalUrl,
    twitter: optionalUrl,
  }).nullable(),
  contact: z.object({
    phone: z.string().nullable(),
    email: optionalEmail,
  }).nullable(),
  status: z.enum(['active', 'inactive', 'forming', 'other']),
});

export type TeamFormValues = z.infer<typeof teamSchema>;
```

- [ ] **Step 5: Run tests, verify pass**

```bash
npm test -- --run src/features/teams/teams.schema.test.ts
```

Expected: 9 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/features/teams/
git commit -m "feat(teams): add types and zod schema"
```

---

### Task 4: TanStack Query hooks (TDD)

**Files:**
- Create: `src/features/teams/teams.queries.ts`
- Create: `src/features/teams/teams.queries.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/features/teams/teams.queries.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type ReactNode } from 'react';
import { useTeams } from './teams.queries';

const orderMock = vi.fn();
const fromMock = vi.fn(() => ({ select: vi.fn(() => ({ order: orderMock })) }));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/x.png' } })),
      })),
    },
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
};

describe('useTeams', () => {
  beforeEach(() => {
    fromMock.mockClear();
    orderMock.mockReset();
  });

  it('returns all teams sorted by name', async () => {
    orderMock.mockResolvedValue({
      data: [
        { id: '1', name: 'מכבי רמת גן', city: null, hall_address: null, color: null, logo: null, website: null, social_links: null, contact: null, status: 'active' },
      ],
      error: null,
    });
    const { result } = renderHook(() => useTeams('all'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].name).toBe('מכבי רמת גן');
  });
});
```

- [ ] **Step 2: Verify failure**

```bash
npm test -- --run src/features/teams/teams.queries.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement queries**

Create `src/features/teams/teams.queries.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Team, TeamInput, TeamSeason } from './teams.types';
import type { Season } from '@/features/seasons/seasons.types';

const KEY = ['teams'];

export const useTeams = (filter: 'all' | 'current') =>
  useQuery({
    queryKey: [...KEY, filter],
    queryFn: async (): Promise<Team[]> => {
      // For 'current' filter we'd join team_seasons with active season; for now return all
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Team[];
    },
  });

export const useTeam = (id: string | undefined) =>
  useQuery({
    queryKey: [...KEY, id],
    enabled: !!id,
    queryFn: async (): Promise<Team> => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Team;
    },
  });

export const useCreateTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TeamInput): Promise<Team> => {
      const { data, error } = await supabase
        .from('teams')
        .insert(input)
        .select()
        .single();
      if (error) throw error;

      // Auto-add the new team to the active season's team_seasons
      const { data: activeSeason } = await supabase
        .from('seasons')
        .select('id')
        .eq('status', 'active')
        .maybeSingle();
      if (activeSeason) {
        await supabase
          .from('team_seasons')
          .insert({ team_id: (data as Team).id, season_id: (activeSeason as { id: string }).id });
      }

      return data as Team;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useUpdateTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<TeamInput> }): Promise<Team> => {
      const { data, error } = await supabase
        .from('teams')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Team;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: KEY });
      qc.invalidateQueries({ queryKey: [...KEY, variables.id] });
    },
  });
};

export const useDeleteTeam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('teams').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUploadTeamLogo = () =>
  useMutation({
    mutationFn: async ({ teamId, file }: { teamId: string; file: File }): Promise<string> => {
      const ext = file.name.split('.').pop();
      const path = `${teamId}/logo-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('team-logos')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('team-logos').getPublicUrl(path);
      return data.publicUrl;
    },
  });

export const useTeamSeasons = (teamId: string | undefined) =>
  useQuery({
    queryKey: ['team_seasons', teamId],
    enabled: !!teamId,
    queryFn: async (): Promise<Season[]> => {
      const { data, error } = await supabase
        .from('team_seasons')
        .select('season_id, seasons(*)')
        .eq('team_id', teamId!);
      if (error) throw error;
      return (data ?? []).map((row: { seasons: Season }) => row.seasons);
    },
  });

export const useAddTeamToSeason = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TeamSeason): Promise<void> => {
      const { error } = await supabase.from('team_seasons').insert(input);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['team_seasons', v.team_id] });
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useRemoveTeamFromSeason = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TeamSeason): Promise<void> => {
      const { error } = await supabase
        .from('team_seasons')
        .delete()
        .eq('team_id', input.team_id)
        .eq('season_id', input.season_id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['team_seasons', v.team_id] });
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
};

export const useTeamGameCount = (teamId: string | undefined, seasonId?: string) =>
  useQuery({
    queryKey: ['games', 'count-by-team', teamId, seasonId],
    enabled: !!teamId,
    queryFn: async (): Promise<number> => {
      let q = supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);
      if (seasonId) q = q.eq('season_id', seasonId);
      const { count, error } = await q;
      if (error) throw error;
      return count ?? 0;
    },
  });
```

- [ ] **Step 4: Run tests, verify pass**

```bash
npm test -- --run src/features/teams/teams.queries.test.ts
```

Expected: 1 test passes.

- [ ] **Step 5: Commit**

```bash
git add src/features/teams/teams.queries.ts src/features/teams/teams.queries.test.ts
git commit -m "feat(teams): add tanstack query hooks for CRUD + storage + team_seasons"
```

---

### Task 5: ColorPicker + LogoUpload components

**Files:**
- Create: `src/features/teams/ColorPicker.tsx`
- Create: `src/features/teams/ColorPicker.test.tsx`
- Create: `src/features/teams/LogoUpload.tsx`
- Create: `src/features/teams/LogoUpload.test.tsx`

- [ ] **Step 1: Write ColorPicker test**

Create `src/features/teams/ColorPicker.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColorPicker from './ColorPicker';

describe('ColorPicker', () => {
  it('renders the current color value', () => {
    render(<ColorPicker value="#FF4D00" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('#FF4D00')).toBeInTheDocument();
  });

  it('calls onChange when text input changes', async () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#FF4D00" onChange={onChange} />);
    const input = screen.getByDisplayValue('#FF4D00');
    await userEvent.clear(input);
    await userEvent.type(input, '#00FF00');
    expect(onChange).toHaveBeenLastCalledWith('#00FF00');
  });

  it('renders empty when value is null', () => {
    render(<ColorPicker value={null} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText(/#FF4D00/i)).toHaveValue('');
  });
});
```

- [ ] **Step 2: Verify failure**

```bash
npm test -- --run src/features/teams/ColorPicker.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement ColorPicker**

Create `src/features/teams/ColorPicker.tsx`:

```tsx
import { Input } from '@/components/ui/input';

interface Props {
  value: string | null;
  onChange: (v: string | null) => void;
}

const ColorPicker = ({ value, onChange }: Props) => (
  <div className="flex items-center gap-2">
    <input
      type="color"
      value={value || '#000000'}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
      className="w-12 h-10 rounded border cursor-pointer"
      aria-label="בחר צבע"
    />
    <Input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      placeholder="#FF4D00"
      className="font-mono uppercase max-w-[120px]"
    />
  </div>
);

export default ColorPicker;
```

- [ ] **Step 4: Run ColorPicker tests, verify pass**

```bash
npm test -- --run src/features/teams/ColorPicker.test.tsx
```

Expected: 3 tests pass.

- [ ] **Step 5: Write LogoUpload test**

Create `src/features/teams/LogoUpload.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogoUpload from './LogoUpload';

describe('LogoUpload', () => {
  it('renders preview when logoUrl is set', () => {
    render(<LogoUpload logoUrl="https://example.com/logo.png" onFileSelected={vi.fn()} uploading={false} />);
    expect(screen.getByRole('img', { name: /לוגו/i })).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('renders placeholder when no logo', () => {
    render(<LogoUpload logoUrl={null} onFileSelected={vi.fn()} uploading={false} />);
    expect(screen.getByText(/בחרי לוגו/i)).toBeInTheDocument();
  });

  it('calls onFileSelected when file chosen', async () => {
    const onFileSelected = vi.fn();
    render(<LogoUpload logoUrl={null} onFileSelected={onFileSelected} uploading={false} />);
    const file = new File(['hello'], 'logo.png', { type: 'image/png' });
    const input = screen.getByLabelText(/בחירת קובץ/i) as HTMLInputElement;
    await userEvent.upload(input, file);
    expect(onFileSelected).toHaveBeenCalledWith(file);
  });

  it('shows uploading state', () => {
    render(<LogoUpload logoUrl={null} onFileSelected={vi.fn()} uploading />);
    expect(screen.getByText(/מעלה/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Verify failure**

```bash
npm test -- --run src/features/teams/LogoUpload.test.tsx
```

Expected: FAIL.

- [ ] **Step 7: Implement LogoUpload**

Create `src/features/teams/LogoUpload.tsx`:

```tsx
import { useRef } from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  logoUrl: string | null;
  onFileSelected: (file: File) => void;
  uploading: boolean;
}

const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ACCEPTED = 'image/png,image/jpeg,image/webp,image/svg+xml';

const LogoUpload = ({ logoUrl, onFileSelected, uploading }: Props) => {
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
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 rounded-lg border-2 border-dashed flex items-center justify-center bg-gray-50 overflow-hidden">
        {logoUrl ? (
          <img src={logoUrl} alt="לוגו הקבוצה" className="w-full h-full object-contain" />
        ) : (
          <div className="text-center text-gray-400 text-xs">
            <ImageIcon className="w-8 h-8 mx-auto mb-1" />
            <span>בחרי לוגו</span>
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
          aria-label="בחירת קובץ לוגו"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="w-4 h-4 ml-2" />
          {uploading ? 'מעלה...' : logoUrl ? 'החלף לוגו' : 'העלה לוגו'}
        </Button>
        <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP, SVG · עד 2MB</p>
      </div>
    </div>
  );
};

export default LogoUpload;
```

- [ ] **Step 8: Run LogoUpload tests, verify pass**

```bash
npm test -- --run src/features/teams/LogoUpload.test.tsx
```

Expected: 4 tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/features/teams/ColorPicker.tsx src/features/teams/ColorPicker.test.tsx
git add src/features/teams/LogoUpload.tsx src/features/teams/LogoUpload.test.tsx
git commit -m "feat(teams): add ColorPicker and LogoUpload components"
```

---

### Task 6: TeamCard + TeamsGrid (TDD)

**Files:**
- Create: `src/features/teams/TeamCard.tsx`
- Create: `src/features/teams/TeamCard.test.tsx`
- Create: `src/features/teams/TeamsGrid.tsx`
- Create: `src/features/teams/TeamsGrid.test.tsx`

- [ ] **Step 1: Write TeamCard test**

Create `src/features/teams/TeamCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TeamCard from './TeamCard';

const team = {
  id: 't1',
  name: 'מכבי רמת גן',
  city: 'רמת גן',
  hall_address: null,
  color: '#FF4D00',
  logo: 'https://example.com/logo.png',
  website: null,
  social_links: null,
  contact: null,
  status: 'active' as const,
};

describe('TeamCard', () => {
  it('renders team name and city', () => {
    render(<MemoryRouter><TeamCard team={team} /></MemoryRouter>);
    expect(screen.getByText('מכבי רמת גן')).toBeInTheDocument();
    expect(screen.getByText('רמת גן')).toBeInTheDocument();
  });

  it('renders logo image when set', () => {
    render(<MemoryRouter><TeamCard team={team} /></MemoryRouter>);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('links to team detail page', () => {
    render(<MemoryRouter><TeamCard team={team} /></MemoryRouter>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/teams/t1');
  });
});
```

- [ ] **Step 2: Verify failure**

```bash
npm test -- --run src/features/teams/TeamCard.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement TeamCard**

Create `src/features/teams/TeamCard.tsx`:

```tsx
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import type { Team } from './teams.types';

interface Props {
  team: Team;
}

const STATUS_LABELS: Record<Team['status'], string> = {
  active: 'פעילה',
  inactive: 'לא פעילה',
  forming: 'בהקמה',
  other: 'אחר',
};

const TeamCard = ({ team }: Props) => (
  <Link
    to={`/teams/${team.id}`}
    className="group block bg-white rounded-lg border hover:shadow-md transition-shadow overflow-hidden"
    dir="rtl"
  >
    <div className="flex">
      <div
        className="w-1.5 shrink-0"
        style={{ background: team.color || '#9ca3af' }}
        aria-hidden
      />
      <div className="flex-1 flex items-center gap-3 p-4 min-w-0">
        <div className="w-12 h-12 rounded shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden">
          {team.logo ? (
            <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-gray-400 text-xs">אין לוגו</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">{team.name}</div>
          {team.city && <div className="text-sm text-gray-500 truncate">{team.city}</div>}
          <Badge variant="outline" className="mt-1 text-xs">
            {STATUS_LABELS[team.status]}
          </Badge>
        </div>
      </div>
    </div>
  </Link>
);

export default TeamCard;
```

- [ ] **Step 4: Run TeamCard tests, verify pass**

```bash
npm test -- --run src/features/teams/TeamCard.test.tsx
```

Expected: 3 tests pass.

- [ ] **Step 5: Write TeamsGrid test**

Create `src/features/teams/TeamsGrid.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TeamsGrid from './TeamsGrid';

const teams = [
  { id: 't1', name: 'מכבי רמת גן', city: 'רמת גן', hall_address: null, color: '#FF4D00', logo: null, website: null, social_links: null, contact: null, status: 'active' as const },
  { id: 't2', name: 'הפועל ראשל"צ', city: 'ראשל"צ', hall_address: null, color: '#E2001A', logo: null, website: null, social_links: null, contact: null, status: 'active' as const },
];

describe('TeamsGrid', () => {
  it('renders all teams', () => {
    render(<MemoryRouter><TeamsGrid teams={teams} /></MemoryRouter>);
    expect(screen.getByText('מכבי רמת גן')).toBeInTheDocument();
    expect(screen.getByText('הפועל ראשל"צ')).toBeInTheDocument();
  });

  it('renders empty state when no teams', () => {
    render(<MemoryRouter><TeamsGrid teams={[]} /></MemoryRouter>);
    expect(screen.getByText(/אין קבוצות/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Verify failure**

```bash
npm test -- --run src/features/teams/TeamsGrid.test.tsx
```

Expected: FAIL.

- [ ] **Step 7: Implement TeamsGrid**

Create `src/features/teams/TeamsGrid.tsx`:

```tsx
import TeamCard from './TeamCard';
import type { Team } from './teams.types';

interface Props {
  teams: Team[];
}

const TeamsGrid = ({ teams }: Props) => {
  if (teams.length === 0) {
    return (
      <div className="border border-dashed rounded-lg py-16 text-center text-gray-500" dir="rtl">
        אין קבוצות במערכת. הוסיפי קבוצה חדשה.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
      {teams.map((t) => (
        <TeamCard key={t.id} team={t} />
      ))}
    </div>
  );
};

export default TeamsGrid;
```

- [ ] **Step 8: Run tests, verify pass**

```bash
npm test -- --run src/features/teams/TeamsGrid.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/features/teams/TeamCard.tsx src/features/teams/TeamCard.test.tsx
git add src/features/teams/TeamsGrid.tsx src/features/teams/TeamsGrid.test.tsx
git commit -m "feat(teams): add TeamCard and TeamsGrid components"
```

---

### Task 7: TeamForm shared component (TDD)

**Files:**
- Create: `src/features/teams/TeamForm.tsx`
- Create: `src/features/teams/TeamForm.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/features/teams/TeamForm.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeamForm from './TeamForm';

describe('TeamForm', () => {
  it('renders empty form in create mode', () => {
    render(
      <TeamForm
        initial={null}
        onSubmit={vi.fn()}
        onLogoUpload={vi.fn()}
        submitting={false}
        uploading={false}
        submitLabel="צור קבוצה"
      />
    );
    expect(screen.getByLabelText(/^שם$/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /צור קבוצה/i })).toBeInTheDocument();
  });

  it('pre-fills form in edit mode', () => {
    render(
      <TeamForm
        initial={{
          id: 't1', name: 'מכבי רמת גן', city: 'רמת גן',
          hall_address: null, color: '#FF4D00', logo: null,
          website: 'https://example.com',
          social_links: null, contact: null, status: 'active',
        }}
        onSubmit={vi.fn()}
        onLogoUpload={vi.fn()}
        submitting={false}
        uploading={false}
        submitLabel="שמירה"
      />
    );
    expect(screen.getByLabelText(/^שם$/i)).toHaveValue('מכבי רמת גן');
    expect(screen.getByLabelText(/עיר/i)).toHaveValue('רמת גן');
  });

  it('shows validation error for empty name', async () => {
    render(
      <TeamForm
        initial={null}
        onSubmit={vi.fn()}
        onLogoUpload={vi.fn()}
        submitting={false}
        uploading={false}
        submitLabel="צור קבוצה"
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /צור קבוצה/i }));
    expect(await screen.findByText(/שם קבוצה הוא שדה חובה/i)).toBeInTheDocument();
  });

  it('submits form with cleaned values', async () => {
    const onSubmit = vi.fn();
    render(
      <TeamForm
        initial={null}
        onSubmit={onSubmit}
        onLogoUpload={vi.fn()}
        submitting={false}
        uploading={false}
        submitLabel="צור קבוצה"
      />
    );
    await userEvent.type(screen.getByLabelText(/^שם$/i), 'מכבי רמת גן');
    await userEvent.click(screen.getByRole('button', { name: /צור קבוצה/i }));
    expect(onSubmit).toHaveBeenCalled();
    const submittedInput = onSubmit.mock.calls[0][0];
    expect(submittedInput.name).toBe('מכבי רמת גן');
    expect(submittedInput.status).toBe('active');
  });
});
```

- [ ] **Step 2: Verify failure**

```bash
npm test -- --run src/features/teams/TeamForm.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement TeamForm**

Create `src/features/teams/TeamForm.tsx`:

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
import ColorPicker from './ColorPicker';
import LogoUpload from './LogoUpload';
import { teamSchema, type TeamFormValues } from './teams.schema';
import type { Team, TeamInput } from './teams.types';

interface Props {
  initial: Team | null;
  onSubmit: (input: TeamInput) => void | Promise<void>;
  onLogoUpload: (file: File) => Promise<string>;
  submitting: boolean;
  uploading: boolean;
  submitLabel: string;
  onCancel?: () => void;
}

const DEFAULTS: TeamFormValues = {
  name: '',
  city: null,
  hall_address: null,
  color: null,
  logo: null,
  website: null,
  social_links: { instagram: null, facebook: null, youtube: null, twitter: null },
  contact: { phone: null, email: null },
  status: 'active',
};

const fillDefaults = (team: Team | null): TeamFormValues => {
  if (!team) return DEFAULTS;
  return {
    name: team.name,
    city: team.city,
    hall_address: team.hall_address,
    color: team.color,
    logo: team.logo,
    website: team.website,
    social_links: team.social_links ?? { instagram: null, facebook: null, youtube: null, twitter: null },
    contact: team.contact ?? { phone: null, email: null },
    status: team.status,
  };
};

const cleanString = (v: string | null): string | null => {
  const t = (v ?? '').trim();
  return t === '' ? null : t;
};

const TeamForm = ({ initial, onSubmit, onLogoUpload, submitting, uploading, submitLabel, onCancel }: Props) => {
  const {
    register, handleSubmit, control, reset, watch, setValue,
    formState: { errors },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: fillDefaults(initial),
  });

  useEffect(() => {
    reset(fillDefaults(initial));
  }, [initial, reset]);

  const submit = handleSubmit(async (values) => {
    const cleaned: TeamInput = {
      name: values.name.trim(),
      city: cleanString(values.city),
      hall_address: cleanString(values.hall_address),
      color: cleanString(values.color),
      logo: cleanString(values.logo),
      website: cleanString(values.website),
      social_links: values.social_links
        ? {
            instagram: cleanString(values.social_links.instagram ?? null),
            facebook: cleanString(values.social_links.facebook ?? null),
            youtube: cleanString(values.social_links.youtube ?? null),
            twitter: cleanString(values.social_links.twitter ?? null),
          }
        : null,
      contact: values.contact
        ? {
            phone: cleanString(values.contact.phone ?? null),
            email: cleanString(values.contact.email ?? null),
          }
        : null,
      status: values.status,
    };
    await onSubmit(cleaned);
  });

  const handleLogoFile = async (file: File) => {
    const url = await onLogoUpload(file);
    setValue('logo', url, { shouldDirty: true });
  };

  return (
    <form onSubmit={submit} className="space-y-8" dir="rtl">
      {/* Group 1 — Basic */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">פרטים בסיסיים</h3>

        <div className="space-y-1">
          <Label htmlFor="name">שם</Label>
          <Input id="name" {...register('name')} placeholder="מכבי רמת גן" />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="city">עיר</Label>
            <Input id="city" {...register('city')} placeholder="רמת גן" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="status">סטטוס</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">פעילה</SelectItem>
                    <SelectItem value="forming">בהקמה</SelectItem>
                    <SelectItem value="inactive">לא פעילה</SelectItem>
                    <SelectItem value="other">אחר</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="hall_address">כתובת אולם</Label>
          <Input id="hall_address" {...register('hall_address')} placeholder="דרך הטייסים 85, רמת גן" />
        </div>
      </section>

      {/* Group 2 — Branding */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">מיתוג</h3>

        <div className="space-y-1">
          <Label>צבע</Label>
          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <ColorPicker value={field.value} onChange={field.onChange} />
            )}
          />
          {errors.color && <p className="text-red-500 text-xs">{errors.color.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>לוגו</Label>
          <LogoUpload
            logoUrl={watch('logo')}
            onFileSelected={handleLogoFile}
            uploading={uploading}
          />
        </div>
      </section>

      {/* Group 3 — Contact + Social */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">קשר ורשתות</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="website">אתר אינטרנט</Label>
            <Input id="website" {...register('website')} placeholder="https://example.com" />
            {errors.website && <p className="text-red-500 text-xs">{errors.website.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">טלפון</Label>
            <Input id="phone" {...register('contact.phone')} placeholder="03-1234567" />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="email">אימייל</Label>
          <Input id="email" type="email" {...register('contact.email')} placeholder="team@example.com" />
          {errors.contact?.email && (
            <p className="text-red-500 text-xs">{errors.contact.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" {...register('social_links.instagram')} placeholder="https://instagram.com/team" />
            {errors.social_links?.instagram && (
              <p className="text-red-500 text-xs">{errors.social_links.instagram.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" {...register('social_links.facebook')} placeholder="https://facebook.com/team" />
            {errors.social_links?.facebook && (
              <p className="text-red-500 text-xs">{errors.social_links.facebook.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="youtube">YouTube</Label>
            <Input id="youtube" {...register('social_links.youtube')} placeholder="https://youtube.com/team" />
            {errors.social_links?.youtube && (
              <p className="text-red-500 text-xs">{errors.social_links.youtube.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="twitter">X / Twitter</Label>
            <Input id="twitter" {...register('social_links.twitter')} placeholder="https://x.com/team" />
            {errors.social_links?.twitter && (
              <p className="text-red-500 text-xs">{errors.social_links.twitter.message}</p>
            )}
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-2 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            ביטול
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'שומר...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default TeamForm;
```

- [ ] **Step 4: Run tests, verify pass**

```bash
npm test -- --run src/features/teams/TeamForm.test.tsx
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/teams/TeamForm.tsx src/features/teams/TeamForm.test.tsx
git commit -m "feat(teams): add shared TeamForm component"
```

---

### Task 8: TeamHeader + Delete dialog (TDD)

**Files:**
- Create: `src/features/teams/TeamHeader.tsx`
- Create: `src/features/teams/TeamHeader.test.tsx`
- Create: `src/features/teams/DeleteTeamDialog.tsx`
- Create: `src/features/teams/DeleteTeamDialog.test.tsx`

- [ ] **Step 1: Write TeamHeader test**

Create `src/features/teams/TeamHeader.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeamHeader from './TeamHeader';

const team = {
  id: 't1', name: 'מכבי רמת גן', city: 'רמת גן',
  hall_address: null, color: '#FF4D00', logo: 'https://example.com/logo.png',
  website: null, social_links: null, contact: null, status: 'active' as const,
};

describe('TeamHeader', () => {
  it('renders team name, city, and logo', () => {
    render(<TeamHeader team={team} onDelete={vi.fn()} />);
    expect(screen.getByText('מכבי רמת גן')).toBeInTheDocument();
    expect(screen.getByText('רמת גן')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('shows delete button in menu', async () => {
    const onDelete = vi.fn();
    render(<TeamHeader team={team} onDelete={onDelete} />);
    await userEvent.click(screen.getByLabelText(/פעולות/i));
    await userEvent.click(screen.getByRole('menuitem', { name: /מחק קבוצה/i }));
    expect(onDelete).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Verify failure**

```bash
npm test -- --run src/features/teams/TeamHeader.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement TeamHeader**

Create `src/features/teams/TeamHeader.tsx`:

```tsx
import { MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Team } from './teams.types';

interface Props {
  team: Team;
  onDelete: () => void;
}

const STATUS_LABELS: Record<Team['status'], string> = {
  active: 'פעילה',
  inactive: 'לא פעילה',
  forming: 'בהקמה',
  other: 'אחר',
};

const TeamHeader = ({ team, onDelete }: Props) => (
  <div className="flex items-stretch bg-white rounded-lg border overflow-hidden" dir="rtl">
    <div
      className="w-1.5 shrink-0"
      style={{ background: team.color || '#9ca3af' }}
      aria-hidden
    />
    <div className="flex-1 flex items-start gap-4 p-6">
      <div className="w-20 h-20 rounded shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden">
        {team.logo ? (
          <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
        ) : (
          <span className="text-gray-400 text-xs">אין לוגו</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold leading-tight">{team.name}</h1>
        {team.city && <div className="text-gray-500 text-sm mt-1">{team.city}</div>}
        <Badge variant="outline" className="mt-2">{STATUS_LABELS[team.status]}</Badge>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="פעולות">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" dir="rtl">
          <DropdownMenuItem onClick={onDelete} className="text-red-600">
            <Trash2 className="w-4 h-4 ml-2" />
            מחק קבוצה
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);

export default TeamHeader;
```

- [ ] **Step 4: Run TeamHeader tests, verify pass**

```bash
npm test -- --run src/features/teams/TeamHeader.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 5: Write DeleteTeamDialog test**

Create `src/features/teams/DeleteTeamDialog.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteTeamDialog from './DeleteTeamDialog';

const team = {
  id: 't1', name: 'מכבי רמת גן', city: null,
  hall_address: null, color: null, logo: null,
  website: null, social_links: null, contact: null, status: 'active' as const,
};

describe('DeleteTeamDialog', () => {
  it('shows confirmation with team name', () => {
    render(
      <DeleteTeamDialog
        open
        onOpenChange={vi.fn()}
        team={team}
        gameCount={0}
        onConfirm={vi.fn()}
        deleting={false}
      />
    );
    expect(screen.getByText(/מכבי רמת גן/)).toBeInTheDocument();
  });

  it('blocks deletion when games exist', () => {
    render(
      <DeleteTeamDialog
        open
        onOpenChange={vi.fn()}
        team={team}
        gameCount={5}
        onConfirm={vi.fn()}
        deleting={false}
      />
    );
    expect(screen.getByText(/לא ניתן למחוק/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^מחיקה$/i })).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirmed', async () => {
    const onConfirm = vi.fn();
    render(
      <DeleteTeamDialog
        open
        onOpenChange={vi.fn()}
        team={team}
        gameCount={0}
        onConfirm={onConfirm}
        deleting={false}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /^מחיקה$/i }));
    expect(onConfirm).toHaveBeenCalled();
  });
});
```

- [ ] **Step 6: Verify failure**

```bash
npm test -- --run src/features/teams/DeleteTeamDialog.test.tsx
```

Expected: FAIL.

- [ ] **Step 7: Implement DeleteTeamDialog**

Create `src/features/teams/DeleteTeamDialog.tsx`:

```tsx
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Team } from './teams.types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team | null;
  gameCount: number;
  onConfirm: () => void;
  deleting: boolean;
}

const DeleteTeamDialog = ({ open, onOpenChange, team, gameCount, onConfirm, deleting }: Props) => {
  if (!team) return null;
  const blocked = gameCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {blocked ? 'לא ניתן למחוק קבוצה' : `למחוק את ${team.name}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {blocked
              ? `לקבוצה ${gameCount} משחקים במערכת. לא ניתן למחוק קבוצה עם נתוני עבר. השתמשי ב"הוצא מהליגה" במקום זאת.`
              : 'פעולה זו לא ניתנת לביטול. כל נתוני הקבוצה יימחקו.'}
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

export default DeleteTeamDialog;
```

- [ ] **Step 8: Run tests, verify pass**

```bash
npm test -- --run src/features/teams/DeleteTeamDialog.test.tsx
```

Expected: 3 tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/features/teams/TeamHeader.tsx src/features/teams/TeamHeader.test.tsx
git add src/features/teams/DeleteTeamDialog.tsx src/features/teams/DeleteTeamDialog.test.tsx
git commit -m "feat(teams): add TeamHeader and DeleteTeamDialog"
```

---

### Task 9: TeamSeasonsList + RemoveFromSeasonDialog (TDD)

**Files:**
- Create: `src/features/teams/TeamSeasonsList.tsx`
- Create: `src/features/teams/TeamSeasonsList.test.tsx`
- Create: `src/features/teams/RemoveFromSeasonDialog.tsx`

- [ ] **Step 1: Write TeamSeasonsList test**

Create `src/features/teams/TeamSeasonsList.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeamSeasonsList from './TeamSeasonsList';

const teamSeasons = [
  { id: 's1', name: '2025/26', start_date: '2025-10-01', estimated_end_date: null, status: 'active' as const },
  { id: 's2', name: '2024/25', start_date: '2024-10-01', estimated_end_date: '2025-05-31', status: 'ended' as const },
];

const allSeasons = [
  ...teamSeasons,
  { id: 's3', name: '2026/27', start_date: '2026-10-01', estimated_end_date: null, status: 'future' as const },
];

describe('TeamSeasonsList', () => {
  it('renders all seasons the team participated in', () => {
    render(
      <TeamSeasonsList
        teamSeasons={teamSeasons}
        allSeasons={allSeasons}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    expect(screen.getByText('2025/26')).toBeInTheDocument();
    expect(screen.getByText('2024/25')).toBeInTheDocument();
  });

  it('renders empty state when no seasons', () => {
    render(
      <TeamSeasonsList
        teamSeasons={[]}
        allSeasons={allSeasons}
        onAdd={vi.fn()}
        onRemove={vi.fn()}
      />
    );
    expect(screen.getByText(/הקבוצה לא משתתפת באף עונה/i)).toBeInTheDocument();
  });

  it('calls onRemove when "remove" clicked', async () => {
    const onRemove = vi.fn();
    render(
      <TeamSeasonsList
        teamSeasons={teamSeasons}
        allSeasons={allSeasons}
        onAdd={vi.fn()}
        onRemove={onRemove}
      />
    );
    const removeButtons = screen.getAllByRole('button', { name: /הוצא/i });
    await userEvent.click(removeButtons[0]);
    expect(onRemove).toHaveBeenCalledWith(teamSeasons[0]);
  });
});
```

- [ ] **Step 2: Verify failure**

```bash
npm test -- --run src/features/teams/TeamSeasonsList.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement TeamSeasonsList**

Create `src/features/teams/TeamSeasonsList.tsx`:

```tsx
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Season } from '@/features/seasons/seasons.types';

interface Props {
  teamSeasons: Season[];
  allSeasons: Season[];
  onAdd: (season: Season) => void;
  onRemove: (season: Season) => void;
}

const STATUS_LABEL: Record<Season['status'], string> = {
  future: 'עתידית',
  active: 'פעילה',
  ended: 'הסתיימה',
};

const TeamSeasonsList = ({ teamSeasons, allSeasons, onAdd, onRemove }: Props) => {
  const [selectedAdd, setSelectedAdd] = useState<string>('');

  const teamSeasonIds = new Set(teamSeasons.map((s) => s.id));
  const availableToAdd = allSeasons.filter((s) => !teamSeasonIds.has(s.id));

  const handleAdd = () => {
    const season = allSeasons.find((s) => s.id === selectedAdd);
    if (season) {
      onAdd(season);
      setSelectedAdd('');
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {teamSeasons.length === 0 ? (
        <div className="border border-dashed rounded-lg py-12 text-center text-gray-500">
          הקבוצה לא משתתפת באף עונה.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">עונה</th>
                <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3">סטטוס בעונה</th>
                <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-3 w-32">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {teamSeasons.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-3 font-semibold">{s.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{STATUS_LABEL[s.status]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(s)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 ml-1" />
                      הוצא
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {availableToAdd.length > 0 && (
        <div className="flex items-center gap-2">
          <Select value={selectedAdd} onValueChange={setSelectedAdd}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="בחרי עונה להוספה" />
            </SelectTrigger>
            <SelectContent>
              {availableToAdd.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={!selectedAdd}>
            <Plus className="w-4 h-4 ml-1" />
            הוסף לעונה
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeamSeasonsList;
```

- [ ] **Step 4: Run tests, verify pass**

```bash
npm test -- --run src/features/teams/TeamSeasonsList.test.tsx
```

Expected: 3 tests pass.

- [ ] **Step 5: Implement RemoveFromSeasonDialog (no test — trivial)**

Create `src/features/teams/RemoveFromSeasonDialog.tsx`:

```tsx
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Season } from '@/features/seasons/seasons.types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  season: Season | null;
  gameCount: number;
  onConfirm: () => void;
  removing: boolean;
}

const RemoveFromSeasonDialog = ({ open, onOpenChange, season, gameCount, onConfirm, removing }: Props) => {
  if (!season) return null;
  const blocked = gameCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {blocked ? 'לא ניתן להוציא מהעונה' : `להוציא את הקבוצה מעונה ${season.name}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {blocked
              ? `יש ${gameCount} משחקים לקבוצה בעונה זו. מחקי קודם את המשחקים הקשורים.`
              : 'הקבוצה תוסר מהעונה הזו אך הנתונים ההיסטוריים יישמרו. ניתן יהיה להחזיר אותה בעתיד.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel>ביטול</AlertDialogCancel>
          {!blocked && (
            <AlertDialogAction onClick={onConfirm} disabled={removing}>
              {removing ? 'מוציא...' : 'הוצא מהעונה'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveFromSeasonDialog;
```

- [ ] **Step 6: Commit**

```bash
git add src/features/teams/TeamSeasonsList.tsx src/features/teams/TeamSeasonsList.test.tsx
git add src/features/teams/RemoveFromSeasonDialog.tsx
git commit -m "feat(teams): add TeamSeasonsList and RemoveFromSeasonDialog"
```

---

### Task 10: TeamsListPage

**Files:**
- Create: `src/pages/TeamsListPage.tsx`

- [ ] **Step 1: Implement page**

Create `src/pages/TeamsListPage.tsx`:

```tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTeams } from '@/features/teams/teams.queries';
import TeamsGrid from '@/features/teams/TeamsGrid';

const TeamsListPage = () => {
  const [filter, setFilter] = useState<'current' | 'all'>('current');
  const [search, setSearch] = useState('');
  const teamsQ = useTeams(filter);

  const filteredTeams = useMemo(() => {
    if (!teamsQ.data) return [];
    const term = search.trim();
    if (!term) return teamsQ.data;
    return teamsQ.data.filter((t) => t.name.includes(term));
  }, [teamsQ.data, search]);

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">קבוצות</h1>
        <Button asChild>
          <Link to="/teams/new">
            <Plus className="w-4 h-4 ml-1" />
            הוסף קבוצה
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם..."
            className="pr-9"
          />
        </div>
        <div className="flex border rounded-lg overflow-hidden text-sm">
          <button
            type="button"
            onClick={() => setFilter('current')}
            className={`px-4 py-2 transition ${filter === 'current' ? 'bg-orange-500 text-white' : 'bg-white hover:bg-gray-50'}`}
          >
            עונה נוכחית
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 transition border-r ${filter === 'all' ? 'bg-orange-500 text-white' : 'bg-white hover:bg-gray-50'}`}
          >
            כל הקבוצות
          </button>
        </div>
      </div>

      {teamsQ.isLoading && <div className="text-gray-500">טוען...</div>}
      {teamsQ.error && (
        <div className="text-red-600 bg-red-50 p-4 rounded">
          שגיאה בטעינת הקבוצות. נסי לרענן את הדף.
        </div>
      )}
      {teamsQ.data && <TeamsGrid teams={filteredTeams} />}
    </div>
  );
};

export default TeamsListPage;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit -p tsconfig.app.json
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/TeamsListPage.tsx
git commit -m "feat(teams): add TeamsListPage"
```

---

### Task 11: NewTeamPage

**Files:**
- Create: `src/pages/NewTeamPage.tsx`

- [ ] **Step 1: Implement page**

Create `src/pages/NewTeamPage.tsx`:

```tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import TeamForm from '@/features/teams/TeamForm';
import { useCreateTeam, useUploadTeamLogo } from '@/features/teams/teams.queries';
import type { TeamInput } from '@/features/teams/teams.types';

const NewTeamPage = () => {
  const navigate = useNavigate();
  const createM = useCreateTeam();
  const uploadM = useUploadTeamLogo();
  const [tempTeamId] = useState(() => crypto.randomUUID());

  const handleSubmit = async (input: TeamInput) => {
    const team = await createM.mutateAsync(input);
    navigate(`/teams/${team.id}`);
  };

  const handleLogoUpload = async (file: File): Promise<string> => {
    return uploadM.mutateAsync({ teamId: tempTeamId, file });
  };

  return (
    <div dir="rtl" className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/teams" className="hover:text-gray-900 flex items-center gap-1">
          <ArrowRight className="w-4 h-4" />
          חזרה לקבוצות
        </Link>
      </div>
      <h1 className="text-2xl font-bold">הוספת קבוצה חדשה</h1>
      <div className="bg-white rounded-lg border p-6">
        <TeamForm
          initial={null}
          onSubmit={handleSubmit}
          onLogoUpload={handleLogoUpload}
          submitting={createM.isPending}
          uploading={uploadM.isPending}
          submitLabel="צור קבוצה"
          onCancel={() => navigate('/teams')}
        />
      </div>
    </div>
  );
};

export default NewTeamPage;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit -p tsconfig.app.json
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/NewTeamPage.tsx
git commit -m "feat(teams): add NewTeamPage"
```

---

### Task 12: TeamDetailPage with tabs

**Files:**
- Create: `src/pages/TeamDetailPage.tsx`

- [ ] **Step 1: Implement page**

Create `src/pages/TeamDetailPage.tsx`:

```tsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TeamHeader from '@/features/teams/TeamHeader';
import TeamForm from '@/features/teams/TeamForm';
import TeamSeasonsList from '@/features/teams/TeamSeasonsList';
import DeleteTeamDialog from '@/features/teams/DeleteTeamDialog';
import RemoveFromSeasonDialog from '@/features/teams/RemoveFromSeasonDialog';
import {
  useTeam, useUpdateTeam, useDeleteTeam, useUploadTeamLogo,
  useTeamSeasons, useAddTeamToSeason, useRemoveTeamFromSeason,
  useTeamGameCount,
} from '@/features/teams/teams.queries';
import { useSeasons } from '@/features/seasons/seasons.queries';
import type { TeamInput } from '@/features/teams/teams.types';
import type { Season } from '@/features/seasons/seasons.types';

const TeamDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const teamQ = useTeam(id);
  const teamSeasonsQ = useTeamSeasons(id);
  const allSeasonsQ = useSeasons();

  const updateM = useUpdateTeam();
  const deleteM = useDeleteTeam();
  const uploadM = useUploadTeamLogo();
  const addToSeasonM = useAddTeamToSeason();
  const removeFromSeasonM = useRemoveTeamFromSeason();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [removingFromSeason, setRemovingFromSeason] = useState<Season | null>(null);

  const teamGameCountQ = useTeamGameCount(id);
  const seasonGameCountQ = useTeamGameCount(id, removingFromSeason?.id);

  if (teamQ.isLoading) return <div className="text-gray-500" dir="rtl">טוען...</div>;
  if (teamQ.error || !teamQ.data) {
    return (
      <div dir="rtl" className="text-red-600 bg-red-50 p-4 rounded">
        שגיאה בטעינת הקבוצה. <Link to="/teams" className="underline">חזרה לרשימה</Link>
      </div>
    );
  }

  const team = teamQ.data;

  const handleSave = async (input: TeamInput) => {
    await updateM.mutateAsync({ id: team.id, input });
  };

  const handleLogoUpload = async (file: File): Promise<string> => {
    return uploadM.mutateAsync({ teamId: team.id, file });
  };

  const handleDelete = async () => {
    await deleteM.mutateAsync(team.id);
    navigate('/teams');
  };

  const handleAddToSeason = async (season: Season) => {
    await addToSeasonM.mutateAsync({ team_id: team.id, season_id: season.id });
  };

  const handleRemoveFromSeasonConfirm = async () => {
    if (!removingFromSeason) return;
    await removeFromSeasonM.mutateAsync({ team_id: team.id, season_id: removingFromSeason.id });
    setRemovingFromSeason(null);
  };

  return (
    <div dir="rtl" className="space-y-6 max-w-4xl mx-auto">
      <Link to="/teams" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
        <ArrowRight className="w-4 h-4" />
        חזרה לקבוצות
      </Link>

      <TeamHeader team={team} onDelete={() => setConfirmDelete(true)} />

      <Tabs defaultValue="details">
        <TabsList dir="rtl">
          <TabsTrigger value="details">פרטי קבוצה</TabsTrigger>
          <TabsTrigger value="seasons">עונות</TabsTrigger>
          <TabsTrigger value="roster" disabled>סגל (בקרוב)</TabsTrigger>
          <TabsTrigger value="staff" disabled>צוות מקצועי (בקרוב)</TabsTrigger>
          <TabsTrigger value="games" disabled>משחקים (בקרוב)</TabsTrigger>
          <TabsTrigger value="achievements" disabled>תארים (בקרוב)</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="bg-white rounded-lg border p-6">
            <TeamForm
              initial={team}
              onSubmit={handleSave}
              onLogoUpload={handleLogoUpload}
              submitting={updateM.isPending}
              uploading={uploadM.isPending}
              submitLabel="שמירה"
            />
          </div>
        </TabsContent>

        <TabsContent value="seasons">
          <div className="bg-white rounded-lg border p-6">
            <TeamSeasonsList
              teamSeasons={teamSeasonsQ.data ?? []}
              allSeasons={allSeasonsQ.data ?? []}
              onAdd={handleAddToSeason}
              onRemove={(s) => setRemovingFromSeason(s)}
            />
          </div>
        </TabsContent>
      </Tabs>

      <DeleteTeamDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        team={team}
        gameCount={teamGameCountQ.data ?? 0}
        onConfirm={handleDelete}
        deleting={deleteM.isPending}
      />

      <RemoveFromSeasonDialog
        open={!!removingFromSeason}
        onOpenChange={(open) => !open && setRemovingFromSeason(null)}
        season={removingFromSeason}
        gameCount={seasonGameCountQ.data ?? 0}
        onConfirm={handleRemoveFromSeasonConfirm}
        removing={removeFromSeasonM.isPending}
      />
    </div>
  );
};

export default TeamDetailPage;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit -p tsconfig.app.json
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/TeamDetailPage.tsx
git commit -m "feat(teams): add TeamDetailPage with tabs"
```

---

### Task 13: Wire up routes + manual E2E

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update App.tsx**

In `src/App.tsx`:

1. Add imports near other page imports at top:

```tsx
import TeamsListPage from '@/pages/TeamsListPage';
import NewTeamPage from '@/pages/NewTeamPage';
import TeamDetailPage from '@/pages/TeamDetailPage';
```

2. Find the line:
```tsx
<Route path="/teams"        element={<Placeholder title="קבוצות" />} />
```

Replace with three routes:
```tsx
<Route path="/teams" element={<TeamsListPage />} />
<Route path="/teams/new" element={<NewTeamPage />} />
<Route path="/teams/:id" element={<TeamDetailPage />} />
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

In the browser:
1. Login → navigate to "קבוצות" — should see empty state
2. Click "הוסף קבוצה" → fill name="מכבי רמת גן", city="רמת גן", color=#FF4D00, status=active → upload a small PNG → submit
3. Should redirect to `/teams/<id>` with the new team
4. Verify "פרטי קבוצה" tab shows pre-filled form including logo
5. Edit the city → save → reload → city is persisted
6. Click "עונות" tab → should see the active season already added (auto-added on create)
7. Add another season via the dropdown → row appears
8. Click "הוצא" on a season → dialog → confirm → row removed
9. Click "⋯" → "מחק קבוצה" → dialog → confirm → redirected to `/teams`, team gone
10. Toggle filter "כל הקבוצות" / "עונה נוכחית" works

If all 10 steps pass, the feature is complete.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up team routes (list, new, detail)"
```

---

## Summary

After all tasks complete:
- ✅ Database: `team_seasons` table + storage bucket `team-logos` + unique constraint on team name
- ✅ 3 routes: `/teams`, `/teams/new`, `/teams/:id`
- ✅ Card grid list with current-season filter and search
- ✅ Detail page with 6 tabs (2 functional, 4 placeholders)
- ✅ Logo upload to Supabase Storage with preview
- ✅ Color picker with hex input
- ✅ Season participation management (add/remove without deleting team)
- ✅ Smart delete that blocks if games exist
- ✅ ~25 new passing tests
