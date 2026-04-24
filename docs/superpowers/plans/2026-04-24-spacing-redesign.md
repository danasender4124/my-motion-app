# Spacing & Layout Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all page sections spacious and clear by increasing whitespace, adding prominent section headers, restructuring Stats to full-width, and enhancing Framer Motion stagger animations.

**Architecture:** Pure CSS/Tailwind + Framer Motion changes across 5 files. No new components, no data changes. App.jsx layout changes first (Stats moves out of grid), then each component updated independently.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Framer Motion v12, Vite

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `src/App.jsx` | Modify | Remove Standings+Stats grid wrapper, add `<hr>` separators |
| `src/components/ui/Results.tsx` | Modify | Section heading, card gap, internal padding, stagger |
| `src/components/ui/Standings.tsx` | Modify | Section heading, row padding |
| `src/components/ui/Stats.tsx` | Modify | Section heading, row padding, stagger |
| `src/components/ui/News.tsx` | Modify | Section heading, card gap, image height |

---

## Task 1: App.jsx — flatten layout, add separators

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Replace the file**

```jsx
import './index.css'
import ScoreTicker  from '@/components/ui/ScoreTicker'
import Header       from '@/components/ui/Header'
import { HeroSection } from '@/components/ui/hero-odyssey'
import Results      from '@/components/ui/Results'
import Standings    from '@/components/ui/Standings'
import News         from '@/components/ui/News'
import Stats        from '@/components/ui/Stats'
import Footer       from '@/components/ui/Footer'

const Divider = () => (
  <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: 0 }} />
);

function App() {
  return (
    <div style={{ background: '#07080C', minHeight: '100svh' }}>
      <ScoreTicker />
      <Header />
      <main>
        <HeroSection />
        <Divider />
        <Results />
        <Divider />
        <Standings />
        <Divider />
        <Stats />
        <Divider />
        <News />
      </main>
      <Footer />
    </div>
  )
}

export default App
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:5174 — confirm:
- Stats section is now full-width (not squeezed in 1/3 column)
- Thin separator lines visible between sections
- No layout regressions

- [ ] **Step 3: Commit**

```bash
cd /c/Users/Dana/projects/my-motion-app
git add src/App.jsx
git commit -m "refactor: flatten layout — Stats full-width, add section dividers"
```

---

## Task 2: Results.tsx — heading, card gap, padding, stagger

**Files:**
- Modify: `src/components/ui/Results.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RECENT_RESULTS, UPCOMING_GAMES } from '../../data/league';
import SectionTabs from './SectionTabs';

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.25, 1, 0.5, 1] },
  }),
};

const Results: React.FC = () => {
  const [tab, setTab] = useState<'results' | 'schedule'>('results');

  return (
    <section id="results" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">
      {/* Section header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-10">
        <h2
          className="text-2xl md:text-3xl font-black border-r-4 pr-4"
          style={{ color: '#F2EDE6', borderColor: '#FF4D00' }}
        >
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

      {/* Games grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tab === 'results'
          ? RECENT_RESULTS.map((g, i) => {
              const homeWon = g.homeScore > g.awayScore;
              return (
                <motion.div
                  key={g.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  whileHover={{ y: -2 }}
                  className="relative rounded-2xl overflow-hidden cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {/* Date strip */}
                  <div
                    className="px-5 py-3 flex items-center justify-between text-xs"
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(242,237,230,0.45)' }}
                  >
                    <span>{g.round}</span>
                    <span>{g.date}</span>
                  </div>

                  {/* Score */}
                  <div className="px-5 py-6 flex items-center justify-between gap-3">
                    {/* Home */}
                    <div className="flex-1 text-right">
                      <p className="text-sm font-bold" style={{ color: homeWon ? '#F2EDE6' : 'rgba(242,237,230,0.5)' }}>
                        {g.home}
                      </p>
                    </div>

                    {/* Score box */}
                    <div className="flex items-center gap-1.5 font-black text-xl tabular-nums">
                      <span style={{ color: homeWon ? '#FF4D00' : 'rgba(242,237,230,0.5)' }}>{g.homeScore}</span>
                      <span style={{ color: 'rgba(242,237,230,0.2)', fontSize: '14px' }}>–</span>
                      <span style={{ color: !homeWon ? '#FF4D00' : 'rgba(242,237,230,0.5)' }}>{g.awayScore}</span>
                    </div>

                    {/* Away */}
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold" style={{ color: !homeWon ? '#F2EDE6' : 'rgba(242,237,230,0.5)' }}>
                        {g.away}
                      </p>
                    </div>
                  </div>

                  {/* Winner bar */}
                  <div
                    className="h-0.5"
                    style={{
                      background: 'linear-gradient(to left, transparent, #FF4D00, transparent)',
                      opacity: 0.5,
                    }}
                  />
                </motion.div>
              );
            })
          : UPCOMING_GAMES.map((g, i) => (
              <motion.div
                key={g.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div
                  className="px-5 py-3 flex items-center justify-between text-xs"
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(242,237,230,0.45)' }}
                >
                  <span>{g.round}</span>
                  <span>{g.date} · {g.time}</span>
                </div>
                <div className="px-5 py-6 flex items-center justify-between gap-3">
                  <p className="flex-1 text-right text-sm font-bold" style={{ color: '#F2EDE6' }}>{g.home}</p>
                  <div
                    className="px-3 py-1 rounded-lg text-xs font-black"
                    style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00', border: '1px solid rgba(255,77,0,0.3)' }}
                  >
                    {g.time}
                  </div>
                  <p className="flex-1 text-left text-sm font-bold" style={{ color: '#F2EDE6' }}>{g.away}</p>
                </div>
              </motion.div>
            ))
        }
      </div>
    </section>
  );
};

