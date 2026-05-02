# WBPL Admin — Players CRUD Design (Sub-project 2C)

## Goal
Build full management for players — list with advanced filters, create with team/season assignment, profile with details + season history, edit, photo upload, and delete with safeguards.

## Architecture

Three routes:
- `/players` — table with filters (season, team, position, classification, status, nationality)
- `/players/new` — full creation form (includes initial team + jersey number)
- `/players/:id` — profile with tabs (פרטי שחקנית / היסטוריית קבוצות + future placeholders)

Photos live in Supabase Storage. Player ↔ team-season relationships go through the existing `player_team_seasons` table (already in schema). Age is computed from `birth_date` at render time.

Data flow: TanStack Query for reads/writes. Forms use react-hook-form + zod. Country list is provided by the `i18n-iso-countries` library localized to Hebrew (closed list selectable via dropdown).

## Data Model Changes

### Players table
Add new fields:

```sql
alter table players add column photo text;
alter table players add column classification text not null default 'israeli'
  check (classification in ('israeli', 'naturalized', 'foreign', 'bosman'));

-- Update status check constraint: replace 'loaned'/'foreign'/'israeli' semantics
-- with operational-only states. Existing rows with old values must be migrated first.
update players set status = 'active' where status in ('foreign', 'israeli');
update players set status = 'college' where status = 'loaned';
alter table players drop constraint players_status_check;
alter table players add constraint players_status_check
  check (status in ('active', 'injured', 'college', 'youth', 'inactive', 'other'));
```

### Storage bucket
`player-photos` — public read, authenticated write (same policies as `team-logos`).

## UX

### List view (`/players`)
- Top header: title "שחקניות", "+ הוסף שחקנית" button → `/players/new`
- Search input (filter by first/last name)
- Filter row (compact, all dropdowns):
  - **עונה** — defaults to active season; "כל העונות" option
  - **קבוצה** — defaults to "כל הקבוצות"
  - **עמדה** — "כל העמדות"
  - **סיווג** — "כל הסיווגים"
  - **סטטוס** — "כל הסטטוסים"
  - **לאום** — "כל המדינות" (dropdown of countries in Hebrew)
- Table columns:
  | תמונה (40px circle) | שם | קבוצה | עמדה | מס׳ | גיל | גובה | לאום | סיווג | סטטוס |
- Sortable columns (click header).
- Click row → `/players/:id`.
- Empty state: "אין שחקניות במערכת. הוסיפי שחקנית חדשה."

### Create page (`/players/new`)
Sections:

**1. פרטים אישיים**
- שם פרטי (required, max 50)
- שם משפחה (required, max 50)
- תאריך לידה (date)
- גובה (integer, cm, optional)
- תמונה (photo upload, optional, ≤2MB jpg/png/webp)

**2. שיוך וזהות**
- לאום — country dropdown (single value)
- ארץ מוצא — country dropdown (single value, optional)
- סיווג — required, one of: ישראלית / מתאזרחת / זרה / בוסמנית
- עמדה — one of: גארד מוביל / שוטינג גארד / חלוצה קלה / חלוצה כבדה / מרכזת
- סטטוס — defaults to "פעילה"

**3. שיוך לקבוצה (יוצר רשומה ב-`player_team_seasons` בעונה הפעילה)**
- קבוצה — dropdown of all teams (required)
- מספר חולצה — integer 0–99 (optional)

Submit "צור שחקנית" → redirects to `/players/:id`.

### Detail page (`/players/:id`)
**Header (compact, no logo):**
- Photo (80×80 circle) — initials fallback if no photo
- Name (h1)
- One-line summary: `{team_name} · #{jersey} · {position_label} · {age}`
- Second line: `{classification_label} · {nationality}`
- "⋯" menu: "מחק שחקנית"

**Tabs:**
- **פרטי שחקנית** — read-only by default with "ערוך" toggle (same pattern as TeamDetailPage)
- **היסטוריית קבוצות** — full season-by-season list (table format)
- סטטיסטיקה (disabled, "בקרוב")
- תארים (disabled, "בקרוב")

**Tab "פרטי שחקנית":** Same fields as create page sections 1+2 (no team/jersey here — those are managed in history tab).

**Tab "היסטוריית קבוצות":**
| עונה | קבוצה | מספר חולצה | פעולות |
|------|-------|------------|---------|
| 2025/26 | ב. פ"ת | 23 | ערוך מספר · הסר |
| 2024/25 | מ. אשדוד | 8 | הסר |

