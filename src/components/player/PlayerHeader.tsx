import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { PlayerProfile } from '../../lib/queries';

const POSITION_LABELS: Record<NonNullable<PlayerProfile['position']>, string> = {
  point_guard: 'PG',
  shooting_guard: 'G',
  small_forward: 'F',
  power_forward: 'PF',
  center: 'C',
};

const CLASSIFICATION_KEY: Record<PlayerProfile['classification'], string> = {
  israeli: 'player.cls_israeli',
  naturalized: 'player.cls_naturalized',
  foreign: 'player.cls_foreign',
  bosman: 'player.cls_bosman',
};

const calcAge = (birth: string | null): number | null => {
  if (!birth) return null;
  const today = new Date();
  const bd = new Date(birth);
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  return Number.isFinite(age) ? age : null;
};

const initials = (first: string, last: string) => (first[0] ?? '') + (last[0] ?? '');

interface Props { player: PlayerProfile }

const PlayerHeader: React.FC<Props> = ({ player }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const age = calcAge(player.birth_date);
  const teamPart = player.current_team
    ? `${player.current_jersey != null ? '#' + player.current_jersey + ' · ' : ''}${player.current_team.name}`
    : null;
  const positionLabel = player.position ? POSITION_LABELS[player.position] : null;
  const metaTop = [teamPart, positionLabel].filter(Boolean).join(' · ');
  const metaBottom = [
    age != null ? t('player.meta_age', { age }) : null,
    player.nationality,
    t(CLASSIFICATION_KEY[player.classification]),
  ].filter(Boolean).join(' · ');

  return (
    <div dir={dir} className="space-y-4">
      <Link to="/results" className="text-sm flex items-center gap-1" style={{ color: 'rgba(242,237,230,0.5)' }}>
        {t('player.back')}
      </Link>
      <div
        className="rounded-2xl p-8 flex items-center gap-6"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div
          className="w-24 h-24 rounded-full shrink-0 overflow-hidden flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          {player.photo
            ? <img src={player.photo} alt={`${player.first_name} ${player.last_name}`} className="w-full h-full object-cover" />
            : <span className="text-3xl font-black" style={{ color: 'rgba(242,237,230,0.5)' }}>{initials(player.first_name, player.last_name)}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-black leading-tight" style={{ color: '#F2EDE6' }}>
            {player.first_name} {player.last_name}
          </h1>
          {metaTop && <div className="mt-2 text-sm" style={{ color: 'rgba(242,237,230,0.7)' }}>{metaTop}</div>}
          {metaBottom && <div className="text-sm" style={{ color: 'rgba(242,237,230,0.5)' }}>{metaBottom}</div>}
        </div>
      </div>
    </div>
  );
};

export default PlayerHeader;