export default Results;
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:5174/#results — confirm:
- Larger "משחקים" heading with orange left border
- Cards have more internal breathing room (taller date strip, taller score area)
- Gap between cards is visibly wider
- Cards animate in with stagger on scroll

- [ ] **Step 3: Commit**

```bash
cd /c/Users/Dana/projects/my-motion-app
git add src/components/ui/Results.tsx
git commit -m "feat: Results — larger heading, gap-6, more padding, stagger viewport"
```

---

## Task 3: Standings.tsx — heading, row padding

**Files:**
- Modify: `src/components/ui/Standings.tsx`

- [ ] **Step 1: Replace the section opening and header div**

Change line 9:
```tsx
<section id="standings" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">
```

Change line 10–16 (section header div):
```tsx
      <div className="flex items-center justify-between mb-10">
        <h2
          className="text-2xl md:text-3xl font-black border-r-4 pr-4"
          style={{ color: '#F2EDE6', borderColor: '#FF4D00' }}
        >
          טבלת הליגה · עונת 2024/25
        </h2>
        <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: 'rgba(255,77,0,0.15)', color: '#FF4D00', border: '1px solid rgba(255,77,0,0.3)' }}>
          עונה 2025 · פלייאוף
        </span>
      </div>
```

Change table header row (line 22):
```tsx
          className="grid text-xs font-bold uppercase tracking-wider px-4 py-4"
```

Change each data row (line 51):
```tsx
              className="grid items-center px-4 py-5 transition-colors duration-150 cursor-pointer"
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:5174/#standings — confirm:
- "טבלת הליגה" heading is larger with orange right border
- Table rows are taller and less cramped

- [ ] **Step 3: Commit**

```bash
cd /c/Users/Dana/projects/my-motion-app
git add src/components/ui/Standings.tsx
git commit -m "feat: Standings — larger heading, taller rows"
```

---

## Task 4: Stats.tsx — heading, row padding, stagger

**Files:**
- Modify: `src/components/ui/Stats.tsx`

- [ ] **Step 1: Replace the file**

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

const Stats: React.FC = () => {
  const [stat, setStat] = useState<StatKey>('ppg');

  const sorted = [...TOP_SCORERS].sort((a, b) => b[stat] - a[stat]);
  const maxVal = sorted[0][stat];

  return (
    <section id="stats" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <h2
          className="text-2xl md:text-3xl font-black border-r-4 pr-4"
          style={{ color: '#F2EDE6', borderColor: '#FF4D00' }}
        >
          מובילות הליגה
        </h2>
        <SectionTabs
          tabs={STAT_TABS}
          active={stat}
          onChange={(id) => setStat(id as StatKey)}
        />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-4 py-4 text-xs font-bold uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(242,237,230,0.4)' }}>
          {STAT_LABELS[stat]} · עונה סדירה
        </div>

        {sorted.map((player, i) => (
          <motion.div
            key={player.name}
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: [0.25, 1, 0.5, 1] }}
            className="flex items-center gap-4 px-4 py-5"
            style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
          >
            {/* Rank */}
            <span
              className="text-lg font-black w-6 text-center shrink-0"
              style={{ color: i === 0 ? '#FF4D00' : 'rgba(242,237,230,0.3)' }}
            >
              {i + 1}
            </span>

            {/* Info */}
            <div className="flex flex-col min-w-0 shrink-0" style={{ width: '140px' }}>
              <span className="text-sm font-bold truncate" style={{ color: '#F2EDE6' }}>{player.name}</span>
              <span className="text-xs truncate" style={{ color: 'rgba(242,237,230,0.4)' }}>{player.team}</span>
            </div>

            {/* Bar */}
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: '6px', background: 'rgba(255,255,255,0.07)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: i === 0 ? '#FF4D00' : '#FFB300' }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(player[stat] / maxVal) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.05 + 0.2, ease: [0.25, 1, 0.5, 1] }}
                />
              </div>
              <span
                className="text-base font-black tabular-nums shrink-0"
                style={{ color: i === 0 ? '#FF4D00' : '#F2EDE6', minWidth: '3rem', textAlign: 'left' }}
              >
                {player[stat].toFixed(1)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:5174/#stats — confirm:
- "מובילות הליגה" heading is larger with orange right border
- Stats section is now full-width (not squeezed)
- Player rows are taller
- Rows slide in from right with stagger

- [ ] **Step 3: Commit**

```bash
cd /c/Users/Dana/projects/my-motion-app
git add src/components/ui/Stats.tsx
git commit -m "feat: Stats — full-width, larger heading, taller rows, stagger slide"
```

---

## Task 5: News.tsx — heading, gap, image height

**Files:**
- Modify: `src/components/ui/News.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import React from 'react';
import { motion } from 'framer-motion';
import { NEWS } from '../../data/league';

