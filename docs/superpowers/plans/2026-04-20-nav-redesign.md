# Navigation & Tabs Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the header into two rows (logo + full-width orange nav bar) and replace all small pill-tab toggles with a shared, prominent `SectionTabs` component — matching the spread, organized layout of basket.co.il while keeping the dark theme.

**Architecture:** Create one shared `SectionTabs` component, then update `Header`, `Results`, and `Stats` to use the new patterns. No new routing or state management needed — all state stays local.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, Framer Motion

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/components/ui/SectionTabs.tsx` | **Create** | Shared tab-bar component used by Results and Stats |
| `src/components/ui/Header.tsx` | **Modify** | Split into two rows, remove tickets button, add orange nav bar |
| `src/components/ui/Results.tsx` | **Modify** | Replace small pill toggle with SectionTabs + round label |
| `src/components/ui/Stats.tsx` | **Modify** | Replace small pill toggle with SectionTabs |

---

## Task 1: Create SectionTabs component

**Files:**
- Create: `src/components/ui/SectionTabs.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';

export interface Tab {
  id: string;
  label: string;
}

interface SectionTabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  suffix?: React.ReactNode; // optional extra element on the right (e.g. round label)
}

const SectionTabs: React.FC<SectionTabsProps> = ({ tabs, active, onChange, suffix }) => (
  <div className="flex items-center gap-2" dir="rtl">
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className="px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200"
        style={{
          background: active === tab.id ? '#FF4D00' : 'rgba(255,255,255,0.07)',
          color: active === tab.id ? '#fff' : 'rgba(242,237,230,0.55)',
          border: active === tab.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {tab.label}
      </button>
    ))}
    {suffix}
  </div>
);

