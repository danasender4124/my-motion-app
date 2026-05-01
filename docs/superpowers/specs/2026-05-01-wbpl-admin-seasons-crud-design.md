# WBPL Admin — Seasons CRUD Design (Sub-project 2A)

## Goal
Build full CRUD management for seasons in the wbpl-admin app — the foundational entity that every other record (teams, players, games) is scoped to.

## Architecture

Single page at `/seasons` shows a sortable table of all seasons. A modal handles create/edit. Delete uses a confirmation dialog. The `seasons` table already exists in Supabase with fields: `id`, `name`, `start_date`, `estimated_end_date`, `status`.

Data flow: TanStack Query reads from Supabase, mutations invalidate the query cache to refresh the list. Form validation uses zod + react-hook-form.

## UX

### List view (`/seasons`)
- Table with 5 columns: שם · התחלה · סיום משוער · סטטוס · פעולות
- Sorted by `start_date` descending (newest first)
- Status badge: 🟢 active (orange/green), 🔵 future (blue), gray "ended"
- Header: "+ הוסף עונה" button (top-right in RTL)
- Loading state: skeleton rows
- Empty state: "אין עונות במערכת. הוסיפי עונה חדשה."
- Error state: alert with retry button

### Create/Edit modal
Triggered by "+ הוסף עונה" or row edit ✏️ icon. Fields:
- **שם** (required, unique) — text input, free format e.g. "2025/26"
- **תאריך התחלה** (required) — date picker
- **תאריך סיום משוער** (optional) — date picker, must be after start_date
- **סטטוס** (required) — select: עתידית / פעילה / הסתיימה

Footer: ביטול | שמירה buttons. Submit disabled while pending.

### Active-status conflict
When user selects status "פעילה" and another season is already active:
1. Submit triggers a confirmation dialog: "עונה {existing.name} פעילה כעת. הפעלת עונה זו תסמן אותה כהסתיימה. להמשיך?"
2. On confirm: server updates both records atomically (RPC function or transaction).
3. On cancel: form remains open with no changes saved.

### Delete
Click 🗑️ → confirmation dialog: "למחוק את עונה {name}? פעולה זו לא ניתנת לביטול."
- If `games` table has rows referencing this season → block deletion, show message: "לא ניתן למחוק עונה עם משחקים. מחקי קודם את המשחקים הקשורים."
- Otherwise: delete and refresh list.

## Validation Rules
- `name`: required, trimmed, 1–50 chars, unique across all seasons
- `start_date`: required, valid date
- `estimated_end_date`: optional; if set, must be ≥ start_date
- `status`: must be one of `'future' | 'active' | 'ended'`

## Database Constraints
Add a unique constraint on `seasons.name` (currently missing). Migration `002_seasons_constraints.sql`:

```sql
alter table seasons add constraint seasons_name_unique unique (name);
```

## Permissions
For this sub-project, all authenticated users can read/write seasons (existing RLS policies). Role-based restrictions (admin/league_manager only for writes) will be added in a later sub-project that handles per-role permissions globally.

## File Structure (new)

```
src/
├── pages/
│   └── SeasonsPage.tsx              # Main list page
├── features/
│   └── seasons/
│       ├── SeasonsTable.tsx         # Table component
│       ├── SeasonFormModal.tsx      # Create/Edit modal
│       ├── DeleteSeasonDialog.tsx   # Delete confirmation
│       ├── ActivateConflictDialog.tsx  # "Replace active season?" dialog
│       ├── seasons.queries.ts       # TanStack Query hooks
│       ├── seasons.schema.ts        # zod schema for form
│       └── seasons.types.ts         # TS types (Season, SeasonInput)
└── components/
    └── ui/                          # shadcn additions: dialog, alert-dialog
```

`SeasonsPage` orchestrates: it owns the modal/dialog open state and renders `SeasonsTable` plus the modals/dialogs. Each component has one responsibility.

## TanStack Query Hooks (in `seasons.queries.ts`)
- `useSeasons()` — list all, sorted by start_date desc
- `useCreateSeason()` — mutation, invalidates list on success
- `useUpdateSeason()` — mutation, invalidates list on success
- `useDeleteSeason()` — mutation, invalidates list on success

## Testing
- Unit tests for zod schema (valid/invalid inputs)
- Component test for `SeasonFormModal` — renders fields, validates, submits
- Component test for `SeasonsTable` — renders rows, calls handlers
- Mock Supabase in all tests via `vi.mock('@/lib/supabase')`
