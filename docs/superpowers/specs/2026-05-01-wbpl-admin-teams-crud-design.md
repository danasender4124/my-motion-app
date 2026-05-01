# WBPL Admin — Teams CRUD Design (Sub-project 2B)

## Goal
Build full CRUD management for teams in the wbpl-admin app — list, create, view profile, edit, manage league participation per season. Preserve historical team data permanently; "leaving the league" is a season-scoped action, not a deletion.

## Architecture

Three routes:
- `/teams` — card grid of teams (filtered by current season by default)
- `/teams/new` — full creation form
- `/teams/:id` — team profile with tabs (פרטי קבוצה + future placeholders + עונות)

Logo files live in Supabase Storage. The new `team_seasons` join table tracks which teams participate in each season — this allows teams to leave the league without losing historical data.

Data flow: TanStack Query for reads/writes. Forms use react-hook-form + zod. Supabase Storage SDK handles logo uploads.

## Data Model Changes

### New table: `team_seasons`
Tracks which teams participate in each season.

```sql
create table team_seasons (
  team_id uuid not null references teams(id) on delete cascade,
  season_id uuid not null references seasons(id) on delete cascade,
  primary key (team_id, season_id)
);

alter table team_seasons enable row level security;
create policy "authenticated_read" on team_seasons for select using (auth.role() = 'authenticated');
create policy "auth_write" on team_seasons for all using (auth.role() = 'authenticated');
```

### Storage bucket: `team-logos`
- Public read access (logos are displayed on public site)
- Authenticated write access
- Path convention: `team-logos/{team_id}/{filename}`

## UX

### List view (`/teams`)
- Card grid: 3 cols desktop / 2 cols tablet / 1 col mobile
- Each card:
  - Left edge: vertical color stripe (team color)
  - Logo (40×40, contain)
  - Team name (bold)
  - City (small, muted)
  - Status badge: "פעילה השנה" / "לא בליגה השנה" / "בהקמה"
- Click card → `/teams/:id`
- Top header:
  - "+ הוסף קבוצה" button → `/teams/new`
  - Search input (filter by name)
  - Toggle: "רק עונה נוכחית" (default ON) ↔ "כל הקבוצות"
- Empty state: "אין קבוצות במערכת. הוסיפי קבוצה חדשה."

### Create page (`/teams/new`)
- Heading: "הוספת קבוצה חדשה"
- Same field groups as the detail page form (see below)
- Submit button: "צור קבוצה"
- On success → navigate to `/teams/:id` of the new team
- Auto-add new team to active season's `team_seasons`

### Detail page (`/teams/:id`)
**Header:**
- Vertical color stripe (left edge)
- Logo (large, 80×80)
- Team name (h1)
- City + status (muted)
- "⋯" menu (top-right): "מחק קבוצה" (destructive)

**Tabs:**
- פרטי קבוצה (active by default)
- עונות (new — manage league participation)
- סגל (disabled placeholder, "בקרוב")
- צוות מקצועי (disabled placeholder)
- משחקים (disabled placeholder)
- תארים (disabled placeholder)

### Tab: פרטי קבוצה
Editable form, three field groups:

**1. פרטים בסיסיים:**
- שם (required, max 100 chars, unique)
- עיר (optional, max 50)
- כתובת אולם (optional, max 200)
- סטטוס: פעילה / בהקמה / לא פעילה / אחר

**2. מיתוג:**
- צבע — color picker + hex text input (e.g. `#FF4D00`)
- לוגו — upload button + preview (current or new); supports drag/drop optional

**3. קשר ורשתות:**
- אתר אינטרנט (optional, must be valid URL)
- טלפון (optional)
- אימייל (optional, must be valid email)
- Instagram URL (optional)
- Facebook URL (optional)
- YouTube URL (optional)
- X/Twitter URL (optional)

Footer: ביטול | שמירה (disabled until form is dirty)

### Tab: עונות
Lists all seasons the team has participated in:
| עונה | סטטוס בעונה | פעולות |
|------|--------------|---------|
| 2025/26 | פעילה | הוצא מהליגה |
| 2024/25 | היסטוריה | (no action) |

