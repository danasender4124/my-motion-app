# Navigation & Tabs Redesign — Design Spec
Date: 2026-04-20

## Goal
Improve the visual organization of navigation and tabs to match the spread-out, structured layout of basket.co.il (men's league site), while keeping the existing dark color palette (#07080C background, #FF4D00 orange accents).

## Reference
basket.co.il — full-width orange nav bar, spread nav links, prominent section tabs.

---

## 1. Header Restructure

### Before
Single row: Logo (right) + nav links (center) + כרטיסים button (left)

### After — Two rows

**Row 1:** Logo only (right-aligned)
- Logo: orange basketball icon + "מנהלת / ליגת העל נשים" text
- No nav links, no buttons in this row
- Height: ~62px (unchanged)
- Background: `#0A0E1A`

**Row 2:** Full-width orange nav bar
- Background: `#FF4D00`
- All 7 nav links spread evenly across the full width (`justify-around`)
- Text: white, bold (`font-weight: 700`)
- Active item: white underline (`border-bottom: 2px solid #fff`)
- Height: ~38px
- `dir="rtl"`

**Nav links (unchanged):**
בית · תוצאות · לוח משחקים · טבלת הליגה · קבוצות · חדשות · סטטיסטיקה

**Mobile (< lg):**
Row 2 collapses into the existing hamburger menu (already in `Header.tsx`). The hamburger button moves to row 1.

---

## 2. Results Section — Tab Bar Redesign

### Before
Small pill toggle in top-right corner: `[תוצאות | לוח משחקים]`

### After
Three prominent buttons in a left-aligned row below the section title:
1. `תוצאות` — active state: `#FF4D00` solid fill, white text
2. `לוח משחקים` — inactive: `rgba(255,255,255,0.07)` bg, muted text
3. `מחזור 22 ▾` — round selector dropdown (static display for now, future: dropdown)

Button style:
- `px-5 py-2 rounded-lg text-sm font-bold`
- Min-width consistent so buttons don't jump on tab switch
- Transition: `duration-200`

---

## 3. Standings & Stats — Consistent Tab Style

Create a shared `SectionTabs` component (reusable) used by Results, Standings, and Stats.

Props: `tabs: { id, label }[]`, `active: string`, `onChange: (id) => void`

Renders the same prominent button row as Results section above.

Standings tabs: `טבלה` (default) — only one tab for now, but component ready for expansion.
Stats tabs: `סטטיסטיקה` — same, single tab initially.

---

## 4. Components Affected

| File | Change |
|------|--------|
| `Header.tsx` | Split into two rows, remove כרטיסים button, move nav to orange bar |
| `Results.tsx` | Replace pill toggle with new tab bar |
| `Standings.tsx` | Add SectionTabs component |
| `Stats.tsx` | Add SectionTabs component |
| New: `SectionTabs.tsx` | Shared tab bar component |

---

## 5. Out of Scope
- Team logos row (requires real logo assets)
- Dropdown for round selector (static label for now)
- Any changes to hero section, news, footer, or data
