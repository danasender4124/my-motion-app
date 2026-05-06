// Hard-coded standings to match basket.co.il / ibasketball.co.il IBA values.
// Used by both /standings and /team/:id so a single source of truth keeps
// the public site aligned with the official league standings.
//
// To update at season changes, edit STANDINGS_OVERRIDE here.

export interface StandingsOverrideRow {
  /** Substring used to match the team name in the DB (case-insensitive). */
  match: string;
  wins: number;
  losses: number;
  points_for: number;
  points_against: number;
}

// Order of this array IS the standings order (upper bracket first, then lower).
// We don't sort — the IBA bracket play means a lower-bracket team can have more
// wins than an upper-bracket team but still rank below them.
export const STANDINGS_OVERRIDE: StandingsOverrideRow[] = [
  // ── בית עליון ──
  { match: 'רמת גן',         wins: 21, losses: 2,  points_for: 1913, points_against: 1573 },
  { match: 'אשדוד',          wins: 15, losses: 8,  points_for: 1749, points_against: 1629 },
  { match: 'ראשון',          wins: 13, losses: 10, points_for: 1668, points_against: 1580 },
  { match: 'רמלה',           wins: 12, losses: 11, points_for: 1792, points_against: 1752 },
  { match: 'חולון',          wins: 10, losses: 13, points_for: 1748, points_against: 1791 },
  { match: 'פתח תקווה',      wins: 10, losses: 13, points_for: 1603, points_against: 1766 },
  // ── בית תחתון ──
  { match: 'כרמיאל',         wins: 12, losses: 12, points_for: 1734, points_against: 1698 },
  { match: 'הפניקס',         wins: 12, losses: 12, points_for: 1758, points_against: 1736 },
  { match: 'ירושלים',        wins: 10, losses: 14, points_for: 1736, points_against: 1782 },
  { match: 'דימונה',         wins: 2,  losses: 22, points_for: 1639, points_against: 2033 },
];

/** Look up override stats for a team by name. Returns null if no match. */
export const findOverrideForTeam = (teamName: string): StandingsOverrideRow | null => {
  for (const ov of STANDINGS_OVERRIDE) {
    if (teamName.includes(ov.match)) return ov;
  }
  return null;
};

/** League position (1-based) for a team based on the override array order. */
export const findOverridePosition = (teamName: string): number | null => {
  const idx = STANDINGS_OVERRIDE.findIndex((ov) => teamName.includes(ov.match));
  return idx >= 0 ? idx + 1 : null;
};
