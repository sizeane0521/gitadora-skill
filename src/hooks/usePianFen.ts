import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface PianFenRecord {
  name: string;
  diff: string;
  part: string;
  diffValue: number;
  averageSkill: number;
  count: number;
  percent: number;
}

export interface PianFenData {
  hot: PianFenRecord[];
  other: PianFenRecord[];
  totalCount: number;
}

export type SortBy = "skill" | "percent";

type GameType = "GF" | "DM";

const KASEGI_NEW_QUERY = `
  query KasegiNew($version: Version, $type: GameType, $scope: Int) {
    kasegiNew(version: $version, type: $type, scope: $scope) {
      version
      type
      scope
      count
      hot {
        name
        diff
        part
        diffValue
        averageSkill
        count
        averagePlayerSKill
      }
      other {
        name
        diff
        part
        diffValue
        averageSkill
        count
        averagePlayerSKill
      }
    }
  }
`;

const GAME_TYPE_MAP: Record<GameType, string> = { GF: "g", DM: "d" };
const ALLOWED_PARTS: Record<GameType, string[]> = { GF: ["G", "B"], DM: ["D"] };

export const SCOPE_TIERS = [6750, 7000, 7250, 7500, 7750, 8000, 8250, 8500, 8750, 9000, 9250, 9500] as const;
export type ScopeTier = typeof SCOPE_TIERS[number];

type RawRecord = Omit<PianFenRecord, "percent">;

async function fetchPianFen(gameType: GameType, scope: number, sortBy: SortBy): Promise<PianFenData> {
  const res = await fetch("https://gsv.fun/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: KASEGI_NEW_QUERY,
      variables: { type: GAME_TYPE_MAP[gameType], version: "galaxywave_delta", scope },
    }),
  });

  if (!res.ok) throw new Error(`gsv.fun responded with ${res.status}`);

  const json = await res.json();
  const clientError = json.errors?.find(
    (e: { extensions?: { code?: string } }) => e.extensions?.code !== "INTERNAL_SERVER_ERROR"
  );
  if (clientError) throw new Error(clientError.message);

  const rawNode = json.data?.kasegiNew as {
    count: number;
    hot: RawRecord[] | null;
    other: RawRecord[] | null;
  } | null;

  const totalCount = rawNode?.count ?? 0;

  const addPercent = (r: RawRecord): PianFenRecord => ({
    ...r,
    percent: totalCount > 0 ? Math.round((r.count / totalCount) * 10000) / 100 : 0,
  });

  const compareFn: (a: PianFenRecord, b: PianFenRecord) => number =
    sortBy === "percent"
      ? (a, b) => b.percent - a.percent
      : (a, b) => b.averageSkill - a.averageSkill;

  return {
    totalCount,
    hot: (rawNode?.hot ?? []).filter((r) => ALLOWED_PARTS[gameType].includes(r.part)).map(addPercent).sort(compareFn),
    other: (rawNode?.other ?? []).filter((r) => ALLOWED_PARTS[gameType].includes(r.part)).map(addPercent).sort(compareFn),
  };
}

export function usePianFen(gameType: GameType, scope: ScopeTier, sortBy: SortBy = "skill") {
  return useQuery({
    queryKey: ["pian-fen", gameType, scope, sortBy],
    queryFn: () => fetchPianFen(gameType, scope, sortBy),
    staleTime: 5 * 60 * 1000,
  });
}

async function fetchKasegiFromDB(gameType: GameType, scope: number, sortBy: SortBy): Promise<PianFenData> {
  const { data, error } = await supabase
    .from("kasegi_records")
    .select("category, song_title, diff, part, diff_value, average_skill, player_percent, player_count")
    .eq("game_type", gameType)
    .eq("scope", scope)
    .in("part", ALLOWED_PARTS[gameType]);

  if (error) throw new Error(error.message);

  const toRecord = (r: NonNullable<typeof data>[number]): PianFenRecord => ({
    name: r.song_title,
    diff: r.diff,
    part: r.part,
    diffValue: r.diff_value ?? 0,
    averageSkill: r.average_skill ?? 0,
    count: r.player_count ?? 0,
    percent: r.player_percent ?? 0,
  });

  const compareFn: (a: PianFenRecord, b: PianFenRecord) => number =
    sortBy === "percent"
      ? (a, b) => b.percent - a.percent
      : (a, b) => b.averageSkill - a.averageSkill;

  const rows = data ?? [];
  const hot = rows.filter((r) => r.category === "HOT").map(toRecord).sort(compareFn);
  const other = rows.filter((r) => r.category === "OTHER").map(toRecord).sort(compareFn);

  return { hot, other, totalCount: rows.length };
}

export function useKasegiFromDB(gameType: GameType, scope: ScopeTier, sortBy: SortBy = "skill") {
  return useQuery({
    queryKey: ["kasegi-db", gameType, scope, sortBy],
    queryFn: () => fetchKasegiFromDB(gameType, scope, sortBy),
    staleTime: 10 * 60 * 1000,
  });
}
