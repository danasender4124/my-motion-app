import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SeasonOption {
  id: string;
  name: string;
}

interface Props {
  seasons: SeasonOption[];
  value: string | null;
  onChange: (id: string) => void;
  /** Shown on the trigger when nothing is selected yet. */
  placeholder: string;
  /** Optional label rendered before the trigger (e.g. "עונה"). */
  label?: string;
  align?: 'center' | 'start' | 'end';
}

/**
 * Shared season selector used across the public site (games, statistics,
 * team pages). Default is chosen by the caller — this component only renders
 * the list and reports the pick. Matches the orange league button styling.
 */
const SeasonPicker: React.FC<Props> = ({ seasons, value, onChange, placeholder, label, align = 'center' }) => {
  const [open, setOpen] = useState(false);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-season-dropdown]')) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (seasons.length === 0) return null;

  const selected = seasons.find((s) => s.id === value);
  const triggerLabel = selected ? selected.name : placeholder;

  const justify = align === 'center' ? 'justify-center' : align === 'end' ? 'justify-end' : 'justify-start';

  return (
    <div className={`flex items-center gap-3 ${justify}`} data-season-dropdown>
      {label && (
        <span className="text-sm font-bold" style={{ color: 'rgba(242,237,230,0.55)' }}>
          {label}
        </span>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-white min-w-[170px] justify-center transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
          style={{
            background: 'var(--grad-orange)',
            boxShadow: 'var(--sheen-top), 0 4px 14px rgba(214,60,0,0.3)',
          }}
        >
          <span>{triggerLabel}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} style={{ opacity: 0.85 }} />
        </button>
        {open && (
          <ul
            className="absolute right-0 left-0 top-full mt-2 overflow-hidden rounded-2xl z-20 p-1"
            style={{
              background: 'rgba(16,18,26,0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: 'var(--shadow-1)',
              backdropFilter: 'blur(14px)',
            }}
          >
            {seasons.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => { onChange(s.id); setOpen(false); }}
                  className="block w-full text-center px-5 py-2 rounded-xl text-sm transition-colors"
                  style={
                    s.id === value
                      ? { background: 'var(--grad-orange)', color: '#fff', fontWeight: 800 }
                      : { color: 'rgba(242,237,230,0.75)' }
                  }
                  onMouseEnter={(e) => { if (s.id !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={(e) => { if (s.id !== value) e.currentTarget.style.background = 'transparent'; }}
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SeasonPicker;
