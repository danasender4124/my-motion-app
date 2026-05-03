# Public Site — Team Staff Section (Sub-project 8B)

## Goal
Add a "צוות מקצועי" section to the public team page (`/team/:id`) showing the team's head coach (with photo, name, nationality, and 4 trophy counts) plus the support staff (4 roles: assistant coach, S&C, physiotherapist, team manager).

## Architecture
Read directly from Supabase using the existing anon RLS policies on `coaches`, `coach_team_seasons`, and `team_staff`. Two new hooks in `lib/queries.ts`. One new component, embedded as a new section in the existing `TeamPage`.

## Routes
- `/team/:id` — modified (one new section)

## UX

### `TeamCoachStaff` component
Rendered after `TeamLeaders` (or in its place if there are no leaders to show). Layout:

**Sub-section: מאמן/ת ראשי/ת**
- If a head coach is assigned for the active season:
  - Card with photo (72×72 circle), name, nationality below in muted text
  - Below the name: 4 trophy badges (only badges with count > 0 are shown):
    - 🏆 אליפות מדינה — `state_championships`
    - 🥇 גביע מדינה — `state_cups`
    - 🏅 גביע ווינר — `winner_cups`
    - 🌍 גביע אירופי — `european_cups`
  - Each badge: orange pill with count + label (e.g. "3 × אליפות מדינה")
- If no head coach assigned: section omitted entirely (don't show empty placeholder)

**Sub-section: צוות תומך**
- 2×2 grid (1×4 on mobile) of cards, one per filled role
- Each card: small photo + name + role label
- Roles with no record are omitted (no empty slots)
- If no support staff for the team: sub-section omitted

If both sub-sections are empty (no head coach and no staff), the entire `TeamCoachStaff` section is hidden.

### Theme
Consistent with the rest of public theme: `#07080C` bg, `#FF4D00` accent, `#F2EDE6` text, `rgba(255,255,255,0.04)` surfaces, RTL.

## Data Flow

### New types in `lib/queries.ts`

```ts
export interface CoachAchievements {
  state_championships: number;
  state_cups: number;
  winner_cups: number;
  european_cups: number;
}

export interface PublicHeadCoach {
  id: string;
  first_name: string;
  last_name: string;
  photo: string | null;
  nationality: string | null;
  achievements: CoachAchievements;
}

export type PublicStaffRole = 'assistant_coach' | 'strength_conditioning' | 'physiotherapist' | 'team_manager';

export interface PublicStaffMember {
  id: string;
  role: PublicStaffRole;
  first_name: string;
  last_name: string;
  photo: string | null;
}
```

### New hooks

- `useTeamHeadCoachPublic(teamId)` — fetches the active-season head coach for a team via `coach_team_seasons` join `coaches`. Returns `PublicHeadCoach | null`.
- `useTeamSupportStaffPublic(teamId)` — fetches `team_staff` rows for the team. Returns `PublicStaffMember[]`.

Active season is resolved inside each hook (same pattern used by other team hooks).

## File Structure

```
my-motion-app/
└── src/
    ├── lib/
    │   └── queries.ts                  # MODIFY — add types + 2 hooks
    ├── components/
    │   └── team/
    │       └── TeamCoachStaff.tsx      # NEW
    └── pages/
        └── TeamPage.tsx                # MODIFY — render <TeamCoachStaff>
```

## Permissions
Existing `anon_read` RLS policies on `coaches`, `coach_team_seasons`, and `team_staff` cover all reads.

## Out of Scope
- Public coach profile page (would parallel `/player/:id`) — not requested
- Linking coach to a list of past teams
- Filtering achievements by year
- Per-staff bio
