import { useQuery } from '@tanstack/react-query';
import { supabase } from './supabase';

// ── Types ─────────────────────────────────────────────────────────────────────
interface TeamRef {
  id: string;
  name: string;
  logo: string | null;
  home_color: string | null;
  away_color: string | null;
}

export interface GameWithTeams {
  id: string;
  season_id: string;
  round: string | null;
  date: string | null;
  time: string | null;
  home_team_id: string;
  away_team_id: string;
  hall: string | null;
  status: 'scheduled' | 'postponed' | 'played' | 'cancelled';
  home_score: number | null;
  away_score: number | null;
  quarter_scores: { q: number; home: number | null; away: number | null }[] | null;
  watch_url: string | null;
  stats_url: string | null;
  home_team: TeamRef | null;
  away_team: TeamRef | null;
}

export interface PlayerGameStat {
  id: string;
  player_id: string;
  game_id: string;
  team_id: string;
  minutes: number | null;
  points: number | null;
  rebounds: number | null;
  offensive_rebounds: number | null;
  defensive_rebounds: number | null;
  assists: number | null;
  steals: number | null;
  blocks: number | null;
  turnovers: number | null;
  fouls: number | null;
  fg2_made: number | null;
  fg2_attempted: number | null;
  fg3_made: number | null;
  fg3_attempted: number | null;
  ft_made: number | null;
  ft_attempted: number | null;
  efficiency: number | null;
  player: { id: string; first_name: string; last_name: string } | null;
}

export interface PlayerProfile {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  nationality: string | null;
  country_of_origin: string | null;
  height: number | null;
  position: 'point_guard' | 'shooting_guard' | 'small_forward' | 'power_forward' | 'center' | null;
  status: string;
  classification: 'israeli' | 'naturalized' | 'foreign' | 'bosman';
  photo: string | null;
  current_team: { id: string; name: string; logo: string | null } | null;
  current_jersey: number | null;
}

export interface PlayerStatRow extends PlayerGameStat {
  game: {
    id: string;
    date: string | null;
    home_team_id: string;
    away_team_id: string;
    home_score: number | null;
    away_score: number | null;
    home_team: { id: string; name: string } | null;
    away_team: { id: string; name: string } | null;
  } | null;
}

export interface SeasonAverages {
  games: number;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  mpg: number;
  eff_avg: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const sumKey = (rows: PlayerGameStat[], key: keyof PlayerGameStat): number =>
  rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);

export const calcAverages = (rows: PlayerGameStat[]): SeasonAverages => {
  const games = rows.length;
  if (games === 0) return { games: 0, ppg: 0, rpg: 0, apg: 0, spg: 0, bpg: 0, mpg: 0, eff_avg: 0 };
  return {
    games,
    ppg: round1(sumKey(rows, 'points') / games),
    rpg: round1(sumKey(rows, 'rebounds') / games),
    apg: round1(sumKey(rows, 'assists') / games),
    spg: round1(sumKey(rows, 'steals') / games),
    bpg: round1(sumKey(rows, 'blocks') / games),
    mpg: round1(sumKey(rows, 'minutes') / games),
    eff_avg: round1(sumKey(rows, 'efficiency') / games),
  };
};

const SELECT_GAME =
  '*, home_team:teams!games_home_team_id_fkey(id, name, logo, home_color, away_color),' +
  ' away_team:teams!games_away_team_id_fkey(id, name, logo, home_color, away_color)';

const fetchActiveSeasonId = async (): Promise<string | null> => {
  const { data } = await supabase
    .from('seasons').select('id').eq('status', 'active').maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
};

// ── Hooks ─────────────────────────────────────────────────────────────────────
export const useRecentResults = () =>
  useQuery({
    queryKey: ['games', 'recent'],
    queryFn: async (): Promise<GameWithTeams[]> => {
      const seasonId = await fetchActiveSeasonId();
      if (!seasonId) return [];
      const { data, error } = await supabase
        .from('games')
        .select(SELECT_GAME)
        .eq('season_id', seasonId)
        .eq('status', 'played')
        .order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as GameWithTeams[];
    },
    staleTime: 1000 * 60 * 5,
  });

