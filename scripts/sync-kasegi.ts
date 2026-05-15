import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing env vars: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SCOPE_TIERS = [6750, 7000, 7250, 7500, 7750, 8000, 8250, 8500, 8750, 9000, 9250, 9500] as const;
const GAME_TYPES = ["g", "d"] as const;
type GameTypeLetter = typeof GAME_TYPES[number];

const GAME_TYPE_LABEL: Record<GameTypeLetter, "GF" | "DM"> = { g: "GF", d: "DM" };

const PART_MAP: Record<string, string> = { G: "G", B: "B", D: "D" };
const PART_TO_INSTRUMENT: Record<string, string> = { G: "guitar", B: "bass", D: "drums" };
const DIFF_TO_COL: Record<string, "level_bsc" | "level_adv" | "level_ext" | "level_mas"> = {
  BSC: "level_bsc", ADV: "level_adv", EXT: "level_ext", MAS: "level_mas",
};

const GSV_QUERY = `
  query KasegiNew($version: Version, $type: GameType, $scope: Int) {
    kasegiNew(version: $version, type: $type, scope: $scope) {
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

interface GsvRecord {
  name: string;
  diff: string;
  part: string;
  diffValue: number;
  averageSkill: number;
  count: number;
  averagePlayerSKill: number;
}

interface KasegiRow {
  scope: number;
  game_type: "GF" | "DM";
  category: "HOT" | "OTHER";
  song_title: string;
  diff: string;
  part: string;
  diff_value: number | null;
  average_skill: number | null;
  player_percent: number | null;
  player_count: number | null;
  average_player_skill: number | null;
  synced_at: string;
}

function mapRecord(
  r: GsvRecord,
  scope: number,
  gameType: "GF" | "DM",
  category: "HOT" | "OTHER",
  totalCount: number,
  syncedAt: string
): KasegiRow {
  return {
    scope,
    game_type: gameType,
    category,
    song_title: r.name,
    diff: r.diff.toUpperCase(),
    part: PART_MAP[r.part.toUpperCase()] ?? r.part.toUpperCase(),
    diff_value: r.diffValue ?? null,
    average_skill: r.averageSkill ?? null,
    player_percent: totalCount > 0 ? Math.round((r.count / totalCount) * 10000) / 100 : null,
    player_count: r.count ?? null,
    average_player_skill: r.averagePlayerSKill ?? null,
    synced_at: syncedAt,
  };
}

async function fetchKasegi(
  scope: number,
  gameTypeLetter: GameTypeLetter
): Promise<{ rows: KasegiRow[]; syncedAt: string } | null> {
  const syncedAt = new Date().toISOString();
  const gameType = GAME_TYPE_LABEL[gameTypeLetter];

  try {
    const res = await fetch("https://gsv.fun/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: GSV_QUERY,
        variables: { type: gameTypeLetter, version: "galaxywave_delta", scope },
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (json.errors?.length) throw new Error(json.errors[0].message);

    const node = json.data?.kasegiNew;
    if (!node) throw new Error("No kasegiNew in response");

    const totalCount: number = node.count ?? 0;
    const rows: KasegiRow[] = [
      ...(node.hot ?? []).map((r: GsvRecord) => mapRecord(r, scope, gameType, "HOT", totalCount, syncedAt)),
      ...(node.other ?? []).map((r: GsvRecord) => mapRecord(r, scope, gameType, "OTHER", totalCount, syncedAt)),
    ];

    return { rows, syncedAt };
  } catch (err) {
    console.error(`  ❌ scope=${scope} ${gameType}: ${(err as Error).message}`);
    return null;
  }
}

type LevelCols = Partial<Record<"level_bsc" | "level_adv" | "level_ext" | "level_mas", number>>;

// part G/D is the primary instrument for GF/DM when instrument is null
const PART_TO_GAME_TYPE: Record<string, "GF" | "DM"> = { G: "GF", B: "GF", D: "DM" };
const PRIMARY_PART: Record<"GF" | "DM", string> = { GF: "G", DM: "D" };

async function updateSongsLevel(allRows: KasegiRow[]): Promise<void> {
  // Zetaraku-format map: "title_guitar" / "title_bass" / "title_drum" → level cols
  const zetarakuMap = new Map<string, LevelCols>();
  // gsv-format fallback map: "title|GF" / "title|DM" → level cols (G/D part only)
  const gsvMap = new Map<string, LevelCols>();

  for (const row of allRows) {
    if (!row.diff_value || row.diff_value <= 0) continue;
    const instrument = PART_TO_INSTRUMENT[row.part];
    if (!instrument) continue;
    const col = DIFF_TO_COL[row.diff];
    if (!col) continue;

    // Zetaraku konami_song_id format: title_guitar / title_bass / title_drum
    const suffix = instrument === "drums" ? "drum" : instrument;
    const konamiKey = `${row.song_title}_${suffix}`;
    const zEntry = zetarakuMap.get(konamiKey) ?? {};
    if (!zEntry[col]) zEntry[col] = row.diff_value;
    zetarakuMap.set(konamiKey, zEntry);

    // gsv_ format fallback: use primary part only (G for GF, D for DM)
    const gameType = PART_TO_GAME_TYPE[row.part];
    if (gameType && PRIMARY_PART[gameType] === row.part) {
      const gsvKey = `${row.song_title}|${gameType}`;
      const gEntry = gsvMap.get(gsvKey) ?? {};
      if (!gEntry[col]) gEntry[col] = row.diff_value;
      gsvMap.set(gsvKey, gEntry);
    }
  }

  if (zetarakuMap.size === 0 && gsvMap.size === 0) return;

  // Fetch Zetaraku-format songs by konami_song_id
  const konamiIds = [...zetarakuMap.keys()];
  const BATCH = 100;
  const songRows: Array<{ id: number; konami_song_id: string; title: string; game_type: string; instrument: string | null }> = [];
  for (let i = 0; i < konamiIds.length; i += BATCH) {
    const { data, error } = await supabase
      .from("songs")
      .select("id, konami_song_id, title, game_type, instrument")
      .in("konami_song_id", konamiIds.slice(i, i + BATCH));
    if (error) throw new Error(error.message);
    songRows.push(...(data ?? []));
  }

  // Fetch gsv_-format songs (instrument=null) by title+game_type
  const gsvTitles = [...new Set([...gsvMap.keys()].map((k) => k.split("|")[0]))];
  const gsvRows: typeof songRows = [];
  for (let i = 0; i < gsvTitles.length; i += BATCH) {
    const { data, error } = await supabase
      .from("songs")
      .select("id, konami_song_id, title, game_type, instrument")
      .in("title", gsvTitles.slice(i, i + BATCH))
      .is("instrument", null);
    if (error) throw new Error(error.message);
    gsvRows.push(...(data ?? []));
  }

  const updates: Array<Promise<void>> = [];

  // Update Zetaraku-format songs
  for (const row of songRows) {
    const cols = zetarakuMap.get(row.konami_song_id);
    if (!cols || Object.keys(cols).length === 0) continue;
    updates.push(
      supabase.from("songs").update(cols).eq("id", row.id).then(({ error: e }) => {
        if (e) throw new Error(e.message);
      })
    );
  }

  // Update gsv_-format songs (instrument=null)
  for (const row of gsvRows) {
    const gsvKey = `${row.title}|${row.game_type}`;
    const cols = gsvMap.get(gsvKey);
    if (!cols || Object.keys(cols).length === 0) continue;
    updates.push(
      supabase.from("songs").update(cols).eq("id", row.id).then(({ error: e }) => {
        if (e) throw new Error(e.message);
      })
    );
  }

  await Promise.all(updates);
  console.log(`   📝 songs.level_* 已更新：${updates.length} 筆`);
}

async function upsertRows(rows: KasegiRow[]): Promise<void> {
  const { error } = await supabase
    .from("kasegi_records")
    .upsert(rows, {
      onConflict: "scope,game_type,category,song_title,diff,part",
    });
  if (error) throw new Error(error.message);
}

async function main() {
  console.log("⏳ 開始同步賺分曲資料...");

  const combinations: Array<[number, GameTypeLetter]> = SCOPE_TIERS.flatMap((scope) =>
    GAME_TYPES.map((gt): [number, GameTypeLetter] => [scope, gt])
  );

  const BATCH_SIZE = 6;
  let totalRows = 0;
  let successCount = 0;
  let failCount = 0;
  const allRows: KasegiRow[] = [];

  for (let i = 0; i < combinations.length; i += BATCH_SIZE) {
    const batch = combinations.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(([scope, gt]) => fetchKasegi(scope, gt)));

    for (const result of results) {
      if (!result) {
        failCount++;
        continue;
      }
      await upsertRows(result.rows);
      allRows.push(...result.rows);
      totalRows += result.rows.length;
      successCount++;
    }

    process.stdout.write(
      `\r   進度：${Math.min(i + BATCH_SIZE, combinations.length)} / ${combinations.length} 組合`
    );
  }

  console.log("\n   ⏳ 更新歌曲難度數值...");
  await updateSongsLevel(allRows);

  const syncTime = new Date().toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  console.log(`\n\n🎉 同步完成`);
  console.log(`   時間：${syncTime}`);
  console.log(`   總記錄數：${totalRows} 筆`);
  console.log(`   成功：${successCount} 組合 / 失敗：${failCount} 組合`);
}

main().catch((err) => {
  console.error("\n❌ 錯誤：", err.message);
  process.exit(1);
});
