// src/components/ui/Header.tsx
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTeams } from '../../lib/queries';

const useNavLinks = () => {
  const { t } = useTranslation();
  return [
    { label: t('nav.home'),      to: '/' },
    { label: t('nav.games'),     to: '/results' },
    { label: t('nav.standings'), to: '/standings' },
    { label: t('nav.stats'),     to: '/stats' },
    { label: t('nav.news'),      to: '/news' },
    { label: t('nav.vod'),       to: '/vod' },
    // External: the live/VOD viewing app (broadcasts of league games).
    { label: 'WBPL TV',          to: 'https://tv.wbpl.co.il', external: true as const },
  ];
};

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();
  const current = i18n.language === 'en' ? 'en' : 'he';
  const next = current === 'he' ? 'en' : 'he';
  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(next)}
      className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold text-white hover:bg-white/10 transition-colors"
      aria-label={`Switch to ${next === 'en' ? 'English' : 'Hebrew'}`}
    >
      {current === 'he' ? 'EN' : 'עב'}
    </button>
  );
};

// Crests whose artwork is dark/transparent and disappears on the dark header
// get a white circle behind them. Everything else renders as-is.
const WHITE_BACKED_TEAM_IDS = new Set<string>([
  '63a7ca54-9040-4862-860c-83d13ad7a9e8', // הפועל לב ירושלים
]);

