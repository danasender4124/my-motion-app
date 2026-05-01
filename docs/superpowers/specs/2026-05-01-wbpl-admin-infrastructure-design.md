# WBPL Admin — Infrastructure Design (Sub-project 1)

## Goal
Build the infrastructure for an internal league management system for ליגת אתנה וינר בכדורסל לנשים. This is a separate application from the public website (wbpl.co.il), which will eventually consume data from this system.

## Architecture

### Two separate systems
- **wbpl.co.il** — existing public-facing static React site (unchanged for now)
- **wbpl-admin** — new internal management app, accessible only to authorized league staff

### Tech Stack
- React 19 + TypeScript + Vite
- shadcn/ui (tables, forms, dialogs, filters)
- Tailwind CSS v4
- React Router v7
- Supabase JS SDK (database + auth)
- TanStack Query (server state + caching)
- react-hook-form + zod (form validation)

### Hosting
- Admin app → Vercel (free tier, auto-deploy from GitHub)
- Database → Supabase (free tier: 500MB, 50K rows)
- New GitHub repo: `wbpl-admin`

---

## Database Schema

### Core tables

```sql
seasons (
  id uuid PRIMARY KEY,
  name text NOT NULL,              -- e.g. '2025/26'
  start_date date NOT NULL,
  estimated_end_date date,         -- not fixed; depends on playoff outcomes
  status text NOT NULL             -- 'future' | 'active' | 'ended'
)

teams (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  city text,
  hall_address text,
  color text,                      -- hex color e.g. '#005BAA'
  logo text,                       -- URL
  website text,
  social_links jsonb,              -- { facebook, instagram, youtube }
  contact jsonb,                   -- { phone, email }
  status text NOT NULL             -- 'active' | 'inactive' | 'forming' | 'other'
)

players (
  id uuid PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  birth_date date,
  nationality text,
  country_of_origin text,
  height integer,                  -- cm
  position text,                   -- 'point_guard' | 'shooting_guard' | 'small_forward' | 'power_forward' | 'center'
  status text NOT NULL             -- 'active' | 'injured' | 'loaned' | 'foreign' | 'israeli' | 'youth' | 'inactive' | 'other'
)

staff (
  id uuid PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  birth_date date,
  role_type text NOT NULL,         -- 'head_coach' | 'assistant_coach' | 'fitness_coach' | 'physio' | 'team_manager' | 'scout' | 'doctor' | 'other'
  status text NOT NULL             -- 'active' | 'inactive' | 'moved' | 'other'
)

management (
  id uuid PRIMARY KEY,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role_type text NOT NULL,         -- 'chairman' | 'ceo' | 'sport_director' | 'board_member' | 'owner' | 'ops_manager' | 'marketing_manager' | 'other'
  status text NOT NULL             -- 'active' | 'inactive' | 'other'
)

games (
  id uuid PRIMARY KEY,
  season_id uuid REFERENCES seasons,
  round text,
  date date,
  time time,
  home_team_id uuid REFERENCES teams,
  away_team_id uuid REFERENCES teams,
  hall text,
  status text NOT NULL,            -- 'scheduled' | 'postponed' | 'played' | 'cancelled'
  home_score integer,
  away_score integer,
  quarter_scores jsonb,            -- [{ q: 1, home: 22, away: 18 }, ...]
  referees text[],
  watch_url text,
  stats_url text,
  video_url text
)
```

### Relationship tables (preserve history across seasons)

```sql
player_team_seasons (
  player_id uuid REFERENCES players,
  team_id uuid REFERENCES teams,
  season_id uuid REFERENCES seasons,
  jersey_number integer,
  PRIMARY KEY (player_id, team_id, season_id)
)

staff_team_seasons (
  staff_id uuid REFERENCES staff,
  team_id uuid REFERENCES teams,
  season_id uuid REFERENCES seasons,
  role text,
  PRIMARY KEY (staff_id, team_id, season_id)
)

mgmt_team_seasons (
  management_id uuid REFERENCES management,
  team_id uuid REFERENCES teams,
  season_id uuid REFERENCES seasons,
  role text,
  PRIMARY KEY (management_id, team_id, season_id)
)
```

### Statistics

```sql
player_game_stats (
  id uuid PRIMARY KEY,
  player_id uuid REFERENCES players,
  game_id uuid REFERENCES games,
  team_id uuid REFERENCES teams,
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
  efficiency integer               -- calculated: pts + reb + ast + stl + blk - turnovers - missed shots
)
```

### Achievements

```sql
achievements (
  id uuid PRIMARY KEY,
  entity_type text NOT NULL,       -- 'player' | 'staff' | 'management' | 'team'
  entity_id uuid NOT NULL,
  season_id uuid REFERENCES seasons,
  team_id uuid REFERENCES teams,
  type text NOT NULL,              -- 'league_title' | 'state_cup' | 'winner_cup' | 'personal' | 'team_other'
  notes text
)
```

### User roles

```sql
user_roles (
  user_id uuid REFERENCES auth.users,
  role text NOT NULL,              -- 'admin' | 'league_manager' | 'team_rep' | 'editor' | 'viewer'
  team_id uuid REFERENCES teams,   -- null for admin/league_manager; set for team_rep
  PRIMARY KEY (user_id)
)
```

---

## Key Design Decisions

**History preservation:** Players, staff, and management are never deleted. Season assignments are stored in relationship tables, so the same person can be linked to different teams in different seasons without losing past data.

**Estimated end date:** Season `estimated_end_date` is nullable and advisory — actual end depends on playoff series outcomes.

**Statistics calculated fields:** `efficiency` and per-game averages (ppg, rpg, apg) are computed from raw counts, not stored separately.

**Row Level Security (Supabase RLS):** `team_rep` role can only read/write rows where `team_id` matches their assigned team. `viewer` role is read-only across all data.

---

## Screens (to be built in subsequent sub-projects)

1. Dashboard (league overview)
2. Seasons management
3. Teams list + team profile
4. Players list + player profile + stats
5. Staff list + staff profile
6. Management list + management profile
7. Games list + game detail + stats entry
8. Achievements & titles
9. Statistics dashboards + filters
10. User management (admin only)
