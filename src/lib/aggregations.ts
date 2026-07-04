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

export type LeaderCategoryKey =
  | 'ppg' | 'rpg' | 'apg' | 'eff' | 'mpg'
  | 'spg' | 'topg' | 'ato' | 'bpg' | 'ft_pct'
  | 'fg2_pct' | 'fg3_pct' | 'ft_made_pg' | 'fg2_made_pg' | 'fg3_made_pg';

export interface LeagueLeaderRow {
  player_id: string;
  first_name: string;
  last_name: string;
  first_name_en?: string | null;
  last_name_en?: string | null;
  photo: string | null;
  team_id: string | null;
  team_name: string | null;
  team_name_en?: string | null;
  team_logo: string | null;
  value: number;
  games: number;
}

export type LeagueLeaders = Record<LeaderCategoryKey, LeagueLeaderRow[]>;

/** Stats-row shape consumed by computeLeagueLeaders — kept lean to keep the helper pure. */
export interface LeaderInputRow {
  player_id: string;
  team_id: string;
  game_id: string;
  minutes: number | null;
  points: number | null;
  rebounds: number | null;
  assists: number | null;
  steals: number | null;
  blocks: number | null;
  turnovers: number | null;
  efficiency: number | null;
  fg2_made: number | null;
  fg2_attempted: number | null;
  fg3_made: number | null;
  fg3_attempted: number | null;
  ft_made: number | null;
  ft_attempted: number | null;
  player: { id: string; first_name: string; last_name: string; first_name_en?: string | null; last_name_en?: string | null; photo: string | null } | null;
  team: { id: string; name: string; name_en?: string | null; logo: string | null } | null;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const num = (n: number | null | undefined) => Number(n ?? 0);

interface PlayerAgg {
  player_id: string;
  first_name: string;
  last_name: string;
  first_name_en: string | null;
  last_name_en: string | null;
  photo: string | null;
  team_id: string | null;
  team_name: string | null;
  team_name_en: string | null;
  team_logo: string | null;
  games: number;
  sums: {
    minutes: number; points: number; rebounds: number; assists: number;
    steals: number; blocks: number; turnovers: number; efficiency: number;
    fg2m: number; fg2a: number; fg3m: number; fg3a: number; ftm: number; fta: number;
  };
}

const empty = (): LeagueLeaders => ({
  ppg: [], rpg: [], apg: [], eff: [], mpg: [],
  spg: [], topg: [], ato: [], bpg: [], ft_pct: [],
  fg2_pct: [], fg3_pct: [], ft_made_pg: [], fg2_made_pg: [], fg3_made_pg: [],
});

const PCT_KEYS: LeaderCategoryKey[] = ['ft_pct', 'fg2_pct', 'fg3_pct'];
const ASCENDING_KEYS: LeaderCategoryKey[] = ['topg']; // fewer turnovers = better

const PCT_MIN_ATTEMPTS: Record<'ft_pct' | 'fg2_pct' | 'fg3_pct', number> = {
  ft_pct: 10,
  fg2_pct: 10,
  fg3_pct: 10,
};

/**
 * Pure aggregation: given per-game stat rows (already filtered to the desired games), compute
 * top-5 leaders for each category.
 */
export const computeLeagueLeaders = (rows: LeaderInputRow[]): LeagueLeaders => {
  const byPlayer = new Map<string, PlayerAgg>();

  for (const r of rows) {
    if (!r.player) continue;
    const cur = byPlayer.get(r.player_id) ?? {
      player_id: r.player_id,
      first_name: r.player.first_name,
      last_name: r.player.last_name,
      first_name_en: r.player.first_name_en ?? null,
      last_name_en: r.player.last_name_en ?? null,
      photo: r.player.photo,
      team_id: r.team?.id ?? r.team_id,
      team_name: r.team?.name ?? null,
      team_name_en: r.team?.name_en ?? null,
      team_logo: r.team?.logo ?? null,
      games: 0,
      sums: { minutes: 0, points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, efficiency: 0, fg2m: 0, fg2a: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0 },
    };
    cur.games += 1;
    cur.sums.minutes    += num(r.minutes);
    cur.sums.points     += num(r.points);
    cur.sums.rebounds   += num(r.rebounds);
    cur.sums.assists    += num(r.assists);
    cur.sums.steals     += num(r.steals);
    cur.sums.blocks     += num(r.blocks);
    cur.sums.turnovers  += num(r.turnovers);
    cur.sums.efficiency += num(r.efficiency);
    cur.sums.fg2m       += num(r.fg2_made);
    cur.sums.fg2a       += num(r.fg2_attempted);
    cur.sums.fg3m       += num(r.fg3_made);
    cur.sums.fg3a       += num(r.fg3_attempted);
    cur.sums.ftm        += num(r.ft_made);
    cur.sums.fta        += num(r.ft_attempted);
    if (r.team) {
      cur.team_id = r.team.id;
      cur.team_name = r.team.name;
      cur.team_name_en = r.team.name_en ?? null;
      cur.team_logo = r.team.logo;
    }
    byPlayer.set(r.player_id, cur);
  }

  const valueFor = (a: PlayerAgg, key: LeaderCategoryKey): number => {
    const g = a.games || 1;
    switch (key) {
      case 'ppg':         return a.sums.points / g;
      case 'rpg':         return a.sums.rebounds / g;
      case 'apg':         return a.sums.assists / g;
      case 'eff':         return a.sums.efficiency / g;
      case 'mpg':         return a.sums.minutes / g;
      case 'spg':         return a.sums.steals / g;
      case 'topg':        return a.sums.turnovers / g;
      case 'bpg':         return a.sums.blocks / g;
      case 'ato':         return a.sums.turnovers > 0 ? a.sums.assists / a.sums.turnovers : a.sums.assists;
      case 'ft_pct':      return a.sums.fta > 0 ? (a.sums.ftm / a.sums.fta) * 100 : 0;
      case 'fg2_pct':     return a.sums.fg2a > 0 ? (a.sums.fg2m / a.sums.fg2a) * 100 : 0;
      case 'fg3_pct':     return a.sums.fg3a > 0 ? (a.sums.fg3m / a.sums.fg3a) * 100 : 0;
      case 'ft_made_pg':  return a.sums.ftm / g;
      case 'fg2_made_pg': return a.sums.fg2m / g;
      case 'fg3_made_pg': return a.sums.fg3m / g;
    }
  };

  const eligible = (a: PlayerAgg, key: LeaderCategoryKey): boolean => {
    if (a.games < 1) return false;
    if (key === 'ft_pct')  return a.sums.fta >= PCT_MIN_ATTEMPTS.ft_pct;
    if (key === 'fg2_pct') return a.sums.fg2a >= PCT_MIN_ATTEMPTS.fg2_pct;
    if (key === 'fg3_pct') return a.sums.fg3a >= PCT_MIN_ATTEMPTS.fg3_pct;
    return true;
  };

  const out = empty();
  const allKeys: LeaderCategoryKey[] = [
    'ppg','rpg','apg','eff','mpg',
    'spg','topg','ato','bpg','ft_pct',
    'fg2_pct','fg3_pct','ft_made_pg','fg2_made_pg','fg3_made_pg',
  ];
  for (const key of allKeys) {
    const candidates = Array.from(byPlayer.values())
      .filter((a) => eligible(a, key))
      .map((a) => ({ a, v: valueFor(a, key) }));
    candidates.sort((x, y) => ASCENDING_KEYS.includes(key) ? x.v - y.v : y.v - x.v);
    out[key] = candidates.map(({ a, v }) => ({
      player_id: a.player_id,
      first_name: a.first_name,
      last_name: a.last_name,
      first_name_en: a.first_name_en,
      last_name_en: a.last_name_en,
      photo: a.photo,
      team_id: a.team_id,
      team_name: a.team_name,
      team_name_en: a.team_name_en,
      team_logo: a.team_logo,
      value: PCT_KEYS.includes(key) ? round1(v) : round1(v),
      games: a.games,
    }));
  }
  return out;
};
