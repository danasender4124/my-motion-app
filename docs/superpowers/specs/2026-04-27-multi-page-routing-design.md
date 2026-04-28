# Multi-Page Routing & basket.co.il Structure — Design Spec
Date: 2026-04-27

## Goal
Replace the single-page scrolling / tab-switching layout with proper multi-page routing (React Router), an orange sticky NavBar, and a per-page PageBanner — all while preserving the existing dark theme and Framer Motion animations.

## Reference
basket.co.il structure adapted to our dark aesthetic:
- Orange navbar for primary navigation
- Per-page hero banner with arena background + large page title
- Real URLs per section

## Out of Scope
- Color palette changes (dark theme stays)
- Data changes
- ScoreTicker changes
- Footer changes
- Content component internals (Results, Standings, Stats, News)

---

## Architecture

### Router
Use `react-router-dom` v7 with `BrowserRouter`. Routes defined in `App.jsx`:

| Route | Component | Page title |
|-------|-----------|------------|
| `/` | `<HomePage>` | — (Hero section, no banner) |
| `/results` | `<ResultsPage>` | משחקים ותוצאות |
| `/standings` | `<StandingsPage>` | טבלת הליגה |
| `/stats` | `<StatsPage>` | סטטיסטיקה |
| `/news` | `<NewsPage>` | חדשות וכתבות |

### HomePage (`/`)
Renders the existing `<HeroSection>` as-is. No PageBanner. The NavBar appears below the Header.

### Inner pages (`/results`, `/standings`, `/stats`, `/news`)
Each renders:
1. `<PageBanner title="..." />` — full-width stadium banner with page title
2. The existing content component (`<Results />`, `<Standings />`, etc.)

---

## New Components

### `NavBar.tsx`
**Location:** `src/components/ui/NavBar.tsx`

Sticky bar below the Header. Full-width orange background (`#FF4D00`).
RTL layout, links right-to-left: עמוד ראשי | לוח משחקים | טבלה | סטטיסטיקה | חדשות

- Uses `<NavLink>` from react-router-dom for active state detection
- Active link: white text + white underline indicator (2px, bottom of bar)
- Inactive link: white/80% opacity, no underline
- `layoutId="nav-indicator"` on the active indicator for Framer Motion spring transition between links
- Height: `py-3` (48px total)
- Font: `text-sm font-bold`
- Sticky: `sticky top-0 z-40`

```tsx
// Link structure (RTL order, right to left visually):
const NAV_LINKS = [
  { to: '/',          label: 'עמוד ראשי' },
  { to: '/results',   label: 'לוח משחקים' },
  { to: '/standings', label: 'טבלה' },
  { to: '/stats',     label: 'סטטיסטיקה' },
  { to: '/news',      label: 'חדשות' },
]
```

### `PageBanner.tsx`
**Location:** `src/components/ui/PageBanner.tsx`

Full-width hero banner shown at the top of each inner page.

- Height: `h-48 md:h-64`
- Background: dark arena image (`/arena.jpg`) with dark overlay (`rgba(7,8,12,0.65)`)
- If no arena image exists: gradient fallback `linear-gradient(135deg, #0f1117 0%, #1a1f2e 50%, #0f1117 100%)`
- Title: large bold Hebrew text, white, centered
  - Size: `text-4xl md:text-6xl font-black`
  - Framer Motion: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`
  - Transition: `duration: 0.5, ease: EASE_OUT_EXPO`
- Orange accent line: 4px bottom border `border-b-4 border-[#FF4D00]`

Props:
```tsx
interface PageBannerProps {
  title: string
}
```

---

## Modified Files

### `src/App.jsx`
- Wrap everything in `<BrowserRouter>`
- Define routes with `<Routes>` / `<Route>`
- Move `<NavBar>` inside the layout, below `<Header>` and `<ScoreTicker>`
- Remove the old `TabNav` component and `activeTab` state
- Add a shared layout wrapper: `ScoreTicker → Header → NavBar → <Outlet />`

```jsx
// Structure:
<BrowserRouter>
  <ScoreTicker />
  <Header />
  <NavBar />
  <main>
    <Routes>
      <Route path="/" element={<HeroSection />} />
      <Route path="/results" element={<><PageBanner title="משחקים ותוצאות" /><Results /></>} />
      <Route path="/standings" element={<><PageBanner title="טבלת הליגה" /><Standings /></>} />
      <Route path="/stats" element={<><PageBanner title="סטטיסטיקה" /><Stats /></>} />
      <Route path="/news" element={<><PageBanner title="חדשות וכתבות" /><News /></>} />
    </Routes>
  </main>
  <Footer />
</BrowserRouter>
```

### `src/components/ui/Header.tsx`
- Update nav links (`href="#results"` etc.) to use React Router `<Link to="/results">` etc.
- No other changes.

---

## Dependencies
Add `react-router-dom` (v7, already compatible with React 19):
```bash
npm install react-router-dom
```

---

## Assets
Add `/public/arena.jpg` — a dark basketball arena image for PageBanner backgrounds.
If not available, the CSS gradient fallback is used automatically (no broken images).

---

## Files Changed Summary

| File | Action |
|------|--------|
| `src/App.jsx` | Replace TabNav with BrowserRouter + Routes |
| `src/components/ui/NavBar.tsx` | Create — orange sticky nav with router links |
| `src/components/ui/PageBanner.tsx` | Create — per-page hero banner |
| `src/components/ui/Header.tsx` | Update href → Link to= |
| `package.json` | Add react-router-dom |

**Not changed:** Results.tsx, Standings.tsx, Stats.tsx, News.tsx, ScoreTicker.tsx, hero-odyssey.tsx, Footer.tsx, league.ts
