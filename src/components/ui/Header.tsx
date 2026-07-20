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
            <img
              src={team.logo}
              alt={team.name}
              style={{ height: 70, width: 70, objectFit: 'contain' }}
            />
          ) : (
            <div
              style={{
                height: 70, width: 70, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.06)', color: '#F2EDE6', fontWeight: 900, fontSize: 12, borderRadius: 8,
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

      {/* Row 1: Logo */}
      <div
        className="w-full flex items-center gap-4 px-4 md:px-6"
        style={{
          height: '110px',
          background: '#0A0E1A',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Right: hamburger (mobile only) — placed on the start (right) side */}
        <button
          className="lg:hidden flex flex-col justify-center items-center w-11 h-11 rounded-lg gap-1.5 flex-shrink-0"
          style={{ background: '#FF4D00' }}
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

        {/* Left: Athena Winner logo + language toggle */}
        <div className="flex items-center gap-2 flex-shrink-0 mr-auto lg:mr-0">
          <img
            src="/athena-winner-logo.png"
            alt="ליגת אתנה וינר"
            style={{ height: '95px', width: 'auto', objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Language toggle bar */}
      <div className="flex justify-end px-4 py-1" style={{ background: '#0a0a0f' }}>
        <LanguageToggle />
      </div>

      {/* Row 2: Orange nav bar — visible on all screens */}
      <nav
        className="flex items-stretch w-full overflow-x-auto"
        style={{ background: '#FF4D00' }}
        aria-label="ניווט ראשי"
      >
        {navLinks.map(link => (
          'external' in link && link.external ? (
            <a
              key={link.label}
              href={link.to}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex-1 lg:flex-1 flex items-center justify-center py-3 lg:py-2 text-sm font-bold transition-colors duration-150 relative whitespace-nowrap px-3"
              style={{ color: '#fff', borderLeft: '1px solid rgba(255,255,255,0.15)', minWidth: 'fit-content' }}
            >
              {link.label}
            </a>
          ) : (
          <NavLink
            key={link.label}
            to={link.to}
            end={link.to === '/'}
            onClick={() => setMenuOpen(false)}
            className="flex-1 lg:flex-1 flex items-center justify-center py-3 lg:py-2 text-sm font-bold transition-colors duration-150 relative whitespace-nowrap px-3"
            style={{ color: '#fff', borderLeft: '1px solid rgba(255,255,255,0.15)', minWidth: 'fit-content' }}
          >
            {({ isActive }) => (
              <>
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="orange-nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: '#fff' }}
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
                  <a
                    key={link.label}
                    href={link.to}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium"
                    style={{ color: '#F2EDE6' }}
                  >
                    {link.label}
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
