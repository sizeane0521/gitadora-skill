import { useState, useMemo } from "react";
import type { SongData, GameMode } from "@/types/song";

export interface ScoreFilterState {
  gameMode: GameMode;
  searchQuery: string;
  selectedDifficulty: string;
  sortBy: string;
  showFavoritesOnly: boolean;
  skillUpMode: boolean;
}

export function useScoreFilter(initialMode: GameMode = "GF") {
  const [gameMode, setGameMode] = useState<GameMode>(initialMode);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("skill");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [skillUpMode, setSkillUpMode] = useState(false);

  const applyFilters = (songs: SongData[]) =>
    useMemo(() => {
      let filtered = songs;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.歌曲名稱.toLowerCase().includes(q) ||
            (s["歌名發音/分類"] ?? "").toLowerCase().includes(q)
        );
      }

      if (selectedDifficulty !== "all") {
        filtered = filtered.filter((s) => s.譜面等級 === selectedDifficulty);
      }

      if (showFavoritesOnly) {
        filtered = filtered.filter((s) => s.isFavorite === true || s.isFavorite === "true");
      }

      return [...filtered].sort((a, b) => {
        if (sortBy === "skill") {
          const aSkill = Math.max(
            a["家用版 Skill 點數"] as number,
            a["街機版 Skill 點數"] as number
          );
          const bSkill = Math.max(
            b["家用版 Skill 點數"] as number,
            b["街機版 Skill 點數"] as number
          );
          return bSkill - aSkill;
        }
        if (sortBy === "level") return b.難度數值 - a.難度數值;
        if (sortBy === "name") return a.歌曲名稱.localeCompare(b.歌曲名稱);
        return 0;
      });
    }, [songs, searchQuery, selectedDifficulty, sortBy, showFavoritesOnly]);

  return {
    gameMode,
    setGameMode,
    searchQuery,
    setSearchQuery,
    selectedDifficulty,
    setSelectedDifficulty,
    sortBy,
    setSortBy,
    showFavoritesOnly,
    setShowFavoritesOnly,
    skillUpMode,
    setSkillUpMode,
    applyFilters,
  };
}
