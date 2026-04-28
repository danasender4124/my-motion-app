# Multi-Page Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-page tab layout with React Router (real URLs per section), keeping the existing dark theme, orange Header nav, and Framer Motion animations.

**Architecture:** Install react-router-dom, wrap App in BrowserRouter, define 5 routes (`/`, `/results`, `/standings`, `/stats`, `/news`). The Header's existing orange nav bar gets updated to use NavLink instead of anchor tags. Each inner page gets a PageBanner with stadium background + large title. The Hero section stays on `/`.

**Tech Stack:** React 19, react-router-dom v7, TypeScript, Framer Motion v12, Tailwind CSS v4, Vite

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `package.json` | Modify | Add react-router-dom dependency |
| `src/components/ui/PageBanner.tsx` | Create | Full-width page hero banner with title |
| `src/components/ui/Header.tsx` | Modify | Replace `href="#..."` with `<NavLink to="...">` |
| `src/App.jsx` | Modify | BrowserRouter + Routes, remove TabNav |

---

## Task 1: Install react-router-dom

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install the package**

```bash
cd /c/Users/Dana/projects/my-motion-app
npm install react-router-dom
```

Expected output: `added X packages` with no errors. `react-router-dom` appears in `dependencies` in `package.json`.

- [ ] **Step 2: Verify in browser**

Open http://localhost:5175 — confirm site still loads normally (no crash).

- [ ] **Step 3: Commit**

```bash
cd /c/Users/Dana/projects/my-motion-app
git add package.json package-lock.json
git commit -m "feat: add react-router-dom"
```

---

## Task 2: Create PageBanner.tsx

**Files:**
- Create: `src/components/ui/PageBanner.tsx`

This component renders a full-width hero banner at the top of each inner page (results, standings, stats, news). It uses a stadium background image with a dark overlay and a large animated title.

- [ ] **Step 1: Create the file**

```tsx
// src/components/ui/PageBanner.tsx
import React from 'react';
import { motion } from 'framer-motion';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface PageBannerProps {
  title: string;
}

const PageBanner: React.FC<PageBannerProps> = ({ title }) => (
  <div
    className="relative w-full flex items-center justify-center overflow-hidden border-b-4"
    style={{
      height: 'clamp(160px, 20vw, 256px)',
      borderColor: '#FF4D00',
      background: 'linear-gradient(135deg, #0f1117 0%, #1a1f2e 50%, #0f1117 100%)',
    }}
  >
    {/* Arena background image (optional — gradient fallback if absent) */}
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: 'url(/arena.jpg)',
      }}
    />
    {/* Dark overlay */}
    <div
      className="absolute inset-0"
      style={{ background: 'rgba(7,8,12,0.70)' }}
    />

    {/* Title */}
    <motion.h1
      className="relative z-10 font-black text-center"
      style={{
        color: '#F2EDE6',
        fontSize: 'clamp(2.5rem, 8vw, 5rem)',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        direction: 'rtl',
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
    >
      {title}
    </motion.h1>
  </div>
);

export default PageBanner;
```

- [ ] **Step 2: Verify in browser**

The component isn't mounted yet — no visible change. Confirm no TypeScript errors by checking the terminal running Vite.

- [ ] **Step 3: Commit**

```bash
cd /c/Users/Dana/projects/my-motion-app
git add src/components/ui/PageBanner.tsx
git commit -m "feat: add PageBanner component"
```

---

## Task 3: Update Header.tsx — NavLink + router paths

**Files:**
- Modify: `src/components/ui/Header.tsx`

The Header already has an orange nav bar. We replace the `<a href="#...">` tags with `<NavLink to="...">` from react-router-dom. Active state is detected automatically via NavLink's `isActive` prop (no more manual `active` state).

- [ ] **Step 1: Replace the file**

```tsx
// src/components/ui/Header.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'בית',        to: '/' },
  { label: 'תוצאות',     to: '/results' },
  { label: 'לוח משחקים', to: '/results' },
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
          height: '56px',
          background: '#0A0E1A',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <NavLink to="/" className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-black text-base"
            style={{ background: '#FF4D00', color: '#fff' }}
          >
            🏀
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xs font-semibold" style={{ color: '#FF4D00', letterSpacing: '0.12em' }}>
              מנהלת
            </span>
            <span className="text-sm font-black" style={{ color: '#F2EDE6' }}>
              ליגת העל נשים
            </span>
          </div>
        </NavLink>

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
```

- [ ] **Step 2: Verify in browser**

This will crash until App.jsx wraps everything in BrowserRouter — that's expected. Move directly to Task 4.

- [ ] **Step 3: Commit**

```bash
cd /c/Users/Dana/projects/my-motion-app
git add src/components/ui/Header.tsx
git commit -m "feat: Header — replace href anchors with NavLink for react-router"
```

---

## Task 4: Update App.jsx — BrowserRouter + Routes

**Files:**
- Modify: `src/App.jsx`

Remove the old `TabNav` component and `activeTab` state. Wrap the entire app in `BrowserRouter`. Define 5 routes. Each inner page gets `<PageBanner>` + its content component.

- [ ] **Step 1: Replace the file**

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import './index.css'
import ScoreTicker     from '@/components/ui/ScoreTicker'
import Header          from '@/components/ui/Header'
import { HeroSection } from '@/components/ui/hero-odyssey'
import Results         from '@/components/ui/Results'
import Standings       from '@/components/ui/Standings'
import Stats           from '@/components/ui/Stats'
import News            from '@/components/ui/News'
import Footer          from '@/components/ui/Footer'
import PageBanner      from '@/components/ui/PageBanner'

const AnimatedRoutes = () => {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<HeroSection />} />
          <Route path="/results"   element={<><PageBanner title="משחקים ותוצאות" /><Results /></>} />
          <Route path="/standings" element={<><PageBanner title="טבלת הליגה" /><Standings /></>} />
          <Route path="/stats"     element={<><PageBanner title="סטטיסטיקה" /><Stats /></>} />
          <Route path="/news"      element={<><PageBanner title="חדשות וכתבות" /><News /></>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div style={{ background: '#07080C', minHeight: '100svh' }}>
        <ScoreTicker />
        <Header />
        <main>
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:5175 — confirm:
- Home page (`/`) shows the Hero section
- Clicking "תוצאות" in the orange nav navigates to `/results` and shows the PageBanner + Results
- Clicking "טבלה" navigates to `/standings` with its banner
- Active nav link has the white underline indicator
- Page transitions animate with fade + slide

- [ ] **Step 3: Commit**

```bash
cd /c/Users/Dana/projects/my-motion-app
git add src/App.jsx
git commit -m "feat: multi-page routing — BrowserRouter, Routes, PageBanner per section"
```

---

## Done

All 4 tasks complete. The site now has:
- Real URLs per section (`/results`, `/standings`, `/stats`, `/news`)
- Orange header nav with active link indicator (NavLink)
- PageBanner with large Hebrew title on each inner page
- Animated page transitions (AnimatePresence)
- Hero section on `/` unchanged
