import { useMemo } from "react";
import type { SongData } from "@/types/song";

export interface KasegiItem {
  songData: SongData;
  currentSkill: number;
  maxSkill: number;
  kasegiPotential: number;
}

export interface KasegiFilterOptions {
  minLevel?: number;
  maxLevel?: number;
  hideExc?: boolean;
  source?: "arcade" | "konaste" | "both";
}

export function calculateKasegiPotential(
  level: number,
  achievementRate: number
): { currentSkill: number; maxSkill: number; kasegiPotential: number } {
  const currentSkill = level * (achievementRate / 100) * 2;
  const maxSkill = level * 2;
  const kasegiPotential = maxSkill - currentSkill;
  return { currentSkill, maxSkill, kasegiPotential };
}

export function useKasegi(
  scores: SongData[] | undefined,
  filters: KasegiFilterOptions = {}
): KasegiItem[] {
  return useMemo(() => {
    if (!scores) return [];

    const { minLevel, maxLevel, hideExc, source } = filters;

    return scores
      .filter((s) => {
        if (hideExc && s._isExcellent) return false;
        if (source && source !== "both" && s._source !== source) return false;
        const level = s.難度數值;
        if (minLevel != null && level < minLevel) return false;
        if (maxLevel != null && level > maxLevel) return false;
        return true;
      })
      .map((s) => {
        const achievementRate =
          s._source === "konaste"
            ? (s["家用版最佳達成率 (%)"] as number)
            : (s["街機版最佳達成率 (%)"] as number);
        const calc = calculateKasegiPotential(s.難度數值, achievementRate);
        return { songData: s, ...calc };
      })
      .sort((a, b) => b.kasegiPotential - a.kasegiPotential);
  }, [scores, filters]);
}
