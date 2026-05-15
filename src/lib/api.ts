import { GameMode, SongData, WishlistItem, MOCK_DATA_GF, MOCK_DATA_DM } from "@/types/song";

const API_URL = "https://script.google.com/macros/s/AKfycbwzK_d6AO1dtrtLmFHxL1OBP0xSf6ySvOHEag6Qagoh2r5LJmb0PUxhWERf15da5AUE/exec";

export interface FetchSongsResult {
  songs: SongData[];
  tags: string[];
  wishlist: WishlistItem[];
}

export async function fetchSongs(mode: GameMode): Promise<FetchSongsResult> {
  try {
    const res = await fetch(`${API_URL}?mode=${mode}`);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();

    if (data && Array.isArray(data.records)) {
      const validSongs = data.records.filter(
        (r: SongData) => r.歌曲名稱 && String(r.歌曲名稱).trim() !== ""
      );
      return {
        songs: validSongs,
        tags: Array.isArray(data.tags) ? data.tags : [],
        wishlist: Array.isArray(data.wishlist) ? data.wishlist : [],
      };
    }

    if (Array.isArray(data) && data.length > 0) {
      return { songs: data, tags: [], wishlist: [] };
    }

    throw new Error("Empty");
  } catch {
    return {
      songs: mode === "GF" ? MOCK_DATA_GF : MOCK_DATA_DM,
      tags: [],
      wishlist: [],
    };
  }
}

type UpdateScorePayload = {
  mode: GameMode;
  songName: string;
  instrument: string;
  difficulty: string;
  arcadeScore?: number | string;
  arcadeSkill?: number | string;
  homeScore?: number | string;
  homeSkill?: number | string;
  remark?: string;
  category?: string;
  tag?: string;
  yomiCategory?: string;
};

function normalizeUpdatePayload(payload: UpdateScorePayload) {
  return {
    mode: payload.mode,
    songName: payload.songName ?? "",
    instrument: payload.instrument ?? "",
    difficulty: payload.difficulty ?? "",
    arcadeScore: payload.arcadeScore ?? "",
    arcadeSkill: payload.arcadeSkill ?? "",
    homeScore: payload.homeScore ?? "",
    homeSkill: payload.homeSkill ?? "",
    remark: payload.remark ?? "",
    category: payload.category ?? "",
    tag: payload.tag ?? "",
    yomiCategory: payload.yomiCategory ?? "",
  };
}

export async function updateScore(payload: UpdateScorePayload): Promise<{ ok: boolean; message?: string }> {
  const normalizedPayload = normalizeUpdatePayload(payload);
  console.log("送出的 payload:", normalizedPayload);
  const rawBody = JSON.stringify(normalizedPayload);
  console.log("【api.ts updateScore】送出 rawBody:", rawBody);

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: rawBody,
      mode: "no-cors",
      redirect: "follow",
    });
    return { ok: true };
  } catch (err) {
    console.error("【api.ts updateScore】fetch 失敗:", err);
    return { ok: false, message: "送出失敗，請稍後再試" };
  }
}

export async function toggleFavorite(
  mode: GameMode,
  songName: string,
  instrument: string,
  difficulty: string,
  isFavorite: boolean,
): Promise<{ ok: boolean }> {
  const payload = { action: "toggleFavorite", mode, songName, instrument, difficulty, isFavorite };
  console.log("toggleFavorite payload:", payload);
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      mode: "no-cors",
      redirect: "follow",
    });
    return { ok: true };
  } catch (err) {
    console.error("toggleFavorite failed:", err);
    return { ok: false };
  }
}

export async function verifySave(
  mode: GameMode,
  songName: string,
  instrument: string,
  difficulty: string,
  maxRetries = 3,
  intervalMs = 1500,
): Promise<boolean> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const waitMs = attempt === 0 ? 3000 : intervalMs;
    await new Promise((r) => setTimeout(r, waitMs));

    try {
      const { songs } = await fetchSongs(mode);
      const diffParts = difficulty.match(/^(\S+)\s+(.+)$/);
      const targetLevel = diffParts ? diffParts[1] : difficulty;
      const targetValue = diffParts ? parseFloat(diffParts[2]) : NaN;
      const match = songs.find(
        (s) =>
          s.歌曲名稱 === songName &&
          s.樂器類型.toLowerCase() === instrument.toLowerCase() &&
          s.譜面等級 === targetLevel &&
          Number(s.難度數值) === targetValue,
      );
      if (match) return true;
    } catch {
      // retry
    }
  }
  return false;
}