Below: "+ הוסף לעונה" — opens dialog with season + team + jersey number selects (only seasons the player isn't already in).

**Edit jersey number:** inline dialog with number input, saves to `player_team_seasons`.

**Remove from season:** confirmation dialog. If `player_game_stats` rows exist for this player+season, block with message: "לא ניתן להסיר משחקים שכבר נוגנו. מחקי קודם את הסטטיסטיקות הקשורות."

### Delete from "⋯" menu
Confirmation dialog: "למחוק את {name}? פעולה זו לא ניתנת לביטול."
- Block if `player_game_stats` rows exist (preserves historical stats)
- If blocked: show alternative — "להסיר מהעונה הנוכחית במקום זאת? נתוני העבר יישמרו."

## Validation Rules

- `first_name`, `last_name`: required, trimmed, 1–50 chars
- `birth_date`: optional valid date; if set, age must be 13–60 (sanity bounds)
- `height`: integer 130–230 cm or null
- `nationality`, `country_of_origin`: must be ISO 3166-1 alpha-2 country code if set
- `position`: must be one of the 5 enum values if set
- `classification`: required, must be one of: `'israeli' | 'naturalized' | 'foreign' | 'bosman'`
- `status`: required, must be one of: `'active' | 'injured' | 'college' | 'youth' | 'inactive' | 'other'`
- `photo`: max 2MB, jpg/png/webp/svg
- `jersey_number` (in player_team_seasons): integer 0–99 or null
- Player can have at most one row per (team_id, season_id) — enforced by primary key

## Database Constraints

Migration `005_players_classification_photo.sql` covers all DB changes including the data migration step for status values.

## Permissions

All authenticated users can read/write (existing RLS). Storage bucket `player-photos`: public read, authenticated write (mirrors team-logos policies).

## File Structure

```
supabase/migrations/
  005_players_classification_photo.sql   # photo + classification + status migration + storage bucket

src/lib/
  countries.ts                           # ISO country code → Hebrew name lookup (uses i18n-iso-countries)

src/features/players/
  players.types.ts                       # Player, PlayerInput, PlayerClassification, PlayerSeason
  players.schema.ts                      # zod schema for create + edit
  players.queries.ts                     # TanStack Query hooks
  PlayersTable.tsx                       # Table with sortable columns
  PlayersFilters.tsx                     # Filter row
  PlayerForm.tsx                         # Shared form for new + edit
  PhotoUpload.tsx                        # Photo upload + preview (small reusable wrapper)
  CountrySelect.tsx                      # Country dropdown using countries.ts
  PlayerHeader.tsx                       # Profile header (photo + name + summary)
  PlayerSeasonsTable.tsx                 # היסטוריית קבוצות table
  AddPlayerSeasonDialog.tsx              # "+ הוסף לעונה" dialog
  EditJerseyDialog.tsx                   # Inline jersey-number edit
  RemovePlayerSeasonDialog.tsx           # Remove from season confirmation
  DeletePlayerDialog.tsx                 # Delete confirmation

src/pages/
  PlayersListPage.tsx                    # /players
  NewPlayerPage.tsx                      # /players/new
  PlayerDetailPage.tsx                   # /players/:id

src/App.tsx                              # Wire up 3 routes
```

## TanStack Query Hooks (`players.queries.ts`)

- `usePlayers(filters)` — list with combined filters (season, team, position, classification, status, nationality, name search). Joins `player_team_seasons` for current-season team/jersey display.
- `usePlayer(id)` — single player by id
- `useCreatePlayer()` — creates player, then inserts initial `player_team_seasons` row
- `useUpdatePlayer()` — partial player update (no team-season changes)
- `useDeletePlayer()` — blocked if `player_game_stats` rows exist
- `useUploadPlayerPhoto()` — uploads to `player-photos` bucket, returns public URL
- `usePlayerSeasons(playerId)` — list of (player, team, season, jersey_number) rows joined with seasons + teams
- `useAddPlayerSeason()` — insert into `player_team_seasons`
- `useUpdatePlayerJersey()` — update jersey_number for a (player, team, season) row
- `useRemovePlayerSeason()` — delete row; blocked if game stats exist
- `usePlayerStatsCount(playerId, seasonId?)` — count from `player_game_stats`

## Testing

- Unit tests for zod schema (validation rules)
- Component tests for `PlayersTable`, `PlayersFilters`, `PlayerForm`, `PhotoUpload`, `CountrySelect`, `PlayerSeasonsTable`
- Mock Supabase client + Storage in all tests
- Country list test: ensure Hebrew names load and "Israel" maps to "ישראל"

## Out of Scope (later sub-projects)

- Per-game statistics — sub-project 4
- Achievements — later
- Importing rosters in bulk — later enhancement
