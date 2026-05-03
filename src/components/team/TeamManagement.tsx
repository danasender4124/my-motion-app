import React from 'react';
import { useTeamManagementPublic, type PublicManagementRole } from '../../lib/queries';

const ROLE_LABEL: Record<PublicManagementRole, string> = {
  chairman:                'יו״ר',
  general_manager:         'מנכ״ל',
  basketball_operations:   'מנהל מקצועי',
  media_manager:           'מנהל מדיה',
  community_coordinator:   'רכז קהילה',
};

interface Props { teamId: string }

const TeamManagement: React.FC<Props> = ({ teamId }) => {
  const { data } = useTeamManagementPublic(teamId);
  const rows = data ?? [];
  if (rows.length === 0) return null;

  return (
    <div dir="rtl" className="space-y-4">
      <h2 className="text-xl font-black" style={{ color: '#F2EDE6' }}>הנהלה</h2>
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <ul className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {rows.map((m, i) => (
            <li
              key={m.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
              style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined }}
            >
              <span style={{ color: 'rgba(242,237,230,0.55)' }}>{ROLE_LABEL[m.role]}</span>
              <span className="font-semibold" style={{ color: '#F2EDE6' }}>{m.first_name} {m.last_name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TeamManagement;