const TAG_COLORS: Record<string, string> = {
  'תוצאה':   '#FF4D00',
  'פלייאוף': '#FF4D00',
  'חדשות':   '#3B82F6',
  'ראיון':   '#8B5CF6',
  'העברות':  '#10B981',
  'עונה סדירה': '#FFB300',
  'סטטיסטיקה': '#FFB300',
};

const News: React.FC = () => (
  <section id="news" className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto" dir="rtl">
    <div className="flex items-center justify-between mb-10">
      <h2
        className="text-2xl md:text-3xl font-black border-r-4 pr-4"
        style={{ color: '#F2EDE6', borderColor: '#FF4D00' }}
      >
        חדשות וכתבות
      </h2>
      <a
        href="#"
        className="text-sm font-medium transition-colors"
        style={{ color: 'rgba(242,237,230,0.45)' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#FF4D00')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(242,237,230,0.45)')}
      >
        כל הכתבות ←
      </a>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {NEWS.map((article, i) => (
        <motion.article
          key={article.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, delay: i * 0.07, ease: [0.25, 1, 0.5, 1] }}
          whileHover={{ y: -4 }}
          className="rounded-2xl overflow-hidden cursor-pointer group"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Image */}
          <div className="relative overflow-hidden" style={{ height: '200px' }}>
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,8,12,0.7) 0%, transparent 50%)' }} />
            <span
              className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: TAG_COLORS[article.tag] ?? '#FF4D00', color: '#fff' }}
            >
              {article.tag}
            </span>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3
              className="text-sm font-bold leading-snug mb-2 line-clamp-2 transition-colors duration-150"
              style={{ color: '#F2EDE6' }}
            >
              {article.title}
            </h3>
            <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'rgba(242,237,230,0.45)' }}>
              {article.excerpt}
            </p>
            <span className="text-[11px]" style={{ color: 'rgba(242,237,230,0.3)' }}>
              {article.date}
            </span>
          </div>
        </motion.article>
      ))}
    </div>
  </section>
);

export default News;
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:5174/#news — confirm:
- "חדשות וכתבות" heading is larger with orange right border
- Cards are taller (image 200px) with more internal padding
- Gap between cards is wider
- Cards animate in with stagger on scroll

- [ ] **Step 3: Commit**

```bash
cd /c/Users/Dana/projects/my-motion-app
git add src/components/ui/News.tsx
git commit -m "feat: News — larger heading, gap-6, taller images, content padding"
```

---

## Done

All 5 tasks complete. The site now has:
- Consistent large section headings with orange right-border accent
- 2× more breathing room between and within sections
- Stats full-width (own row, not cramped next to Standings)
- Smooth stagger scroll animations on Results, Stats, News
- Subtle dividers between sections
