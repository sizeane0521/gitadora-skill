import { describe, it, expect } from "vitest";
import { dbScoreToSongData, songDataToDbScore } from "@/lib/adapter";
import type { ScoreRow, SongRow } from "@/types/database";

const mockSong: SongRow = {
  id: 1,
  konami_song_id: "agnus_dei",
  title: "Agnus Dei",
  artist: "Test Artist",
  cover_url: "https://example.com/cover.jpg",
  game_type: "GF",
  level_bsc: 5.0,
  level_adv: 6.5,
  level_ext: 7.5,
  level_mas: 9.0,
  version: "FUZZ-UP",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const mockKonasteScore: ScoreRow = {
  id: 100,
  user_id: "user-uuid-123",
  song_id: 1,
  game_type: "GF",
  difficulty: "EXT",
  achievement_rate: 98.5,
  skill_point: 147.75,
  play_count: 10,
  best_grade: "S",
  is_excellent: false,
  is_full_combo: true,
  source: "konaste",
  imported_at: "2026-04-23T00:00:00Z",
  updated_at: "2026-04-23T00:00:00Z",
};

describe("dbScoreToSongData", () => {
  it("maps konaste score to SongData with correct home fields", () => {
    const result = dbScoreToSongData(mockKonasteScore, mockSong);

    expect(result.歌曲名稱).toBe("Agnus Dei");
    expect(result.樂器類型).toBe("Guitar");
    expect(result.譜面等級).toBe("EXT");
    expect(result.難度數值).toBe(7.5);
    expect(result["家用版最佳達成率 (%)"]).toBe(98.5);
    expect(result["家用版 Skill 點數"]).toBe(147.75);
    expect(result["街機版最佳達成率 (%)"]).toBe(0);
    expect(result["街機版 Skill 點數"]).toBe(0);
    expect(result._isFullCombo).toBe(true);
    expect(result._isExcellent).toBe(false);
  });

  it("maps arcade score to SongData with correct arcade fields", () => {
    const arcadeScore: ScoreRow = { ...mockKonasteScore, source: "arcade", achievement_rate: 95.0, skill_point: 142.5 };
    const result = dbScoreToSongData(arcadeScore, mockSong);

    expect(result["家用版最佳達成率 (%)"]).toBe(0);
    expect(result["街機版最佳達成率 (%)"]).toBe(95.0);
    expect(result["街機版 Skill 點數"]).toBe(142.5);
  });

  it("maps DM score instrument type correctly", () => {
    const dmScore: ScoreRow = { ...mockKonasteScore, game_type: "DM" };
    const dmSong: SongRow = { ...mockSong, game_type: "DM" };
    const result = dbScoreToSongData(dmScore, dmSong);

    expect(result.樂器類型).toBe("Drums");
  });
});

describe("songDataToDbScore", () => {
  it("round-trips konaste score back to DB insert shape", () => {
    const songData = dbScoreToSongData(mockKonasteScore, mockSong);
    const dbInsert = songDataToDbScore({
      ...songData,
      _userId: "user-uuid-123",
      _songId: 1,
      _difficulty: "EXT",
      _source: "konaste",
    });

    expect(dbInsert.user_id).toBe("user-uuid-123");
    expect(dbInsert.song_id).toBe(1);
    expect(dbInsert.difficulty).toBe("EXT");
    expect(dbInsert.source).toBe("konaste");
    expect(dbInsert.achievement_rate).toBe(98.5);
    expect(dbInsert.skill_point).toBe(147.75);
    expect(dbInsert.is_full_combo).toBe(true);
  });
});
