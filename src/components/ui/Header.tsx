// src/components/ui/Header.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'בית',        to: '/' },
  { label: 'משחקים',     to: '/results' },
  { label: 'טבלת הליגה', to: '/standings' },
  { label: 'סטטיסטיקה',  to: '/stats' },
  { label: 'חדשות',      to: '/news' },
];

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full" dir="rtl">

      {/* Row 1: Logo */}
      <div
        className="w-full flex items-center justify-between px-4 md:px-8"
        style={{
          height: '110px',
          background: '#0A0E1A',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <NavLink to="/" className="flex items-center">
          <img
            src="/league-logo.png"
            alt="מנהלת הליגה נשים"
            style={{ height: '90px', width: 'auto', objectFit: 'contain' }}
          />
        </NavLink>

        {/* Left: Athena Winner logo */}
        <img
          src="/athena-winner-logo.png"
          alt="ליגת אתנה וינר"
          style={{ height: '95px', width: 'auto', objectFit: 'contain' }}
        />

        {/* Mobile hamburger */}
        <button
          className="lg:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg gap-1.5"
          style={{ background: 'rgba(255,255,255,0.07)' }}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="תפריט"
        >
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="block h-0.5 rounded-full"
              style={{ background: '#F2EDE6' }}
              animate={{
                width: menuOpen && i === 1 ? 0 : '16px',
                rotate: menuOpen ? (i === 0 ? 45 : i === 2 ? -45 : 0) : 0,
                y: menuOpen ? (i === 0 ? 8 : i === 2 ? -8 : 0) : 0,
                opacity: menuOpen && i === 1 ? 0 : 1,
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </button>
      </div>

      {/* Row 2: Orange nav bar (desktop) */}
      <nav
        className="hidden lg:flex items-stretch w-full"
        style={{ background: '#FF4D00' }}
        aria-label="ניווט ראשי"
      >
        {NAV_LINKS.map(link => (
          <NavLink
            key={link.label}
            to={link.to}
            end={link.to === '/'}
            onClick={() => setMenuOpen(false)}
            className="flex-1 flex items-center justify-center py-2 text-sm font-bold transition-colors duration-150 relative"
            style={{ color: '#fff', borderLeft: '1px solid rgba(255,255,255,0.15)' }}
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
              {NAV_LINKS.map(link => (
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
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
