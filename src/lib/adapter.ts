import type { ScoreRow, SongRow } from "@/types/database";
import type { SongData } from "@/types/song";

const ZETARAKU_COVER_BASE = "https://dp4p6x0xfi5o9.cloudfront.net/gitadora/img/cover";

const DIFFICULTY_MAP: Record<string, string> = {
  BSC: "BSC",
  ADV: "ADV",
  EXT: "EXT",
  MAS: "MAS",
};

const INSTRUMENT_MAP: Record<string, string> = {
  GF: "Guitar",
  DM: "Drums",
  guitar: "Guitar",
  bass: "Bass",
  drums: "Drums",
};

/** Supabase score + song row → legacy SongData UI type */
export function dbScoreToSongData(
  score: ScoreRow,
  song: SongRow
): SongData {
  const difficulty = DIFFICULTY_MAP[score.difficulty] ?? score.difficulty;
  const instrument = song.instrument
    ? INSTRUMENT_MAP[song.instrument] ?? song.instrument
    : INSTRUMENT_MAP[score.game_type] ?? score.game_type;

  const levelKey = `level_${score.difficulty.toLowerCase()}` as keyof SongRow;
  const level = (score.level_value ?? (song[levelKey] as number | null)) ?? 0;

  const isArcade = score.source === "arcade";
  const isKonaste = score.source === "konaste";

  return {
    歌曲封面: song.image_name
      ? `${ZETARAKU_COVER_BASE}/${song.image_name}`
      : (song.cover_url ?? ""),
    歌曲名稱: song.title,
    樂器類型: instrument,
    譜面等級: difficulty,
    難度數值: level,
    收錄版本: song.version ?? "",
    "歌名發音/分類": song.reading ?? "",
    "家用版最佳達成率 (%)": isKonaste ? score.achievement_rate : 0,
    "家用版 Skill 點數": isKonaste ? score.skill_point : 0,
    "街機版最佳達成率 (%)": isArcade ? score.achievement_rate : 0,
    "街機版 Skill 點數": isArcade ? score.skill_point : 0,
    標籤: song.tags ?? "",
    備註: "",
    新舊分類: song.category ?? "Other",
    isFavorite: false,
    _scoreId: score.id,
    _userId: score.user_id,
    _songId: score.song_id,
    _difficulty: score.difficulty,
    _source: score.source,
    _isExcellent: score.is_excellent,
    _isFullCombo: score.is_full_combo,
    _bestGrade: score.best_grade ?? "",
    _playCount: score.play_count,
    _importedAt: score.imported_at,
  };
}

/** Merge two SongData entries for the same song (arcade + konaste) */
export function mergeSongDataSources(
  konaste: SongData | null,
  arcade: SongData | null
): SongData {
  const base = konaste ?? arcade!;
  return {
    ...base,
    "家用版最佳達成率 (%)": konaste?.["家用版最佳達成率 (%)"] ?? 0,
    "家用版 Skill 點數": konaste?.["家用版 Skill 點數"] ?? 0,
    "街機版最佳達成率 (%)": arcade?.["家用版最佳達成率 (%)"] ?? 0,
    "街機版 Skill 點數": arcade?.["家用版 Skill 點數"] ?? 0,
  };
}

/** Legacy SongData UI type → Supabase ScoreInsert payload */
export function songDataToDbScore(
  data: SongData & {
    _userId: string;
    _songId: number;
    _difficulty: string;
    _source: "arcade" | "konaste";
  }
): Omit<import("@/types/database").ScoreInsert, "id"> {
  const isArcade = data._source === "arcade";
  const achievementRate = isArcade
    ? (data["街機版最佳達成率 (%)"] as number)
    : (data["家用版最佳達成率 (%)"] as number);
  const skillPoint = isArcade
    ? (data["街機版 Skill 點數"] as number)
    : (data["家用版 Skill 點數"] as number);

  return {
    user_id: data._userId,
    song_id: data._songId,
    game_type: data.樂器類型 === "Drums" ? "DM" : "GF",
    difficulty: data._difficulty as import("@/types/database").Difficulty,
    achievement_rate: achievementRate,
    skill_point: skillPoint,
    play_count: data._playCount ?? 0,
    best_grade: data._bestGrade ?? null,
    is_excellent: data._isExcellent ?? false,
    is_full_combo: data._isFullCombo ?? false,
    source: data._source,
    imported_at: data._importedAt ?? new Date().toISOString(),
  };
}