export default SectionTabs;
```

- [ ] **Step 2: Start the dev server (if not already running)**

```bash
cd /c/Users/Dana/projects/my-motion-app && npm run dev
```

Open http://localhost:5174 — confirm the site loads normally (no changes yet).

- [ ] **Step 3: Commit**

```bash
cd /c/Users/Dana/projects/my-motion-app
git add src/components/ui/SectionTabs.tsx
git commit -m "feat: add shared SectionTabs component"
```

---

## Task 2: Update Header — two rows, orange nav bar

**Files:**
- Modify: `src/components/ui/Header.tsx`

- [ ] **Step 1: Replace the entire Header.tsx with the two-row version**

```tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { label: 'בית',        href: '#hero' },
  { label: 'תוצאות',     href: '#results' },
  { label: 'לוח משחקים', href: '#schedule' },
  { label: 'טבלת הליגה', href: '#standings' },
  { label: 'קבוצות',     href: '#teams' },
  { label: 'חדשות',      href: '#news' },
  { label: 'סטטיסטיקה',  href: '#stats' },
];

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('בית');

  return (
    <header className="sticky top-0 z-50 w-full" dir="rtl">

      {/* Row 1: Logo only */}
      <div
        className="w-full flex items-center justify-between px-4 md:px-8"
        style={{
          height: '56px',
          background: '#0A0E1A',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <a href="#hero" className="flex items-center gap-3">
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
        </a>

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
          <a
            key={link.label}
            href={link.href}
            onClick={() => setActive(link.label)}
            className="flex-1 flex items-center justify-center py-2 text-sm font-bold transition-colors duration-150 relative"
            style={{
              color: '#fff',
              borderLeft: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            {link.label}
            {active === link.label && (
              <motion.div
                layoutId="orange-nav-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: '#fff' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </a>
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
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => { setActive(link.label); setMenuOpen(false); }}
                  className="px-4 py-3 rounded-xl text-sm font-medium"
                  style={{
                    color: active === link.label ? '#FF4D00' : '#F2EDE6',
                    background: active === link.label ? 'rgba(255,77,0,0.1)' : 'transparent',
                  }}
                >
                  {link.label}
                </a>
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

Open http://localhost:5174 — confirm:
- Row 1: logo only, no nav links, no buttons
- Row 2: orange bar with 7 links spread full-width
- Active link has white underline
- Mobile (<1024px): only row 1 + hamburger visible, clicking hamburger opens dropdown

- [ ] **Step 3: Commit**

```bash
cd /c/Users/Dana/projects/my-motion-app
git add src/components/ui/Header.tsx
git commit -m "feat: split header into logo row + orange nav bar"
```

---

## Task 3: Update Results — use SectionTabs

**Files:**
- Modify: `src/components/ui/Results.tsx`

- [ ] **Step 1: Replace the tab toggle in Results.tsx**

Replace lines 18–38 (the section header div) with:

```tsx
import SectionTabs from './SectionTabs';

// Inside Results component, replace the section header:
<div className="flex flex-wrap items-center justify-between gap-3 mb-6">
  <h2 className="text-xl font-black" style={{ color: '#F2EDE6' }}>
    משחקים
  </h2>
  <SectionTabs
    tabs={[
      { id: 'results', label: 'תוצאות' },
      { id: 'schedule', label: 'לוח משחקים' },
    ]}
    active={tab}
    onChange={(id) => setTab(id as 'results' | 'schedule')}
    suffix={
      <span
        className="px-4 py-2 rounded-lg text-sm font-bold"
        style={{
          background: 'rgba(255,255,255,0.07)',
          color: 'rgba(242,237,230,0.55)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        מחזור 22 ▾
      </span>
    }
  />
</div>
```

The full updated Results.tsx import block:
```tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RECENT_RESULTS, UPCOMING_GAMES } from '../../data/league';
import SectionTabs from './SectionTabs';
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:5174/#results — confirm:
- Three elements in a row: `תוצאות` (orange), `לוח משחקים` (muted), `מחזור 22 ▾` (muted label)
- Clicking `לוח משחקים` switches view and turns it orange
- Cards below update correctly

- [ ] **Step 3: Commit**

```bash
cd /c/Users/Dana/projects/my-motion-app
git add src/components/ui/Results.tsx
git commit -m "feat: replace Results pill toggle with SectionTabs"
```

---

## Task 4: Update Stats — use SectionTabs

**Files:**
- Modify: `src/components/ui/Stats.tsx`

- [ ] **Step 1: Replace the tab toggle in Stats.tsx**

Replace the import block and the section header `div` (lines 22–38):

```tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TOP_SCORERS } from '../../data/league';
import SectionTabs, { Tab } from './SectionTabs';

type StatKey = 'ppg' | 'rpg' | 'apg';

const STAT_TABS: Tab[] = [
  { id: 'ppg', label: 'נקודות' },
  { id: 'rpg', label: 'ריבאונדים' },
  { id: 'apg', label: 'בישולים' },
];

const STAT_LABELS: Record<StatKey, string> = {
  ppg: 'נקודות למשחק',
  rpg: 'ריבאונדים למשחק',
  apg: 'בישולים למשחק',
};
```

Replace the section header div (the `flex flex-wrap` div with the old toggle):
```tsx
<div className="flex flex-wrap items-center justify-between gap-4 mb-6">
  <h2 className="text-xl font-black" style={{ color: '#F2EDE6' }}>מובילות הליגה</h2>
  <SectionTabs
    tabs={STAT_TABS}
    active={stat}
    onChange={(id) => setStat(id as StatKey)}
  />
</div>
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:5174/#stats — confirm:
- Three tab buttons: נקודות | ריבאונדים | בישולים
- Same visual style as Results tabs
- Switching tabs updates the player list

- [ ] **Step 3: Commit**

```bash
cd /c/Users/Dana/projects/my-motion-app
git add src/components/ui/Stats.tsx
git commit -m "feat: replace Stats pill toggle with SectionTabs"
```

---

## Done

All 4 tasks complete. The site now has:
- Two-row header: logo row + full-width orange nav bar
- Consistent `SectionTabs` used in Results and Stats
- No tickets button anywhere
