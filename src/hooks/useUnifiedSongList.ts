import { useMemo } from "react";
import { useScores } from "@/hooks/useScores";
import { useAuthContext } from "@/hooks/useAuthContext";
import type { SongData, GameMode } from "@/types/song";

/** Merge arcade + konaste score records into one SongData per song+difficulty */
export function useUnifiedSongList(mode: GameMode): { data: SongData[]; isLoading: boolean } {
  const { user } = useAuthContext();
  const gameType = mode === "GF" ? "GF" : ("DM" as const);

  const { data: arcadeData, isLoading: arcadeLoading } = useScores({
    userId: user?.id,
    gameType,
    source: "arcade",
    enabled: !!user?.id,
  });

  const { data: konsteData, isLoading: konsteLoading } = useScores({
    userId: user?.id,
    gameType,
    source: "konaste",
    enabled: !!user?.id,
  });

  const isLoading = arcadeLoading || konsteLoading;

  const data = useMemo<SongData[]>(() => {
    const makeKey = (s: SongData) =>
      `${s.歌曲名稱}|${s.樂器類型}|${s.譜面等級}`;

    const arcadeMap = new Map<string, SongData>();
    for (const s of arcadeData ?? []) arcadeMap.set(makeKey(s), s);

    const konsteMap = new Map<string, SongData>();
    for (const s of konsteData ?? []) konsteMap.set(makeKey(s), s);

    const allKeys = new Set([...arcadeMap.keys(), ...konsteMap.keys()]);

    return Array.from(allKeys).map((key) => {
      const arcade = arcadeMap.get(key);
      const konste = konsteMap.get(key);
      const base = arcade ?? konste!;
      return {
        ...base,
        "街機版最佳達成率 (%)": arcade?.["街機版最佳達成率 (%)"] ?? 0,
        "街機版 Skill 點數": arcade?.["街機版 Skill 點數"] ?? 0,
        "家用版最佳達成率 (%)": konste?.["家用版最佳達成率 (%)"] ?? 0,
        "家用版 Skill 點數": konste?.["家用版 Skill 點數"] ?? 0,
      };
    });
  }, [arcadeData, konsteData]);

  return { data, isLoading };
}
