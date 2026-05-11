import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Israeli accessibility widget per תקן ישראלי 5568 / WCAG 2.0 AA
// Persists user preferences in localStorage and applies them via classes on
// <html>. CSS rules are defined in src/index.css (a11y section).

type Preferences = {
  fontScale: number;     // 100 = normal, 110/120/130 = larger
  contrast: 'normal' | 'high' | 'inverted';
  links: 'normal' | 'underline';
  readableFont: boolean;
  bigCursor: boolean;
};

const DEFAULTS: Preferences = {
  fontScale: 100,
  contrast: 'normal',
  links: 'normal',
  readableFont: false,
  bigCursor: false,
};

const STORAGE_KEY = 'wbpl_a11y_prefs';

const loadPrefs = (): Preferences => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
};

const applyPrefs = (p: Preferences) => {
  const root = document.documentElement;
  root.style.fontSize = `${p.fontScale}%`;
  root.classList.toggle('a11y-contrast-high', p.contrast === 'high');
  root.classList.toggle('a11y-contrast-inverted', p.contrast === 'inverted');
  root.classList.toggle('a11y-links-underline', p.links === 'underline');
  root.classList.toggle('a11y-readable-font', p.readableFont);
  root.classList.toggle('a11y-big-cursor', p.bigCursor);
};

const PersonIcon: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="4" r="2.2" />
    <path d="M5 8h14" />
    <path d="M12 8v6" />
    <path d="M8 14l-2 8" />
    <path d="M16 14l2 8" />
    <path d="M9 14h6" />
  </svg>
);

const AccessibilityWidget: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>(() => loadPrefs());

  // Apply prefs whenever they change
  useEffect(() => {
    applyPrefs(prefs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch { /* ignore quota/disabled */ }
  }, [prefs]);

  // Apply on mount before first paint (handled by useEffect above; close enough)

  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs((cur) => ({ ...cur, [key]: value }));
  };

  const reset = () => setPrefs(DEFAULTS);

  return (
    <>
      <button
        type="button"
        aria-label={open ? t('a11y.close') : t('a11y.open')}
        aria-expanded={open}
        aria-controls="a11y-panel"
        onClick={() => setOpen((v) => !v)}
        className="a11y-trigger"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9998,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#1565C0',
          color: '#fff',
          border: '3px solid #fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <PersonIcon />
      </button>

      {open && (
        <>
          {/* Backdrop for mobile click-outside */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'transparent' }}
            aria-hidden="true"
          />
          <div
            id="a11y-panel"
            role="dialog"
            aria-label={t('a11y.title')}
            dir={dir}
            style={{
              position: 'fixed',
              bottom: '88px',
              right: '20px',
              zIndex: 9999,
              width: '320px',
              maxWidth: 'calc(100vw - 40px)',
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
              background: '#ffffff',
              color: '#111827',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              padding: '16px',
              fontFamily: '"Heebo", Arial, sans-serif',
              border: '2px solid #1565C0',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{t('a11y.title')}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('a11y.close_btn')}
                style={{ background: 'transparent', border: 0, fontSize: 24, lineHeight: 1, cursor: 'pointer', color: '#374151' }}
              >×</button>
            </div>

            <Section title={t('a11y.section_text')}>
              <Row>
                <BtnGroup
                  options={[
                    { v: 100, label: t('a11y.text_normal') },
                    { v: 110, label: t('a11y.text_large') },
                    { v: 120, label: t('a11y.text_larger') },
                    { v: 130, label: t('a11y.text_huge') },
                  ]}
                  value={prefs.fontScale}
                  onChange={(v) => update('fontScale', v as number)}
                />
              </Row>
            </Section>

            <Section title={t('a11y.section_contrast')}>
              <Row>
                <BtnGroup
                  options={[
                    { v: 'normal', label: t('a11y.contrast_normal') },
                    { v: 'high', label: t('a11y.contrast_high') },
                    { v: 'inverted', label: t('a11y.contrast_inverted') },
                  ]}
                  value={prefs.contrast}
                  onChange={(v) => update('contrast', v as Preferences['contrast'])}
                />
              </Row>
            </Section>

            <Section title={t('a11y.section_links')}>
              <Row>
                <BtnGroup
                  options={[
                    { v: 'normal', label: t('a11y.links_normal') },
                    { v: 'underline', label: t('a11y.links_underline') },
                  ]}
                  value={prefs.links}
                  onChange={(v) => update('links', v as Preferences['links'])}
                />
              </Row>
            </Section>

            <Section title={t('a11y.section_extras')}>
              <Row>
                <Toggle
                  label={t('a11y.readable_font')}
                  checked={prefs.readableFont}
                  onChange={(v) => update('readableFont', v)}
                />
              </Row>
              <Row>
                <Toggle
                  label={t('a11y.big_cursor')}
                  checked={prefs.bigCursor}
                  onChange={(v) => update('bigCursor', v)}
                />
              </Row>
            </Section>

            <button
              type="button"
              onClick={reset}
              style={{
                width: '100%',
                marginTop: 8,
                padding: '8px 12px',
                background: '#fef2f2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {t('a11y.reset')}
            </button>

            <Link
              to="/accessibility"
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                marginTop: 10,
                textAlign: 'center',
                padding: '8px 12px',
                background: '#1565C0',
                color: '#fff',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {t('a11y.statement')}
            </Link>
          </div>
        </>
      )}
    </>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: 12 }}>
    <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 6px', color: '#374151' }}>{title}</h3>
    {children}
  </div>
);

const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ marginBottom: 6 }}>{children}</div>
);

const BtnGroup: <T extends string | number>(props: {
  options: { v: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) => React.ReactElement = ({ options, value, onChange }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
    {options.map((o) => (
      <button
        key={String(o.v)}
        type="button"
        onClick={() => onChange(o.v)}
        aria-pressed={value === o.v}
        style={{
          padding: '6px 10px',
          background: value === o.v ? '#1565C0' : '#f3f4f6',
          color: value === o.v ? '#fff' : '#111827',
          border: '1px solid ' + (value === o.v ? '#1565C0' : '#d1d5db'),
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      style={{ width: 18, height: 18 }}
    />
    <span>{label}</span>
  </label>
);

export default AccessibilityWidget;
