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
      className="rounded-full overflow-hidden flex items-center justify-center shrink-0"
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
