import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { dbScoreToSongData } from "@/lib/adapter";
import type { ScoreRow, SongRow, GameType, ScoreSource } from "@/types/database";
import type { SongData } from "@/types/song";

export interface ScoreWithSong extends SongData {
  _scoreRow: ScoreRow;
  _songRow: SongRow;
}

export interface UseScoresOptions {
  userId: string | undefined;
  gameType?: GameType;
  source?: ScoreSource | "both";
  pageSize?: number;
  enabled?: boolean;
}

export function useScores({
  userId,
  gameType,
  source,
  pageSize = 50,
  enabled = true,
}: UseScoresOptions) {
  return useQuery({
    queryKey: ["scores", userId, gameType, source],
    enabled: enabled && !!userId,
    queryFn: async () => {
      let query = supabase
        .from("scores")
        .select("*, songs(*)")
        .eq("user_id", userId!)
        .order("skill_point", { ascending: false });

      if (gameType) query = query.eq("game_type", gameType);
      if (source && source !== "both") query = query.eq("source", source);

      const { data, error } = await query;
      if (error) throw error;

      return (data as Array<ScoreRow & { songs: SongRow }>).map((row) => ({
        ...dbScoreToSongData(row, row.songs),
        _scoreRow: row,
        _songRow: row.songs,
      })) as ScoreWithSong[];
    },
  });
}

/** Fetch scores for a specific friend (requires accepted friendship + RLS allows it) */
export function useFriendScores(friendId: string | undefined, gameType?: GameType) {
  return useQuery({
    queryKey: ["scores", "friend", friendId, gameType],
    enabled: !!friendId,
    queryFn: async () => {
      let query = supabase
        .from("scores")
        .select("*, songs(*)")
        .eq("user_id", friendId!)
        .order("skill_point", { ascending: false });

      if (gameType) query = query.eq("game_type", gameType);

      const { data, error } = await query;
      if (error) throw error;

      return (data as Array<ScoreRow & { songs: SongRow }>).map((row) => ({
        ...dbScoreToSongData(row, row.songs),
        _scoreRow: row,
        _songRow: row.songs,
      })) as ScoreWithSong[];
    },
  });
}