Below the list: "+ הוסף לעונה" button — opens a select with all seasons the team is NOT yet in.

"הוצא מהליגה" → confirmation dialog → deletes the row from `team_seasons` for that season. If games already exist for the team in that season, block the action with a clear error.

### Delete from "⋯" menu
Confirmation dialog: "למחוק את {team_name}? פעולה זו לא ניתנת לביטול."
- Block if any games reference the team (in any season)
- Block if any `player_team_seasons` rows exist (preserves historical roster integrity)
- If blocked: show alternative — "להסיר מהעונה הנוכחית במקום זאת? נתוני העבר יישמרו."

## Validation Rules
- `name`: required, trimmed, 1–100 chars, unique across teams
- `city`, `hall_address`: optional, trimmed
- `color`: optional, must match `^#[0-9A-Fa-f]{6}$` if provided
- `logo`: optional, max 2MB, jpg/png/webp/svg
- `website`, `instagram`, `facebook`, `youtube`, `twitter`: optional, must be valid URL if provided
- `email`: optional, must be valid email if provided
- `phone`: optional, free text (no strict format)
- `status`: must be one of `'active' | 'inactive' | 'forming' | 'other'`

## Database Constraints
Add unique constraint on `teams.name` (currently missing). Migration `003_teams_team_seasons.sql`:

```sql
alter table teams add constraint teams_name_unique unique (name);
-- + the team_seasons table from "Data Model Changes" above
```

## Permissions
All authenticated users can read/write (existing RLS). Storage bucket `team-logos`: public read, authenticated write.

## File Structure (new)

```
supabase/migrations/
  003_teams_team_seasons.sql    # team_seasons + unique on teams.name + storage bucket setup

src/features/teams/
  teams.types.ts                # Team, TeamInput, TeamSeason
  teams.schema.ts               # zod schema (with discriminated parts for branding/contact)
  teams.queries.ts              # TanStack Query hooks (CRUD + team_seasons + logo upload)
  TeamCard.tsx                  # List card component
  TeamsGrid.tsx                 # Grid layout with empty/loading states
  TeamForm.tsx                  # Shared form (used by /new and /:id detail tab)
  LogoUpload.tsx                # Logo upload + preview
  ColorPicker.tsx               # Color input with hex
  TeamSeasonsList.tsx           # עונות tab content
  TeamHeader.tsx                # Detail page header (logo, name, color stripe)
  DeleteTeamDialog.tsx          # Delete confirmation
  RemoveFromSeasonDialog.tsx    # Confirm "הוצא מהליגה"

src/pages/
  TeamsListPage.tsx             # /teams
  NewTeamPage.tsx               # /teams/new
  TeamDetailPage.tsx            # /teams/:id (uses tabs)

src/App.tsx                     # Wire up routes
```

## TanStack Query Hooks (`teams.queries.ts`)
- `useTeams(filter: 'current' | 'all')` — list, with current-season filter
- `useTeam(id)` — single team
- `useCreateTeam()` — mutation; auto-adds to active season's `team_seasons`
- `useUpdateTeam()` — mutation
- `useDeleteTeam()` — mutation; blocked if FK references exist
- `useUploadTeamLogo()` — Supabase Storage upload, returns public URL
- `useTeamSeasons(teamId)` — list seasons the team participates in
- `useAddTeamToSeason()` — adds row to `team_seasons`
- `useRemoveTeamFromSeason()` — deletes row from `team_seasons`; blocked if games exist
- `useTeamGameCount(teamId, seasonId?)` — used for delete/remove blocking checks

## Testing
- Unit tests for zod schema (URL validation, hex color, required fields)
- Component tests for `TeamCard`, `TeamsGrid`, `TeamForm`, `LogoUpload`, `TeamSeasonsList`
- Mock Supabase client and Storage in all tests
- Integration scenarios documented in plan: create → see in list → open detail → edit → save → remove from season → delete

## Out of Scope (later sub-projects)
- Roster management (סגל tab) — sub-project 2C (Players)
- Staff/Management assignment — sub-project 3
- Match list — sub-project 4
- Achievements — later
- Public site reading from this data — sub-project 6
