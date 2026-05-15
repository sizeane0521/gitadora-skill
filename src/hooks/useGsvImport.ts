const GSV_GRAPHQL_URL = "https://gsv.fun/graphql";

export interface SkillRecord {
  name: string;
  part: string;
  diff: string;
  skill_value: number;
  achive_value: string;
  diff_value: number;
  category: "HOT" | "Other";
}

interface HalfSkillTable {
  data: SkillRecord[];
}

interface SkillTable {
  hot: HalfSkillTable;
  other: HalfSkillTable;
}

const GSV_SAVED_SKILL_QUERY = `
  query GsvSavedSkill($skillId: Int, $type: GameType, $version: Version) {
    savedSkill(skillId: $skillId, type: $type, version: $version) {
      skillId
      playerName
      skillPoint
      skill {
        hot { data { name part diff skill_value achive_value diff_value } }
        other { data { name part diff skill_value achive_value diff_value } }
      }
    }
  }
`;

// part is uppercase single letter: "G", "B", "D"
export function mapPart(part: string): { game_type: "GF" | "DM"; instrument: string } {
  const p = part.toUpperCase();
  if (p === "D" || p.includes("DRUM")) return { game_type: "DM", instrument: "D" };
  if (p === "B" || p.includes("BASS")) return { game_type: "GF", instrument: "B" };
  return { game_type: "GF", instrument: "G" };
}

// diff is uppercase: "MAS", "EXT", "ADV", "BSC"
export function mapDiff(diff: string): "BSC" | "ADV" | "EXT" | "MAS" {
  const d = diff.toUpperCase();
  if (d === "MAS" || d.includes("MASTER")) return "MAS";
  if (d === "EXT" || d.includes("EXTREME")) return "EXT";
  if (d === "ADV" || d.includes("ADVANCED")) return "ADV";
  return "BSC";
}

const GSV_USER_QUERY = `
  query GsvUser($playerId: Int, $type: GameType, $version: Version) {
    user(playerId: $playerId, type: $type, version: $version) {
      playerId
      playerName
      guitarSkill {
        hot { data { name part diff skill_value achive_value diff_value } }
        other { data { name part diff skill_value achive_value diff_value } }
      }
      drumSkill {
        hot { data { name part diff skill_value achive_value diff_value } }
        other { data { name part diff skill_value achive_value diff_value } }
      }
    }
  }
`;

function fetchWithTimeout(url: string, options: RequestInit, ms = 15000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function queryUserSkill(playerId: number, type: "g" | "d"): Promise<SkillRecord[]> {
  const res = await fetchWithTimeout(GSV_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: GSV_USER_QUERY,
      variables: { playerId, type, version: "galaxywave_delta" },
    }),
  });
  if (!res.ok) return [];
  const json = await res.json();
  if (json.errors?.length || !json.data?.user) return [];
  const user = json.data.user;
  if (type === "g") {
    return [
      ...(user.guitarSkill?.hot?.data ?? []).map((r: object) => ({ ...r, category: "HOT" as const })),
      ...(user.guitarSkill?.other?.data ?? []).map((r: object) => ({ ...r, category: "Other" as const })),
    ].filter((r) => r.name);
  } else {
    return [
      ...(user.drumSkill?.hot?.data ?? []).map((r: object) => ({ ...r, category: "HOT" as const })),
      ...(user.drumSkill?.other?.data ?? []).map((r: object) => ({ ...r, category: "Other" as const })),
    ].filter((r) => r.name);
  }
}

export async function fetchGsvPlayerScores(playerId: number): Promise<SkillRecord[]> {
  const [gfRecords, dmRecords] = await Promise.all([
    queryUserSkill(playerId, "g"),
    queryUserSkill(playerId, "d"),
  ]);

  const seen = new Set<string>();
  const all: SkillRecord[] = [];
  for (const r of [...gfRecords, ...dmRecords]) {
    const key = `${r.name}|${r.diff}|${r.part}`;
    if (!seen.has(key)) { seen.add(key); all.push(r); }
  }

  if (all.length === 0) {
    throw new Error("找不到此玩家 ID 的資料，請確認 gsv.fun 個人頁面 URL 中的數字是否正確");
  }

  return all;
}

async function querySavedSkill(skillId: number, type: "g" | "d"): Promise<SkillRecord[]> {
  const res = await fetchWithTimeout(GSV_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: GSV_SAVED_SKILL_QUERY,
      variables: { skillId, type, version: "galaxywave_delta" },
    }),
  });
  if (!res.ok) return [];
  const json = await res.json();
  if (json.errors?.length || !json.data?.savedSkill) return [];
  const skill: SkillTable | null = json.data.savedSkill.skill ?? null;
  return [
    ...(skill?.hot?.data ?? []).map((r: object) => ({ ...r, category: "HOT" as const })),
    ...(skill?.other?.data ?? []).map((r: object) => ({ ...r, category: "Other" as const })),
  ].filter((r) => r.name);
}

export async function fetchGsvSkillScores(skillId: number): Promise<SkillRecord[]> {
  const [gfRecords, dmRecords] = await Promise.all([
    querySavedSkill(skillId, "g"),
    querySavedSkill(skillId, "d"),
  ]);

  const seen = new Set<string>();
  const all: SkillRecord[] = [];
  for (const r of [...gfRecords, ...dmRecords]) {
    const key = `${r.name}|${r.diff}|${r.part}`;
    if (!seen.has(key)) { seen.add(key); all.push(r); }
  }

  if (all.length === 0) {
    throw new Error("找不到此成績 ID 的資料，請確認網址中的數字是否正確，且 gsv.fun 已完成更新");
  }

  return all;
}
