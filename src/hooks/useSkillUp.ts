import { useMemo } from "react";
import type { SongData } from "@/types/song";

export interface SkillUpItem {
  song: SongData;
  homeSkillGap: number;
  arcadeSkillGap: number;
  maxPotential: number;
}

export function useSkillUp(songs: SongData[]): SkillUpItem[] {
  return useMemo(() => {
    return songs
      .map((song) => {
        const maxSkill = song.難度數值 * 2;
        const homeSkillGap = maxSkill - (song["家用版 Skill 點數"] as number || 0);
        const arcadeSkillGap = maxSkill - (song["街機版 Skill 點數"] as number || 0);
        const maxPotential = Math.max(homeSkillGap, arcadeSkillGap);
        return { song, homeSkillGap, arcadeSkillGap, maxPotential };
      })
      .filter((item) => item.maxPotential > 0)
      .sort((a, b) => b.maxPotential - a.maxPotential);
  }, [songs]);
}