const TeamLogos: React.FC = () => {
  const { data: teams = [] } = useTeams();
  return (
    <div className="flex-1 flex items-center justify-center gap-3 overflow-hidden" style={{ minWidth: 0 }}>
      {teams.map((team) => (
        <Link
          key={team.id}
          to={`/team/${team.id}`}
          aria-label={team.name}
          className="flex-shrink-0"
        >
          {team.logo ? (
            WHITE_BACKED_TEAM_IDS.has(team.id) ? (
              // White circle so the dark-on-dark crest stays legible.
              <div
                style={{
                  height: 70, width: 70, borderRadius: '50%', background: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 6, boxSizing: 'border-box', overflow: 'hidden',
                }}
              >
                <img
                  src={team.logo}
                  alt={team.name}
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            ) : (
              <img
                src={team.logo}
                alt={team.name}
                style={{ height: 70, width: 70, objectFit: 'contain' }}
              />
            )
          ) : (
            <div
              style={{
                height: 70, width: 70, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.06)', color: '#F2EDE6', fontWeight: 900, fontSize: 12,
              }}
            >
              {team.name.split(' ')[0]?.slice(0, 3) ?? '—'}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = useNavLinks();
  const { i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';

  return (
    <header className="sticky top-0 z-50 w-full" dir={dir}>
      {/* WBPL TV broadcast button — rotating gradient ring + live pulse */}
      <style>{`
        .wbpltv-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 3px 14px;
          border-radius: 999px;
          overflow: hidden;
          isolation: isolate;
          white-space: nowrap;
          min-width: fit-content;
          transition: transform .15s ease, filter .15s ease;
        }
        .wbpltv-btn::before {
          content: '';
          position: absolute;
          inset: -120%;
          z-index: -2;
          background: conic-gradient(from 0deg,
            #FFB347, #FF4D00, #7A1E00, #2E9AC7, #FFB347);
          animation: wbpltv-spin 3.5s linear infinite;
        }
        .wbpltv-btn::after {
          content: '';
          position: absolute;
          inset: 2.5px;
          z-index: -1;
          border-radius: 999px;
          background:
            radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,.14), transparent 55%),
            linear-gradient(180deg, #1B2440 0%, #0A0E1A 100%);
        }
        .wbpltv-btn:hover { transform: translateY(-1px) scale(1.04); filter: brightness(1.12); }
        .wbpltv-btn:active { transform: translateY(0) scale(0.99); }
        .wbpltv-label {
          color: #fff;
          font-weight: 900;
          font-size: 0.95rem;
          letter-spacing: .05em;
          text-shadow: 0 1px 3px rgba(0,0,0,.7);
        }
        .wbpltv-play {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          color: #fff;
          background: linear-gradient(180deg, #FF6A26, #D63E00);
          box-shadow: 0 0 10px rgba(255,77,0,.8), inset 0 1px 0 rgba(255,255,255,.35);
          flex-shrink: 0;
        }
        .wbpltv-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #FF3B30;
          flex-shrink: 0;
          animation: wbpltv-pulse 1.6s ease-out infinite;
        }
        .wbpltv-btn--mobile {
          justify-content: center;
          padding: 12px 18px;
          margin-top: 4px;
        }
        @keyframes wbpltv-spin { to { transform: rotate(360deg); } }
        @keyframes wbpltv-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(255,59,48,.65); }
          70%  { box-shadow: 0 0 0 7px rgba(255,59,48,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,59,48,0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .wbpltv-btn::before { animation: none; }
          .wbpltv-dot { animation: none; }
        }
      `}</style>

      {/* Row 1: Logo */}
      <div
        className="w-full flex items-center gap-4 px-4 md:px-6"
        style={{
          height: '110px',
          background: '#0A0E1A',
        }}
      >
        {/* Right: hamburger (mobile only) — placed on the start (right) side */}
        <button
          className="lg:hidden flex flex-col justify-center items-center w-11 h-11 rounded-lg gap-1.5 flex-shrink-0"
          style={{ background: 'var(--grad-orange)', boxShadow: 'var(--sheen-top)' }}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="תפריט"
        >
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="block h-0.5 rounded-full"
              style={{ background: '#fff' }}
              animate={{
                width: menuOpen && i === 1 ? 0 : '20px',
                rotate: menuOpen ? (i === 0 ? 45 : i === 2 ? -45 : 0) : 0,
                y: menuOpen ? (i === 0 ? 8 : i === 2 ? -8 : 0) : 0,
                opacity: menuOpen && i === 1 ? 0 : 1,
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </button>

        {/* Right: League management logo */}
        <NavLink to="/" className="flex items-center flex-shrink-0">
          <img
            src="/league-logo.png"
            alt="מנהלת הליגה נשים"
            style={{ height: '90px', width: 'auto', objectFit: 'contain' }}
          />
        </NavLink>

        {/* Center: scrolling team logos (desktop only) */}
        <div className="hidden lg:flex flex-1 items-center" style={{ minWidth: 0 }}>
          <TeamLogos />
        </div>

        {/* Left: Athena Winner logo */}
        <div className="flex items-center gap-2 flex-shrink-0 mr-auto lg:mr-0">
          <img
            src="/athena-winner-logo.png"
            alt="ליגת אתנה וינר"
            style={{ height: '95px', width: 'auto', objectFit: 'contain' }}
          />
        </div>

        {/* Far left: language toggle, bottom-aligned with the logos — lives
            inside the logo row so no extra strip pushes the nav down */}
        <div className="self-end pb-2 flex-shrink-0">
          <LanguageToggle />
        </div>
      </div>

      {/* Row 2: Orange nav bar — gradient material with a soft top sheen,
          not a flat fill */}
      <nav
        className="flex items-stretch w-full overflow-x-auto"
        style={{
          background: 'var(--grad-orange)',
          boxShadow: 'var(--sheen-top), 0 10px 26px rgba(214,60,0,0.22)',
        }}
        aria-label="ניווט ראשי"
      >
        {navLinks.map(link => (
          'external' in link && link.external ? (
            // WBPL TV — broadcast-style button: rotating gradient ring,
            // pulsing live dot and a play badge on dark glass
            <a
              key={link.label}
              href={link.to}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMenuOpen(false)}
              className="wbpltv-btn self-center mx-2 my-1"
            >
              <span className="wbpltv-play" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="100%" height="100%">
                  <path d="M9 6.5v11l9-5.5z" fill="currentColor" />
                </svg>
              </span>
              <span className="wbpltv-label">{link.label}</span>
              <span className="wbpltv-dot" aria-hidden="true" />
            </a>
          ) : (
          <NavLink
            key={link.label}
            to={link.to}
            end={link.to === '/'}
            onClick={() => setMenuOpen(false)}
            className="flex-1 lg:flex-1 flex items-center justify-center py-1.5 lg:py-1 text-sm transition-all duration-150 relative whitespace-nowrap px-3"
            style={{ borderLeft: '1px solid rgba(0,0,0,0.12)', minWidth: 'fit-content' }}
          >
            {({ isActive }) => (
              <>
                <span
                  className="transition-all duration-150"
                  style={{
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.82)',
                    fontWeight: isActive ? 800 : 500,
                    textShadow: isActive ? '0 1px 6px rgba(120,30,0,0.5)' : 'none',
                  }}
                >
                  {link.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="orange-nav-indicator"
                    className="absolute bottom-0.5 h-[2px] rounded-full"
                    style={{
                      left: 14, right: 14,
                      background: 'linear-gradient(90deg, rgba(255,255,255,0.15), #fff 50%, rgba(255,255,255,0.15))',
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
          )
        ))}
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="lg:hidden overflow-hidden"
            style={{ background: '#0A0E1A', borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <nav className="flex flex-col gap-1 p-4" dir="rtl">
              {navLinks.map(link => (
                'external' in link && link.external ? (
                  // WBPL TV — same broadcast button, full-width in the mobile menu
                  <a
                    key={link.label}
                    href={link.to}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="wbpltv-btn wbpltv-btn--mobile"
                  >
                    <span className="wbpltv-play" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="100%" height="100%">
                        <path d="M9 6.5v11l9-5.5z" fill="currentColor" />
                      </svg>
                    </span>
                    <span className="wbpltv-label">{link.label}</span>
                    <span className="wbpltv-dot" aria-hidden="true" />
                  </a>
                ) : (
                <NavLink
                  key={link.label}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium"
                  style={({ isActive }) => ({
                    color: isActive ? '#FF4D00' : '#F2EDE6',
                    background: isActive ? 'rgba(255,77,0,0.1)' : 'transparent',
                  })}
                >
                  {link.label}
                </NavLink>
                )
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
