# WBPL Admin — Seasons CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build full CRUD management for seasons in the wbpl-admin app — list, create, edit, delete with active-status auto-rotation.

**Architecture:** A `/seasons` page hosts a TanStack Query–powered table. Modal dialogs handle create/edit and confirmations. shadcn/ui supplies the table and dialog primitives; react-hook-form + zod handle validation. All Supabase calls live in `seasons.queries.ts`; UI is split into focused components under `src/features/seasons/`.

**Tech Stack:** React 19, TypeScript, Supabase, TanStack Query v5, react-hook-form, zod, shadcn/ui, Vitest, React Testing Library.

---

## File Structure

All files live under `C:\Users\Dana\projects\wbpl-admin\`.

```
supabase/migrations/
  002_seasons_constraints.sql       # Unique constraint on seasons.name

src/features/seasons/
  seasons.types.ts                  # Season, SeasonInput types
  seasons.schema.ts                 # zod schema for form validation
  seasons.queries.ts                # TanStack Query hooks
  SeasonsTable.tsx                  # Table view
  SeasonFormModal.tsx               # Create/Edit modal
  DeleteSeasonDialog.tsx            # Delete confirmation
  ActivateConflictDialog.tsx        # "Replace active season?" confirmation

src/pages/
  SeasonsPage.tsx                   # Page orchestrator

src/App.tsx                         # Wire up /seasons route
```

shadcn additions: `dialog`, `alert-dialog`, `select`.

---

### Task 1: Database — Add unique constraint on seasons.name

**Files:**
- Create: `supabase/migrations/002_seasons_constraints.sql`

- [ ] **Step 1: Create the migration file**

Create `C:\Users\Dana\projects\wbpl-admin\supabase\migrations\002_seasons_constraints.sql`:

```sql
-- Add unique constraint on seasons.name
alter table seasons add constraint seasons_name_unique unique (name);
```

- [ ] **Step 2: Apply migration in Supabase SQL Editor**

In the Supabase dashboard → **SQL Editor** → **New query**:
1. Paste the SQL above
2. Click **Run**

Expected: "Success. No rows returned"

- [ ] **Step 3: Commit migration file**

```bash
cd C:\Users\Dana\projects\wbpl-admin
git add supabase/migrations/002_seasons_constraints.sql
git commit -m "feat(db): unique constraint on seasons.name"
```

---

### Task 2: Install missing shadcn components

**Files:**
- Modify: `src/components/ui/dialog.tsx` (created by shadcn)
- Modify: `src/components/ui/alert-dialog.tsx` (created by shadcn)

- [ ] **Step 1: Install dialog, alert-dialog, select**

```bash
cd C:\Users\Dana\projects\wbpl-admin
npx shadcn@latest add dialog alert-dialog select --overwrite
```

- [ ] **Step 2: Verify build still works**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: add shadcn dialog, alert-dialog, select"
```

---

### Task 3: Types and zod schema

**Files:**
- Create: `src/features/seasons/seasons.types.ts`
- Create: `src/features/seasons/seasons.schema.ts`
- Create: `src/features/seasons/seasons.schema.test.ts`

- [ ] **Step 1: Create types**

Create `src/features/seasons/seasons.types.ts`:

```ts
import type { SeasonStatus } from '@/types/database.types';

export interface Season {
  id: string;
  name: string;
  start_date: string;            // ISO date 'YYYY-MM-DD'
  estimated_end_date: string | null;
  status: SeasonStatus;
}

export interface SeasonInput {
  name: string;
  start_date: string;
  estimated_end_date: string | null;
  status: SeasonStatus;
}
```

- [ ] **Step 2: Write failing schema test**

