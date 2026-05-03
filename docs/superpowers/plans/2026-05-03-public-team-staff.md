# Public Team Staff Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "צוות מקצועי" section to the public team page (`/team/:id`) showing the head coach (with achievements badges) and the 4 support-staff roles.

**Architecture:** Two new hooks in `lib/queries.ts` reading from the admin's `coaches`/`coach_team_seasons`/`team_staff` tables (anon RLS already in place). One new component, rendered inside `TeamPage`.

**Tech Stack:** React 19, TypeScript, Vite, TanStack Query v5, Supabase JS SDK, Tailwind v4.

---

## File Structure

All paths under `C:\Users\Dana\projects\my-motion-app\`.

```
src/lib/queries.ts                       # MODIFY — types + 2 hooks
src/components/team/
  TeamCoachStaff.tsx                     # NEW
src/pages/TeamPage.tsx                   # MODIFY — render <TeamCoachStaff>
```

**Verification:** No test framework on this side. Each task verifies via `npm run build` and a final manual smoke check.

---

### Task 1: Add types + 2 hooks to `lib/queries.ts`

**Files:**
- Modify: `src/lib/queries.ts`

- [ ] **Step 1: Append types**

In `src/lib/queries.ts`, append:

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

- [ ] **Step 2: Append `useTeamHeadCoachPublic` hook**

```ts
export const useTeamHeadCoachPublic = (teamId: string | undefined) =>
  useQuery({
    queryKey: ['public_team_head_coach', teamId],
    enabled: !!teamId,
    queryFn: async (): Promise<PublicHeadCoach | null> => {
      const { data: activeSeason } = await supabase
        .from('seasons').select('id').eq('status', 'active').maybeSingle();
      const seasonId = (activeSeason as { id: string } | null)?.id ?? null;
      if (!seasonId) return null;

      const { data, error } = await supabase
        .from('coach_team_seasons')
        .select('coach:coaches(id, first_name, last_name, photo, nationality, achievements)')
        .eq('team_id', teamId!)
        .eq('season_id', seasonId)
        .maybeSingle();
      if (error) throw error;
      const row = (data ?? null) as { coach: { id: string; first_name: string; last_name: string; photo: string | null; nationality: string | null; achievements: CoachAchievements } | null } | null;
      if (!row?.coach) return null;
      return {
        id: row.coach.id,
        first_name: row.coach.first_name,
        last_name: row.coach.last_name,
        photo: row.coach.photo,
        nationality: row.coach.nationality,
        achievements: row.coach.achievements ?? { state_championships: 0, state_cups: 0, winner_cups: 0, european_cups: 0 },
      };
    },
  });
```

- [ ] **Step 3: Append `useTeamSupportStaffPublic` hook**

```ts
export const useTeamSupportStaffPublic = (teamId: string | undefined) =>
  useQuery({
    queryKey: ['public_team_staff', teamId],
    enabled: !!teamId,
    queryFn: async (): Promise<PublicStaffMember[]> => {
      const { data, error } = await supabase
        .from('team_staff')
        .select('id, role, first_name, last_name, photo')
        .eq('team_id', teamId!)
        .order('role', { ascending: true });
      if (error) throw error;
      return (data ?? []) as PublicStaffMember[];
    },
  });
```

- [ ] **Step 4: Verify build**

Run: `cd C:\Users\Dana\projects\my-motion-app && npm run build`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add src/lib/queries.ts
git commit -m "feat(public): add team head-coach and support-staff hooks

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Create `TeamCoachStaff` component

**Files:**
- Create: `src/components/team/TeamCoachStaff.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';
import { useTeamHeadCoachPublic, useTeamSupportStaffPublic, type PublicHeadCoach, type PublicStaffMember, type PublicStaffRole } from '../../lib/queries';

const STAFF_LABEL: Record<PublicStaffRole, string> = {
  assistant_coach:        'עוזר/ת מאמן/ת',
  strength_conditioning:  'מאמן/ת כושר',
  physiotherapist:        'פיזיותרפיסט/ית',
  team_manager:           'מנהל/ת קבוצה',
};

const initials = (first: string, last: string) =>
  (first?.[0] ?? '') + (last?.[0] ?? '');

const TrophyBadges: React.FC<{ a: PublicHeadCoach['achievements'] }> = ({ a }) => {
  const items: Array<{ icon: string; label: string; n: number }> = [
    { icon: '🏆', label: 'אליפות מדינה', n: a.state_championships },
    { icon: '🥇', label: 'גביע מדינה',   n: a.state_cups },
    { icon: '🏅', label: 'גביע ווינר',    n: a.winner_cups },
    { icon: '🌍', label: 'גביע אירופי',   n: a.european_cups },
  ].filter((x) => x.n > 0);
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((x) => (
        <span
          key={x.label}
          className="text-xs px-2 py-1 rounded-full font-bold"
          style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00' }}
        >
          {x.icon} {x.n} × {x.label}
        </span>
      ))}
    </div>
  );
};

