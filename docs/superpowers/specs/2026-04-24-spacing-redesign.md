# Spacing & Layout Redesign — Design Spec
Date: 2026-04-24

## Goal
Make all sections feel spacious, clear, and well-organized. Eliminate visual crowding by increasing whitespace, adding prominent section headers, restructuring the Stats layout, and enhancing scroll animations.

## Out of Scope
- Color palette changes
- New features or data
- Hero section changes
- ScoreTicker changes

---

## 1. Section Vertical Rhythm

All `<section>` elements (Results, Standings, Stats, News) change:

| Before | After |
|--------|-------|
| `py-12` | `py-16 md:py-24` |
| section header `mb-6` | `mb-10` |

---

## 2. Section Header Style

Every section `h2` title gets a unified treatment:

**Before:** `text-xl font-black`

**After:**
- Size: `text-2xl md:text-3xl font-black`
- Right border accent: `border-r-4 border-[#FF4D00] pr-4` (RTL, so right side)
- Bottom margin: `mb-10`

The pill badge (e.g. "עונה 2025 · פלייאוף") stays as-is, positioned opposite the title.

---

## 3. Results Section

### Card grid
- Gap: `gap-3` → `gap-6`

### Result card interior
- Date strip: `py-2` → `py-3`
- Score area: `py-4` → `py-6`
- Team name font: stays `text-sm`, score stays `text-xl`

### Upcoming game card interior
- `py-4` → `py-6`

---

## 4. Standings Section

### Table rows
- Row padding: `py-3` → `py-5`
- Header row: `py-3` → `py-4`

---

## 5. Stats Section — Layout Change

**Before:** `xl:col-span-1` inside a 3-column grid next to Standings (cramped at ~33% width)

**After:** Full-width section on its own row, below Standings. The App layout becomes:

```
<Results />
<Standings />   ← full width
<Stats />       ← full width, own row
<News />
```

Remove the `grid grid-cols-1 xl:grid-cols-3` wrapper from `App.jsx`. Both components become independent full-width sections.

### Stats player row
- Row padding: `py-4` → `py-5`
- Bar track height: stays `h-1.5`

---

## 6. News Section

### Card grid
- Gap: `gap-4` → `gap-6`

### Card image
- Height: `h-40` → `h-48`

---

## 7. Section Separators

Add a single `<hr>` styled with `border-t border-white/[0.06]` between each major section in `App.jsx`. This creates clear visual breaks without heaviness.

---

## 8. Framer Motion Enhancements

### Results cards (already has `whileInView`)
- Change `transition` delay to stagger: item `i` gets `delay: i * 0.07`
- Ensure `viewport={{ once: true, amount: 0.1 }}`

### News cards (already has basic animation)
- Add stagger: item `i` gets `delay: i * 0.07`
- Add `whileHover={{ y: -4 }}` subtle lift

### Stats player rows
- Add stagger: item `i` gets `delay: i * 0.05`

### Section headers
- Add `initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}`

---

## 9. Files Changed

| File | Change |
|------|--------|
| `src/App.jsx` | Remove Standings+Stats grid wrapper, add `<hr>` separators |
| `src/components/ui/Results.tsx` | Card gap, internal padding, stagger delays |
| `src/components/ui/Standings.tsx` | Row padding, header style |
| `src/components/ui/Stats.tsx` | Section padding, row padding, stagger |
| `src/components/ui/News.tsx` | Card gap, image height, stagger, hover lift |

**Not changed:** `Header.tsx`, `Footer.tsx`, `ScoreTicker.tsx`, `hero-odyssey.tsx`, `SectionTabs.tsx`, `data/league.ts`