Create `src/features/seasons/seasons.schema.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { seasonSchema } from './seasons.schema';

describe('seasonSchema', () => {
  it('accepts valid input', () => {
    const result = seasonSchema.safeParse({
      name: '2025/26',
      start_date: '2025-10-01',
      estimated_end_date: '2026-05-31',
      status: 'active',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = seasonSchema.safeParse({
      name: '',
      start_date: '2025-10-01',
      estimated_end_date: null,
      status: 'future',
    });
    expect(result.success).toBe(false);
  });

  it('rejects name longer than 50 chars', () => {
    const result = seasonSchema.safeParse({
      name: 'a'.repeat(51),
      start_date: '2025-10-01',
      estimated_end_date: null,
      status: 'future',
    });
    expect(result.success).toBe(false);
  });

  it('rejects end_date before start_date', () => {
    const result = seasonSchema.safeParse({
      name: '2025/26',
      start_date: '2025-10-01',
      estimated_end_date: '2025-09-30',
      status: 'active',
    });
    expect(result.success).toBe(false);
  });

  it('accepts null estimated_end_date', () => {
    const result = seasonSchema.safeParse({
      name: '2025/26',
      start_date: '2025-10-01',
      estimated_end_date: null,
      status: 'future',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = seasonSchema.safeParse({
      name: '2025/26',
      start_date: '2025-10-01',
      estimated_end_date: null,
      status: 'banana',
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm test -- --run src/features/seasons/seasons.schema.test.ts
```

Expected: FAIL — "Failed to resolve import './seasons.schema'".

- [ ] **Step 4: Implement schema**

Create `src/features/seasons/seasons.schema.ts`:

```ts
import { z } from 'zod';

export const seasonSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'שם עונה הוא שדה חובה')
      .max(50, 'שם עונה ארוך מדי'),
    start_date: z.string().min(1, 'תאריך התחלה הוא שדה חובה'),
    estimated_end_date: z.string().nullable(),
    status: z.enum(['future', 'active', 'ended']),
  })
  .refine(
    (data) => {
      if (!data.estimated_end_date) return true;
      return data.estimated_end_date >= data.start_date;
    },
    {
      message: 'תאריך סיום חייב להיות אחרי תאריך התחלה',
      path: ['estimated_end_date'],
    }
  );

export type SeasonFormValues = z.infer<typeof seasonSchema>;
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- --run src/features/seasons/seasons.schema.test.ts
```

Expected: 6 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/features/seasons/
git commit -m "feat(seasons): add types and zod schema"
```

---

### Task 4: TanStack Query hooks

**Files:**
- Create: `src/features/seasons/seasons.queries.ts`
- Create: `src/features/seasons/seasons.queries.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/features/seasons/seasons.queries.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useSeasons } from './seasons.queries';

const orderMock = vi.fn();
const fromMock = vi.fn(() => ({ select: vi.fn(() => ({ order: orderMock })) }));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('useSeasons', () => {
  beforeEach(() => {
    fromMock.mockClear();
    orderMock.mockReset();
  });

  it('returns seasons sorted by start_date desc', async () => {
    orderMock.mockResolvedValue({
      data: [
        { id: '1', name: '2025/26', start_date: '2025-10-01', estimated_end_date: null, status: 'active' },
      ],
      error: null,
    });
    const { result } = renderHook(() => useSeasons(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].name).toBe('2025/26');
  });
});
```

Note: this test is `.test.tsx` because it uses JSX. Rename the file extension to `.test.tsx`.

Actually, simplify by using `React.createElement` so the file stays `.test.ts`:

Replace the `wrapper` definition with:

```ts
import React from 'react';
const wrapper = ({ children }: { children: ReactNode }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
};
```

Then the file can stay `.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --run src/features/seasons/seasons.queries.test.ts
```

Expected: FAIL — "Failed to resolve import './seasons.queries'".

- [ ] **Step 3: Implement queries**

Create `src/features/seasons/seasons.queries.ts`:

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Season, SeasonInput } from './seasons.types';

const KEY = ['seasons'];

export const useSeasons = () =>
  useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<Season[]> => {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .order('start_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Season[];
    },
  });

export const useActiveSeason = () =>
  useQuery({
    queryKey: [...KEY, 'active'],
    queryFn: async (): Promise<Season | null> => {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('status', 'active')
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Season | null;
    },
  });

export const useCreateSeason = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SeasonInput): Promise<Season> => {
      const { data, error } = await supabase
        .from('seasons')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Season;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUpdateSeason = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<SeasonInput> }): Promise<Season> => {
      const { data, error } = await supabase
        .from('seasons')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Season;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteSeason = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('seasons').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useGameCountForSeason = (seasonId: string | null) =>
  useQuery({
    queryKey: ['games', 'count-by-season', seasonId],
    enabled: !!seasonId,
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .eq('season_id', seasonId!);
      if (error) throw error;
      return count ?? 0;
    },
  });
```

