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
