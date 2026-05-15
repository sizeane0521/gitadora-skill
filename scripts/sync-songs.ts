import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const CACHE_PATH = resolve(import.meta.dirname, "../.sync-cache.json");

function readCachedUpdateTime(): string | null {
  if (!existsSync(CACHE_PATH)) return null;
  try {
    return (JSON.parse(readFileSync(CACHE_PATH, "utf-8")) as { updateTime: string }).updateTime;
  } catch {
    return null;
  }
}

function writeCachedUpdateTime(updateTime: string): void {
  writeFileSync(CACHE_PATH, JSON.stringify({ updateTime }), "utf-8");
}

const ZETARAKU_URL =
  "https://dp4p6x0xfi5o9.cloudfront.net/gitadora/data.json";

// ── Env ───────────────────────────────────────────────────────────────────────

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

// ── Types ─────────────────────────────────────────────────────────────────────

interface ZetarakuSheet {
  type: "guitar" | "bass" | "drum";
  difficulty: "basic" | "advanced" | "extreme" | "master";
  levelValue: number | null;
}

interface ZetarakuSong {
  songId: string;
  title: string;
  imageName: string | null;
  sheets: ZetarakuSheet[];
}

interface ZetarakuData {
  songs: ZetarakuSong[];
  updateTime: string;
}

interface SongUpsert {
  konami_song_id: string;
  title: string;
  game_type: "GF" | "DM";
  instrument: "guitar" | "bass" | "drums";
  level_bsc: number | null;
  level_adv: number | null;
  level_ext: number | null;
  level_mas: number | null;
  image_name: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildRows(song: ZetarakuSong): SongUpsert[] {
  const byInstrument = new Map<string, ZetarakuSheet[]>();
  for (const sheet of song.sheets) {
    const key = sheet.type;
    if (!byInstrument.has(key)) byInstrument.set(key, []);
    byInstrument.get(key)!.push(sheet);
  }

  const rows: SongUpsert[] = [];

  for (const [instrType, sheets] of byInstrument) {
    const level = (diff: ZetarakuSheet["difficulty"]) =>
      sheets.find((s) => s.difficulty === diff)?.levelValue ?? null;

    const instrument =
      instrType === "drum" ? "drums" : (instrType as "guitar" | "bass");
    const game_type: "GF" | "DM" = instrType === "drum" ? "DM" : "GF";

    rows.push({
      konami_song_id: `${song.title}_${instrType}`,
      title: song.title,
      game_type,
      instrument,
      level_bsc: level("basic"),
      level_adv: level("advanced"),
      level_ext: level("extreme"),
      level_mas: level("master"),
      image_name: song.imageName ?? null,
    });
  }

  return rows;
}

function rowChanged(incoming: SongUpsert, db: DbRow): boolean {
  return (
    incoming.level_bsc !== db.level_bsc ||
    incoming.level_adv !== db.level_adv ||
    incoming.level_ext !== db.level_ext ||
    incoming.level_mas !== db.level_mas ||
    incoming.image_name !== db.image_name
  );
}

async function upsertBatch(rows: SongUpsert[]): Promise<void> {
  const { error } = await supabase
    .from("songs")
    .upsert(rows, { onConflict: "konami_song_id" });

  if (error) throw new Error(error.message);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface DbRow {
  konami_song_id: string;
  title: string;
  level_bsc: number | null;
  level_adv: number | null;
  level_ext: number | null;
  level_mas: number | null;
  image_name: string | null;
}

async function main() {
  console.log("⏳ 正在從 zetaraku 抓取歌曲資料...");
  const res = await fetch(ZETARAKU_URL);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

  const json = (await res.json()) as ZetarakuData;

  console.log(`📅 zetaraku 資料更新時間：${formatDate(json.updateTime)}`);

  // updateTime 沒變就直接跳過，連 DB 都不需要查
  const cachedTime = readCachedUpdateTime();
  if (cachedTime === json.updateTime) {
    console.log("✅ 資料未更新（updateTime 與上次同步相同），略過寫入。");
    return;
  }

  console.log(`🎵 zetaraku 共有 ${json.songs.length} 首歌`);

  // 建立所有 zetaraku 的 rows
  const allRows: SongUpsert[] = json.songs.flatMap(buildRows);
  const zetarakuIds = new Set(allRows.map((r) => r.konami_song_id));

  // 從 DB 撈完整難度欄位（排除 arcade_ 手動資料）
  const { data: existing, error: fetchError } = await supabase
    .from("songs")
    .select("konami_song_id, title, level_bsc, level_adv, level_ext, level_mas, image_name")
    .not("konami_song_id", "like", "arcade_%");

  if (fetchError) throw new Error(fetchError.message);

  const dbMap = new Map<string, DbRow>(
    (existing ?? []).map((r) => [r.konami_song_id, r as DbRow])
  );
  const zetarakuDbIds = new Set(dbMap.keys());

  // 新增的歌
  const newIds = [...zetarakuIds].filter((id) => !zetarakuDbIds.has(id));
  // zetaraku 上已消失但 DB 裡還有的歌
  const removedIds = [...zetarakuDbIds].filter((id) => !zetarakuIds.has(id));

  // 難度有變動的歌（已存在但數值不同）
  const changedRows = allRows.filter((row) => {
    const db = dbMap.get(row.konami_song_id);
    return db && rowChanged(row, db);
  });

  // 顯示差異報告
  if (newIds.length > 0) {
    console.log(`\n✨ 新增歌曲（${newIds.length} 行）：`);
    const newTitles = [
      ...new Set(newIds.map((id) => id.replace(/_guitar$|_bass$|_drum$/, ""))),
    ];
    newTitles.forEach((t) => console.log(`   + ${t}`));
  }

  if (changedRows.length > 0) {
    console.log(`\n📝 難度有變動（${changedRows.length} 行）：`);
    const changedTitles = [
      ...new Set(changedRows.map((r) => r.title)),
    ];
    changedTitles.forEach((t) => console.log(`   ~ ${t}`));
  }

  if (removedIds.length > 0) {
    console.log(`\n🗑️  zetaraku 上已移除（${removedIds.length} 行）：`);
    const removedTitles = [
      ...new Set(
        removedIds.map((id) => id.replace(/_guitar$|_bass$|_drum$/, ""))
      ),
    ];
    removedTitles.forEach((t) => console.log(`   - ${t}`));
    console.log("   ⚠️  這些歌仍保留在你的資料庫，不會自動刪除。");
  }

  // 只 upsert 新增 + 難度有變動的 rows
  const rowsToUpsert = allRows.filter(
    (row) =>
      !dbMap.has(row.konami_song_id) ||
      rowChanged(row, dbMap.get(row.konami_song_id)!)
  );

  if (rowsToUpsert.length === 0) {
    console.log("\n✅ 難度與歌單皆無變動，略過寫入。");
    writeCachedUpdateTime(json.updateTime);
    return;
  }

  console.log(`\n⬆️  上傳中...`);
  const BATCH = 200;
  let processed = 0;
  for (let i = 0; i < rowsToUpsert.length; i += BATCH) {
    const batch = rowsToUpsert.slice(i, i + BATCH);
    await upsertBatch(batch);
    processed += batch.length;
    process.stdout.write(`\r   ${processed} / ${rowsToUpsert.length} 行`);
  }

  console.log(`\n\n🎉 同步完成：${newIds.length} 新增、${changedRows.length} 難度更新`);

  writeCachedUpdateTime(json.updateTime);
}

main().catch((err) => {
  console.error("\n❌ 錯誤：", err.message);
  process.exit(1);
});
