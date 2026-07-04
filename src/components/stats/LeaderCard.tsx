import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { LeagueLeaderRow } from '../../lib/queries';
import { playerFullName } from '../../lib/displayName';
import LeaderModal from './LeaderModal';

interface Props {
  label: string;
  rows: LeagueLeaderRow[];
  /** Format the numeric value for display. Defaults to one decimal. */
  formatValue?: (n: number) => string;
}

const defaultFormat = (n: number) => n.toFixed(1);

const LeaderCard: React.FC<Props> = ({ label, rows, formatValue = defaultFormat }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const [open, setOpen] = useState(false);
  const top = rows.slice(0, 5);

  return (
    <>
      <div
        className="rounded-xl overflow-hidden flex flex-col"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        dir={dir}
      >
        <div
          className="px-3 py-2 text-sm font-black text-center"
          style={{ background: '#FF4D00', color: '#fff' }}
        >
          {label}
        </div>
        {top.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs" style={{ color: 'rgba(242,237,230,0.4)' }}>
            {t('stats.not_enough_data')}
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {top.map((r, i) => (
              <li
                key={r.player_id}
                className="flex items-center gap-2 px-3 py-2 text-sm"
                style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined }}
              >
                <Link
                  to={`/player/${r.player_id}`}
                  className="flex-1 truncate"
                  style={{ color: i === 0 ? '#FF4D00' : 'rgba(242,237,230,0.85)', fontWeight: i === 0 ? 700 : 500 }}
                >
                  {playerFullName(r)}
                </Link>
                <span
                  className="tabular-nums shrink-0"
                  style={{ color: i === 0 ? '#FF4D00' : '#F2EDE6', fontWeight: 800 }}
                >
                  {formatValue(r.value)}
                </span>
              </li>
            ))}
          </ul>
        )}
        {rows.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="px-3 py-2 text-xs font-bold transition-colors hover:bg-white/5"
            style={{ color: 'rgba(242,237,230,0.6)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            {t('stats.view_all')}
          </button>
        )}
      </div>
      {open && (
        <LeaderModal
          label={label}
          rows={rows}
          formatValue={formatValue}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default LeaderCard;