- [ ] **Step 4: Run tests to verify pass**

```bash
npm test -- --run src/features/seasons/seasons.queries.test.ts
```

Expected: 1 test passes.

- [ ] **Step 5: Commit**

```bash
git add src/features/seasons/seasons.queries.ts src/features/seasons/seasons.queries.test.ts
git commit -m "feat(seasons): add tanstack query hooks for CRUD"
```

---

### Task 5: SeasonsTable component

**Files:**
- Create: `src/features/seasons/SeasonsTable.tsx`
- Create: `src/features/seasons/SeasonsTable.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/features/seasons/SeasonsTable.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SeasonsTable from './SeasonsTable';
import type { Season } from './seasons.types';

const seasons: Season[] = [
  { id: '1', name: '2025/26', start_date: '2025-10-01', estimated_end_date: '2026-05-31', status: 'active' },
  { id: '2', name: '2024/25', start_date: '2024-10-01', estimated_end_date: '2025-05-31', status: 'ended' },
];

describe('SeasonsTable', () => {
  it('renders all seasons', () => {
    render(<SeasonsTable seasons={seasons} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('2025/26')).toBeInTheDocument();
    expect(screen.getByText('2024/25')).toBeInTheDocument();
  });

  it('calls onEdit when edit clicked', async () => {
    const onEdit = vi.fn();
    render(<SeasonsTable seasons={seasons} onEdit={onEdit} onDelete={vi.fn()} />);
    const editButtons = screen.getAllByLabelText('עריכה');
    await userEvent.click(editButtons[0]);
    expect(onEdit).toHaveBeenCalledWith(seasons[0]);
  });

  it('calls onDelete when delete clicked', async () => {
    const onDelete = vi.fn();
    render(<SeasonsTable seasons={seasons} onEdit={vi.fn()} onDelete={onDelete} />);
    const deleteButtons = screen.getAllByLabelText('מחיקה');
    await userEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith(seasons[0]);
  });

  it('renders empty state when no seasons', () => {
    render(<SeasonsTable seasons={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/אין עונות/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test, verify failure**

```bash
npm test -- --run src/features/seasons/SeasonsTable.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement table**

Create `src/features/seasons/SeasonsTable.tsx`:

```tsx
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Season } from './seasons.types';

interface Props {
  seasons: Season[];
  onEdit: (s: Season) => void;
  onDelete: (s: Season) => void;
}

const STATUS_LABELS: Record<Season['status'], string> = {
  future: 'עתידית',
  active: 'פעילה',
  ended: 'הסתיימה',
};

const STATUS_VARIANTS: Record<Season['status'], 'default' | 'secondary' | 'outline'> = {
  future: 'outline',
  active: 'default',
  ended: 'secondary',
};

const formatDate = (iso: string | null): string => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const SeasonsTable = ({ seasons, onEdit, onDelete }: Props) => {
  if (seasons.length === 0) {
    return (
      <div className="border border-dashed rounded-lg py-16 text-center text-gray-500" dir="rtl">
        אין עונות במערכת. הוסיפי עונה חדשה.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden" dir="rtl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">שם</TableHead>
            <TableHead className="text-right">התחלה</TableHead>
            <TableHead className="text-right">סיום משוער</TableHead>
            <TableHead className="text-right">סטטוס</TableHead>
            <TableHead className="text-right w-32">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {seasons.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-semibold">{s.name}</TableCell>
              <TableCell>{formatDate(s.start_date)}</TableCell>
              <TableCell>{formatDate(s.estimated_end_date)}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANTS[s.status]}>{STATUS_LABELS[s.status]}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" aria-label="עריכה" onClick={() => onEdit(s)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="מחיקה" onClick={() => onDelete(s)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SeasonsTable;
```