const HeadCoachCard: React.FC<{ coach: PublicHeadCoach }> = ({ coach }) => (
  <div
    className="rounded-xl p-4 flex items-start gap-4"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
  >
    <div
      className="w-18 h-18 rounded-full overflow-hidden flex items-center justify-center shrink-0"
      style={{ background: 'rgba(255,255,255,0.06)', width: 72, height: 72 }}
    >
      {coach.photo
        ? <img src={coach.photo} alt={`${coach.first_name} ${coach.last_name}`} className="w-full h-full object-cover" />
        : <span className="text-base font-black" style={{ color: 'rgba(242,237,230,0.55)' }}>{initials(coach.first_name, coach.last_name)}</span>}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-base font-black" style={{ color: '#F2EDE6' }}>{coach.first_name} {coach.last_name}</div>
      {coach.nationality && (
        <div className="text-sm" style={{ color: 'rgba(242,237,230,0.55)' }}>{coach.nationality}</div>
      )}
      <TrophyBadges a={coach.achievements} />
    </div>
  </div>
);

const StaffCard: React.FC<{ m: PublicStaffMember }> = ({ m }) => (
  <div
    className="rounded-xl p-3 flex items-center gap-3"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
  >
    <div
      className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0"
      style={{ background: 'rgba(255,255,255,0.06)' }}
    >
      {m.photo
        ? <img src={m.photo} alt={`${m.first_name} ${m.last_name}`} className="w-full h-full object-cover" />
        : <span className="text-xs font-black" style={{ color: 'rgba(242,237,230,0.55)' }}>{initials(m.first_name, m.last_name)}</span>}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs" style={{ color: 'rgba(242,237,230,0.55)' }}>{STAFF_LABEL[m.role]}</div>
      <div className="text-sm font-semibold truncate" style={{ color: '#F2EDE6' }}>{m.first_name} {m.last_name}</div>
    </div>
  </div>
);

interface Props { teamId: string }

const TeamCoachStaff: React.FC<Props> = ({ teamId }) => {
  const coachQ = useTeamHeadCoachPublic(teamId);
  const staffQ = useTeamSupportStaffPublic(teamId);

  const coach = coachQ.data ?? null;
  const staff = staffQ.data ?? [];

  if (!coach && staff.length === 0) return null;

  return (
    <div dir="rtl" className="space-y-4">
      <h2 className="text-xl font-black" style={{ color: '#F2EDE6' }}>צוות מקצועי</h2>
      {coach && <HeadCoachCard coach={coach} />}
      {staff.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {staff.map((m) => <StaffCard key={m.id} m={m} />)}
        </div>
      )}
    </div>
  );
};

export default TeamCoachStaff;
```

- [ ] **Step 2: Verify build**

Run: `npm run build` — expect success.

- [ ] **Step 3: Commit**

```bash
git add src/components/team/TeamCoachStaff.tsx
git commit -m "feat(public): add TeamCoachStaff component

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Render `TeamCoachStaff` in `TeamPage`

**Files:**
- Modify: `src/pages/TeamPage.tsx`

- [ ] **Step 1: Add the import**

Near the existing `import TeamLeaders from '../components/team/TeamLeaders';` line, add:

```tsx
import TeamCoachStaff from '../components/team/TeamCoachStaff';
```

- [ ] **Step 2: Render the section**

The page currently renders sections in this order (within the `<main>` body):

```tsx
<TeamHeader team={team} />
{statsQ.data && <TeamQuickStats stats={statsQ.data} />}
{leadersQ.data && <TeamLeaders leaders={leadersQ.data} />}
<TeamRoster players={rosterQ.data ?? []} />
<TeamSchedule games={gamesQ.data ?? []} teamId={team.id} />
<TeamContact team={team} />
```

After the `<TeamLeaders>` line (if-rendered), insert:

```tsx
<TeamCoachStaff teamId={team.id} />
```

So the full sequence becomes:

```tsx
<TeamHeader team={team} />
{statsQ.data && <TeamQuickStats stats={statsQ.data} />}
{leadersQ.data && <TeamLeaders leaders={leadersQ.data} />}
<TeamCoachStaff teamId={team.id} />
<TeamRoster players={rosterQ.data ?? []} />
<TeamSchedule games={gamesQ.data ?? []} teamId={team.id} />
<TeamContact team={team} />
```

- [ ] **Step 3: Verify build**

Run: `npm run build` — expect success.

- [ ] **Step 4: Manual smoke check**

Run: `npm run dev`. Visit `/team/<some-team-uuid>` for a team that has at least one of: a head coach for the active season, or any team_staff rows. Verify the section renders with the expected items, and is hidden when both are empty.

- [ ] **Step 5: Push**

```bash
git add src/pages/TeamPage.tsx
git commit -m "feat(public): render TeamCoachStaff on team page

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push
```

- [ ] **Step 6: Production check**

Wait ~2 minutes for GitHub Pages deploy, then visit `https://wbpl.co.il/team/<id>` for a team with assigned coach/staff and confirm the section appears.
