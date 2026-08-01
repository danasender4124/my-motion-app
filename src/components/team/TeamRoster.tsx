import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { RosterPlayer } from '../../lib/queries';
import { playerFullName } from '../../lib/displayName';
import SectionTitle from '../ui/SectionTitle';

const POSITION_LABEL: Record<NonNullable<RosterPlayer['position']>, string> = {
  point_guard: 'PG',
  shooting_guard: 'G',
  small_forward: 'F',
  power_forward: 'PF',
  center: 'C',
};

const initials = (first: string, last: string) =>
  (first?.[0] ?? '') + (last?.[0] ?? '');

interface Props { players: RosterPlayer[] }

const TeamRoster: React.FC<Props> = ({ players }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  if (players.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: 'rgba(242,237,230,0.4)' }} dir={dir}>
        {t('team.no_roster')}
      </div>
    );
  }
  return (
    <div dir={dir}>
      <SectionTitle>{t('team.roster')}</SectionTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {players.map((p) => (
          <Link
            key={p.id}
            to={`/player/${p.id}`}
            className="rounded-xl p-3 flex flex-col items-center gap-2 transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              {p.photo
                ? <img src={p.photo} alt={`${p.first_name} ${p.last_name}`} loading="lazy" className="w-full h-full object-cover" style={{ objectPosition: 'center top' }} />
                : <span className="text-base font-black" style={{ color: 'rgba(242,237,230,0.55)' }}>{initials(p.first_name, p.last_name)}</span>}
            </div>
            <div className="text-xs font-black" style={{ color: '#FF4D00' }}>
              {p.jersey_number != null ? `#${p.jersey_number}` : '—'}
              {p.position && <span className="mr-2" style={{ color: 'rgba(242,237,230,0.5)' }}>{POSITION_LABEL[p.position]}</span>}
            </div>
            <div className="text-sm font-semibold text-center truncate w-full" style={{ color: '#F2EDE6' }}>
              {playerFullName(p)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TeamRoster;
