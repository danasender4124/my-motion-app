import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { LeagueLeaderRow } from '../../lib/queries';

interface Props {
  label: string;
  rows: LeagueLeaderRow[];
  formatValue: (n: number) => string;
  onClose: () => void;
}

const LeaderModal: React.FC<Props> = ({ label, rows, formatValue, onClose }) => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,8,12,0.85)' }}
      onClick={onClose}
      dir={dir}
    >
      <div
        className="w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: '#0E1018', border: '1px solid rgba(255,255,255,0.12)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ background: '#FF4D00' }}>
          <span className="font-black text-white">{label}</span>
          <button
            onClick={onClose}
            aria-label={t('stats.close')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xl font-black"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {rows.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm" style={{ color: 'rgba(242,237,230,0.4)' }}>
              {t('stats.not_enough_data')}
            </div>
          ) : (
            <ul>
              {rows.map((r, i) => (
                <li
                  key={r.player_id}
                  className="grid items-center gap-3 px-4 py-3 text-sm"
                  style={{
                    gridTemplateColumns: '36px 1fr auto',
                    borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined,
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  }}
                >
                  <span
                    className="text-center font-black tabular-nums"
                    style={{ color: i === 0 ? '#FF4D00' : i < 3 ? '#FFB300' : 'rgba(242,237,230,0.4)' }}
                  >
                    {i + 1}
                  </span>
                  <Link
                    to={`/player/${r.player_id}`}
                    className="truncate"
                    style={{ color: '#F2EDE6', fontWeight: i === 0 ? 700 : 500 }}
                    onClick={onClose}
                  >
                    {r.first_name} {r.last_name}
                  </Link>
                  <span
                    className="tabular-nums"
                    style={{ color: i === 0 ? '#FF4D00' : '#F2EDE6', fontWeight: 800 }}
                  >
                    {formatValue(r.value)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderModal;