export const useUpcomingGames = () =>
  useQuery({
    queryKey: ['games', 'upcoming'],
    queryFn: async (): Promise<GameWithTeams[]> => {
      const seasonId = await fetchActiveSeasonId();
      if (!seasonId) return [];
      const { data, error } = await supabase
        .from('games')
        .select(SELECT_GAME)
        .eq('season_id', seasonId)
        .eq('status', 'scheduled')
        .order('date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as GameWithTeams[];
    },
    staleTime: 1000 * 60 * 5,
  });

export const useMatch = (id: string | undefined) =>
  useQuery({
    queryKey: ['match', id],
    enabled: !!id,
    queryFn: async (): Promise<GameWithTeams | null> => {
      const { data, error } = await supabase
        .from('games')
        .select(SELECT_GAME)
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as GameWithTeams | null;
    },
  });

export const useMatchStats = (id: string | undefined) =>
  useQuery({
    queryKey: ['match_stats', id],
    enabled: !!id,
    queryFn: async (): Promise<PlayerGameStat[]> => {
      const { data, error } = await supabase
        .from('player_game_stats')
        .select('*, player:players(id, first_name, last_name)')
        .eq('game_id', id!);
      if (error) throw error;
      return (data ?? []) as unknown as PlayerGameStat[];
    },
  });

/** Returns a Map<player_id, jersey_number> for a given (season, team). */
export const useTeamJerseys = (seasonId: string | undefined, teamId: string | undefined) =>
  useQuery({
    queryKey: ['team_jerseys', seasonId, teamId],
    enabled: !!seasonId && !!teamId,
    queryFn: async (): Promise<Map<string, number | null>> => {
      const { data, error } = await supabase
        .from('player_team_seasons')
        .select('player_id, jersey_number')
        .eq('season_id', seasonId!)
        .eq('team_id', teamId!);
      if (error) throw error;
      const map = new Map<string, number | null>();
      ((data ?? []) as Array<{ player_id: string; jersey_number: number | null }>).forEach((r) => {
        map.set(r.player_id, r.jersey_number);
      });
      return map;
    },
  });

export const usePlayer = (id: string | undefined) =>
  useQuery({
    queryKey: ['player', id],
    enabled: !!id,
    queryFn: async (): Promise<PlayerProfile | null> => {
      const { data: player, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      if (!player) return null;

      // Fetch the current-season team + jersey
      const { data: activeSeason } = await supabase
        .from('seasons').select('id').eq('status', 'active').maybeSingle();
      const seasonId = (activeSeason as { id: string } | null)?.id ?? null;
      let current_team: PlayerProfile['current_team'] = null;
      let current_jersey: number | null = null;
      if (seasonId) {
        const { data: pts } = await supabase
          .from('player_team_seasons')
          .select('jersey_number, team:teams(id, name, logo)')
          .eq('player_id', id!)
          .eq('season_id', seasonId)
          .maybeSingle();
        if (pts) {
          const row = pts as { jersey_number: number | null; team: { id: string; name: string; logo: string | null } | null };
          current_team = row.team;
          current_jersey = row.jersey_number;
        }
      }

      return { ...(player as Omit<PlayerProfile, 'current_team' | 'current_jersey'>), current_team, current_jersey };
    },
  });

export const usePlayerStats = (id: string | undefined) =>
  useQuery({
    queryKey: ['player_stats', id],
    enabled: !!id,
    queryFn: async (): Promise<PlayerStatRow[]> => {
      const { data: activeSeason } = await supabase
        .from('seasons').select('id').eq('status', 'active').maybeSingle();
      const seasonId = (activeSeason as { id: string } | null)?.id ?? null;
      if (!seasonId) return [];

      const { data: gameIds } = await supabase
        .from('games').select('id').eq('season_id', seasonId);
      const ids = (gameIds ?? []).map((r: { id: string }) => r.id);
      if (ids.length === 0) return [];

      const { data, error } = await supabase
        .from('player_game_stats')
        .select(
          '*, game:games(id, date, home_team_id, away_team_id, home_score, away_score,' +
            ' home_team:teams!games_home_team_id_fkey(id, name),' +
            ' away_team:teams!games_away_team_id_fkey(id, name))'
        )
        .eq('player_id', id!)
        .in('game_id', ids);
      if (error) throw error;
      const rows = (data ?? []) as unknown as PlayerStatRow[];
      rows.sort((a, b) => (b.game?.date ?? '').localeCompare(a.game?.date ?? ''));
      return rows;
    },
  });
