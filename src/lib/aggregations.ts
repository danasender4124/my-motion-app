import type { GameWithTeams } from './queries';

export interface TeamSeasonStats {
  wins: number;
  losses: number;
  points_for: number;
  points_against: number;
  position: number | null;
}

const teamRecord = (teamId: string, games: GameWithTeams[]) => {
  let wins = 0, losses = 0, pf = 0, pa = 0;
  for (const g of games) {
    if (g.status !== 'played' || g.home_score == null || g.away_score == null) continue;
    const isHome = g.home_team_id === teamId;
    if (!isHome && g.away_team_id !== teamId) continue;
    const myScore = isHome ? g.home_score : g.away_score;
    const oppScore = isHome ? g.away_score : g.home_score;
    pf += myScore;
    pa += oppScore;
    if (myScore > oppScore) wins++;
    else if (myScore < oppScore) losses++;
  }
  return { wins, losses, points_for: pf, points_against: pa };
};

/**
 * Compute the league position (1-based) for the given team given all season games.
 * Standings are sorted by: wins desc, then point differential desc.
 * Returns null if no teams have played any games yet.
 */
const leaguePosition = (teamId: string, allTeamIds: string[], games: GameWithTeams[]): number | null => {
  const records = allTeamIds.map((tid) => ({ tid, ...teamRecord(tid, games) }));
  if (records.every((r) => r.wins === 0 && r.losses === 0)) return null;
  records.sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return (b.points_for - b.points_against) - (a.points_for - a.points_against);
  });
  const idx = records.findIndex((r) => r.tid === teamId);
  return idx >= 0 ? idx + 1 : null;
};

export const computeTeamSeasonStats = (
  teamId: string,
  teamGames: GameWithTeams[],
  allTeamIds: string[],
  allSeasonGames: GameWithTeams[],
): TeamSeasonStats => {
  const rec = teamRecord(teamId, teamGames);
  return {
    ...rec,
    position: leaguePosition(teamId, allTeamIds, allSeasonGames),
  };
};