- [ ] **Step 4: Install lucide-react if not present**

```bash
npm install lucide-react
```

- [ ] **Step 5: Run tests**

```bash
npm test -- --run src/features/seasons/SeasonsTable.test.tsx
```

Expected: 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/features/seasons/SeasonsTable.tsx src/features/seasons/SeasonsTable.test.tsx package.json package-lock.json
git commit -m "feat(seasons): add SeasonsTable component"
```

---

### Task 6: SeasonFormModal

**Files:**
- Create: `src/features/seasons/SeasonFormModal.tsx`
- Create: `src/features/seasons/SeasonFormModal.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/features/seasons/SeasonFormModal.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SeasonFormModal from './SeasonFormModal';

describe('SeasonFormModal', () => {
  it('renders empty form in create mode', () => {
    render(<SeasonFormModal open onOpenChange={vi.fn()} initialSeason={null} onSubmit={vi.fn()} submitting={false} />);
    expect(screen.getByLabelText(/שם/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /שמירה/i })).toBeInTheDocument();
  });

  it('pre-fills form in edit mode', () => {
    render(
      <SeasonFormModal
        open
        onOpenChange={vi.fn()}
        initialSeason={{
          id: '1', name: '2025/26', start_date: '2025-10-01',
          estimated_end_date: null, status: 'active',
        }}
        onSubmit={vi.fn()}
        submitting={false}
      />
    );
    expect(screen.getByLabelText(/שם/i)).toHaveValue('2025/26');
  });

  it('calls onSubmit with form values', async () => {
    const onSubmit = vi.fn();
    render(<SeasonFormModal open onOpenChange={vi.fn()} initialSeason={null} onSubmit={onSubmit} submitting={false} />);
    await userEvent.type(screen.getByLabelText(/שם/i), '2025/26');
    await userEvent.type(screen.getByLabelText(/תאריך התחלה/i), '2025-10-01');
    await userEvent.click(screen.getByRole('button', { name: /שמירה/i }));
    // status defaults to 'future'
    expect(onSubmit).toHaveBeenCalledWith({
      name: '2025/26',
      start_date: '2025-10-01',
      estimated_end_date: null,
      status: 'future',
    });
  });

  it('shows validation error for empty name', async () => {
    render(<SeasonFormModal open onOpenChange={vi.fn()} initialSeason={null} onSubmit={vi.fn()} submitting={false} />);
    await userEvent.type(screen.getByLabelText(/תאריך התחלה/i), '2025-10-01');
    await userEvent.click(screen.getByRole('button', { name: /שמירה/i }));
    expect(await screen.findByText(/שם עונה הוא שדה חובה/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Verify failure**

```bash
npm test -- --run src/features/seasons/SeasonFormModal.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement modal**

Create `src/features/seasons/SeasonFormModal.tsx`:

```tsx
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { seasonSchema, type SeasonFormValues } from './seasons.schema';
import type { Season, SeasonInput } from './seasons.types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSeason: Season | null;
  onSubmit: (input: SeasonInput) => void | Promise<void>;
  submitting: boolean;
}

const DEFAULTS: SeasonFormValues = {
  name: '',
  start_date: '',
  estimated_end_date: null,
  status: 'future',
};

const SeasonFormModal = ({ open, onOpenChange, initialSeason, onSubmit, submitting }: Props) => {
  const {
    register, handleSubmit, reset, control,
    formState: { errors },
  } = useForm<SeasonFormValues>({
    resolver: zodResolver(seasonSchema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (open) {
      reset(
        initialSeason
          ? {
              name: initialSeason.name,
              start_date: initialSeason.start_date,
              estimated_end_date: initialSeason.estimated_end_date,
              status: initialSeason.status,
            }
          : DEFAULTS
      );
    }
  }, [open, initialSeason, reset]);

  const submit = handleSubmit(async (values) => {
    const cleaned: SeasonInput = {
      ...values,
      estimated_end_date: values.estimated_end_date || null,
    };
    await onSubmit(cleaned);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialSeason ? 'עריכת עונה' : 'הוספת עונה'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">שם</Label>
            <Input id="name" {...register('name')} placeholder="2025/26" />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="start_date">תאריך התחלה</Label>
            <Input id="start_date" type="date" {...register('start_date')} />
            {errors.start_date && <p className="text-red-500 text-xs">{errors.start_date.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="estimated_end_date">תאריך סיום משוער</Label>
            <Input
              id="estimated_end_date"
              type="date"
              {...register('estimated_end_date', {
                setValueAs: (v) => (v === '' ? null : v),
              })}
            />
            {errors.estimated_end_date && (
              <p className="text-red-500 text-xs">{errors.estimated_end_date.message}</p>
            )}
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
                    <SelectItem value="future">עתידית</SelectItem>
                    <SelectItem value="active">פעילה</SelectItem>
                    <SelectItem value="ended">הסתיימה</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'שומר...' : 'שמירה'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SeasonFormModal;
```

- [ ] **Step 4: Run tests**

```bash
npm test -- --run src/features/seasons/SeasonFormModal.test.tsx
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/seasons/SeasonFormModal.tsx src/features/seasons/SeasonFormModal.test.tsx
git commit -m "feat(seasons): add SeasonFormModal component"
```

---

### Task 7: DeleteSeasonDialog

**Files:**
- Create: `src/features/seasons/DeleteSeasonDialog.tsx`
- Create: `src/features/seasons/DeleteSeasonDialog.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/features/seasons/DeleteSeasonDialog.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteSeasonDialog from './DeleteSeasonDialog';

const season = {
  id: '1', name: '2025/26', start_date: '2025-10-01',
  estimated_end_date: null, status: 'active' as const,
};

describe('DeleteSeasonDialog', () => {
  it('shows confirmation message with season name', () => {
    render(
      <DeleteSeasonDialog
        open
        onOpenChange={vi.fn()}
        season={season}
        gameCount={0}
        onConfirm={vi.fn()}
        deleting={false}
      />
    );
    expect(screen.getByText(/2025\/26/)).toBeInTheDocument();
  });

  it('blocks deletion when games exist', () => {
    render(
      <DeleteSeasonDialog
        open
        onOpenChange={vi.fn()}
        season={season}
        gameCount={5}
        onConfirm={vi.fn()}
        deleting={false}
      />
    );
    expect(screen.getByText(/לא ניתן למחוק/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /מחיקה/i })).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirmed', async () => {
    const onConfirm = vi.fn();
    render(
      <DeleteSeasonDialog
        open
        onOpenChange={vi.fn()}
        season={season}
        gameCount={0}
        onConfirm={onConfirm}
        deleting={false}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /מחיקה/i }));
    expect(onConfirm).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Verify failure**

```bash
npm test -- --run src/features/seasons/DeleteSeasonDialog.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement dialog**

Create `src/features/seasons/DeleteSeasonDialog.tsx`:

```tsx
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Season } from './seasons.types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  season: Season | null;
  gameCount: number;
  onConfirm: () => void;
  deleting: boolean;
}

const DeleteSeasonDialog = ({ open, onOpenChange, season, gameCount, onConfirm, deleting }: Props) => {
  if (!season) return null;
  const blocked = gameCount > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {blocked ? 'לא ניתן למחוק עונה' : `למחוק את עונה ${season.name}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {blocked
              ? `לא ניתן למחוק עונה עם משחקים (${gameCount}). מחקי קודם את המשחקים הקשורים.`
              : 'פעולה זו לא ניתנת לביטול.'}
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

export default DeleteSeasonDialog;
```

- [ ] **Step 4: Run tests**

```bash
npm test -- --run src/features/seasons/DeleteSeasonDialog.test.tsx
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/seasons/DeleteSeasonDialog.tsx src/features/seasons/DeleteSeasonDialog.test.tsx
git commit -m "feat(seasons): add DeleteSeasonDialog component"
```

---

### Task 8: ActivateConflictDialog

**Files:**
- Create: `src/features/seasons/ActivateConflictDialog.tsx`
- Create: `src/features/seasons/ActivateConflictDialog.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/features/seasons/ActivateConflictDialog.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActivateConflictDialog from './ActivateConflictDialog';

describe('ActivateConflictDialog', () => {
  it('shows existing active season name', () => {
    render(
      <ActivateConflictDialog
        open
        onOpenChange={vi.fn()}
        existingActiveName="2024/25"
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByText(/2024\/25/)).toBeInTheDocument();
  });

  it('calls onConfirm when confirmed', async () => {
    const onConfirm = vi.fn();
    render(
      <ActivateConflictDialog
        open
        onOpenChange={vi.fn()}
        existingActiveName="2024/25"
        onConfirm={onConfirm}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: /להמשיך/i }));
    expect(onConfirm).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Verify failure**

```bash
npm test -- --run src/features/seasons/ActivateConflictDialog.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement dialog**

Create `src/features/seasons/ActivateConflictDialog.tsx`:

```tsx
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingActiveName: string;
  onConfirm: () => void;
}

const ActivateConflictDialog = ({ open, onOpenChange, existingActiveName, onConfirm }: Props) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent dir="rtl">
      <AlertDialogHeader>
        <AlertDialogTitle>החלפת עונה פעילה</AlertDialogTitle>
        <AlertDialogDescription>
          עונה <strong>{existingActiveName}</strong> פעילה כעת. הפעלת עונה זו תסמן אותה כהסתיימה.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="gap-2">
        <AlertDialogCancel>ביטול</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>להמשיך</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ActivateConflictDialog;
```

- [ ] **Step 4: Run tests**

```bash
npm test -- --run src/features/seasons/ActivateConflictDialog.test.tsx
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/seasons/ActivateConflictDialog.tsx src/features/seasons/ActivateConflictDialog.test.tsx
git commit -m "feat(seasons): add ActivateConflictDialog component"
```

---

### Task 9: SeasonsPage orchestrator

**Files:**
- Create: `src/pages/SeasonsPage.tsx`

- [ ] **Step 1: Implement page**

Create `src/pages/SeasonsPage.tsx`:

```tsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useSeasons, useActiveSeason, useCreateSeason, useUpdateSeason,
  useDeleteSeason, useGameCountForSeason,
} from '@/features/seasons/seasons.queries';
import SeasonsTable from '@/features/seasons/SeasonsTable';
import SeasonFormModal from '@/features/seasons/SeasonFormModal';
import DeleteSeasonDialog from '@/features/seasons/DeleteSeasonDialog';
import ActivateConflictDialog from '@/features/seasons/ActivateConflictDialog';
import type { Season, SeasonInput } from '@/features/seasons/seasons.types';

const SeasonsPage = () => {
  const seasonsQ = useSeasons();
  const activeQ = useActiveSeason();
  const createM = useCreateSeason();
  const updateM = useUpdateSeason();
  const deleteM = useDeleteSeason();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Season | null>(null);
  const [deletingSeason, setDeletingSeason] = useState<Season | null>(null);
  const [pendingActivate, setPendingActivate] = useState<SeasonInput | null>(null);

  const gameCountQ = useGameCountForSeason(deletingSeason?.id ?? null);

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (s: Season) => {
    setEditing(s);
    setFormOpen(true);
  };

  const performSave = async (input: SeasonInput) => {
    if (editing) {
      await updateM.mutateAsync({ id: editing.id, input });
    } else {
      await createM.mutateAsync(input);
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (input: SeasonInput) => {
    // Activation conflict: setting status=active while another season is active
    const otherActive =
      activeQ.data && (!editing || editing.id !== activeQ.data.id) ? activeQ.data : null;
    if (input.status === 'active' && otherActive) {
      setPendingActivate(input);
      return;
    }
    await performSave(input);
  };

  const confirmActivateReplace = async () => {
    if (!pendingActivate || !activeQ.data) return;
    // Mark existing active as ended, then save the new one
    await updateM.mutateAsync({
      id: activeQ.data.id,
      input: { status: 'ended' },
    });
    await performSave(pendingActivate);
    setPendingActivate(null);
  };

  const confirmDelete = async () => {
    if (!deletingSeason) return;
    await deleteM.mutateAsync(deletingSeason.id);
    setDeletingSeason(null);
  };

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">עונות</h1>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 ml-1" />
          הוסף עונה
        </Button>
      </div>

      {seasonsQ.isLoading && <div className="text-gray-500">טוען...</div>}
      {seasonsQ.error && (
        <div className="text-red-600 bg-red-50 p-4 rounded">
          שגיאה בטעינת העונות. נסי לרענן את הדף.
        </div>
      )}
      {seasonsQ.data && (
        <SeasonsTable
          seasons={seasonsQ.data}
          onEdit={handleEdit}
          onDelete={(s) => setDeletingSeason(s)}
        />
      )}

      <SeasonFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        initialSeason={editing}
        onSubmit={handleSubmit}
        submitting={createM.isPending || updateM.isPending}
      />

      <DeleteSeasonDialog
        open={!!deletingSeason}
        onOpenChange={(open) => !open && setDeletingSeason(null)}
        season={deletingSeason}
        gameCount={gameCountQ.data ?? 0}
        onConfirm={confirmDelete}
        deleting={deleteM.isPending}
      />

      <ActivateConflictDialog
        open={!!pendingActivate}
        onOpenChange={(open) => !open && setPendingActivate(null)}
        existingActiveName={activeQ.data?.name ?? ''}
        onConfirm={confirmActivateReplace}
      />
    </div>
  );
};

export default SeasonsPage;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit -p tsconfig.app.json
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/SeasonsPage.tsx
git commit -m "feat(seasons): add SeasonsPage orchestrator"
```

---

### Task 10: Wire up route and end-to-end test

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace seasons placeholder route**

In `src/App.tsx`, find the line:

```tsx
<Route path="/seasons"      element={<Placeholder title="עונות" />} />
```

Replace with:

```tsx
<Route path="/seasons" element={<SeasonsPage />} />
```

And add the import at the top with the other page imports:

```tsx
import SeasonsPage from '@/pages/SeasonsPage';
```

- [ ] **Step 2: Run all tests**

```bash
npm test -- --run
```

Expected: all tests pass (around 20 tests total).

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Manual end-to-end test**

```bash
npm run dev
```

Then in the browser:
1. Log in to the admin app
2. Navigate to "עונות" in the sidebar
3. Click "הוסף עונה" — modal opens
4. Enter: name="2025/26", start_date=2025-10-01, status=active → save
5. Verify row appears in table with green "פעילה" badge
6. Click "הוסף עונה" again — name="2026/27", status=active → save
7. Confirmation dialog appears: "עונה 2025/26 פעילה כעת..." → click להמשיך
8. Verify 2025/26 now shows "הסתיימה", 2026/27 shows "פעילה"
9. Click pencil on 2025/26 — modal pre-fills correctly → cancel
10. Click trash on 2025/26 — confirmation dialog → click מחיקה
11. Verify row removed

If all 11 steps pass, the feature is complete.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up /seasons route to SeasonsPage"
```

---

## Summary

After all tasks complete, you will have:
- ✅ Seasons table with sortable list (newest first)
- ✅ Modal-based create/edit with full validation
- ✅ Delete confirmation that blocks if games exist
- ✅ Auto-rotation of active status (only one season active at a time)
- ✅ ~20 passing tests
- ✅ Live functioning page at `/seasons`
