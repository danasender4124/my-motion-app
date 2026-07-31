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
          className="relative flex items-center px-5 py-2.5 bg-[#f15a24] text-white font-semibold min-w-[190px] justify-center transition-colors hover:bg-[#d44d1d]"
        >
          <span>{triggerLabel}</span>
          <ChevronDown className={`w-4 h-4 absolute right-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <ul
            className="absolute right-0 left-0 top-full mt-1 overflow-hidden shadow-lg z-20 border"
            style={{ background: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            {seasons.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => { onChange(s.id); setOpen(false); }}
                  className={`block w-full text-center px-5 py-2.5 transition-colors ${
                    s.id === value ? 'bg-[#f15a24] text-white' : 'text-white/80 hover:bg-white/10'
                  }`}
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
