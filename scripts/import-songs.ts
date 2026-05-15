import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// ── Env validation ────────────────────────────────────────────────────────────

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing env vars: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// ── Types ─────────────────────────────────────────────────────────────────────

type GameType = "GF" | "DM";
type Instrument = "guitar" | "bass" | "drums";
type Category = "HOT" | "Other";

interface SongRow {
  konami_song_id: string;
  title: string;
  game_type: GameType;
  artist: string | null;
  cover_url: string | null;
  level_bsc: number | null;
  level_adv: number | null;
  level_ext: number | null;
  level_mas: number | null;
  version: string | null;
  instrument: Instrument | null;
  reading: string | null;
  category: Category | null;
  tags: string | null;
}

// ── CSV parser ────────────────────────────────────────────────────────────────

function parseCsvRow(line: string): string[] {
  const fields: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let field = "";
      i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          field += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++;
          break;
        } else {
          field += line[i++];
        }
      }
      fields.push(field);
      if (line[i] === ",") i++;
    } else {
      const end = line.indexOf(",", i);
      if (end === -1) {
        fields.push(line.slice(i));
        break;
      }
      fields.push(line.slice(i, end));
      i = end + 1;
    }
  }
  if (line.endsWith(",")) fields.push("");
  return fields;
}

function toNull(s: string): string | null {
  return s.trim() === "" ? null : s.trim();
}

function toNullNumber(s: string): number | null {
  const v = toNull(s);
  if (v === null) return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

// ── Validation ────────────────────────────────────────────────────────────────

const GAME_TYPES = new Set<string>(["GF", "DM"]);
const INSTRUMENTS = new Set<string>(["guitar", "bass", "drums"]);
const CATEGORIES = new Set<string>(["HOT", "Other"]);

const REQUIRED_COLS = ["konami_song_id", "title", "game_type"];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: npx tsx scripts/import-songs.ts <path-to-csv>");
    process.exit(1);
  }

  const raw = readFileSync(csvPath, "utf-8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim() !== "");

  if (lines.length === 0) {
    console.error("CSV file is empty.");
    process.exit(1);
  }

  // Parse header
  const headers = parseCsvRow(lines[0]).map((h) => h.trim());

  // Check required columns exist
  const missing = REQUIRED_COLS.filter((c) => !headers.includes(c));
  if (missing.length > 0) {
    console.error(`Missing required columns: ${missing.join(", ")}`);
    process.exit(1);
  }

  const idx = (col: string) => headers.indexOf(col);

  // Fetch existing konami_song_ids to track inserted vs updated
  const { data: existing } = await supabase
    .from("songs")
    .select("konami_song_id");
  const existingIds = new Set((existing ?? []).map((r) => r.konami_song_id));

  const validRows: SongRow[] = [];
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1; // 1-indexed, header is row 1
    const fields = parseCsvRow(lines[i]);
    const get = (col: string) => fields[idx(col)] ?? "";

    const konami_song_id = get("konami_song_id").trim();
    const title = get("title").trim();
    const game_type_raw = get("game_type").trim();

    // Validate required fields
    if (!konami_song_id) {
      console.error(`Row ${rowNum}: missing konami_song_id — skipped`);
      skipped++;
      continue;
    }
    if (!title) {
      console.error(`Row ${rowNum}: missing title — skipped`);
      skipped++;
      continue;
    }
    if (!GAME_TYPES.has(game_type_raw)) {
      console.error(
        `Row ${rowNum}: invalid game_type "${game_type_raw}" (must be GF or DM) — skipped`
      );
      skipped++;
      continue;
    }

    // Validate optional enum fields
    const instrument_raw = toNull(get("instrument"));
    if (instrument_raw !== null && !INSTRUMENTS.has(instrument_raw)) {
      console.error(
        `Row ${rowNum}: invalid instrument "${instrument_raw}" (must be guitar, bass, or drums) — skipped`
      );
      skipped++;
      continue;
    }

    const category_raw = toNull(get("category"));
    if (category_raw !== null && !CATEGORIES.has(category_raw)) {
      console.error(
        `Row ${rowNum}: invalid category "${category_raw}" (must be HOT or Other) — skipped`
      );
      skipped++;
      continue;
    }

    validRows.push({
      konami_song_id,
      title,
      game_type: game_type_raw as GameType,
      artist: toNull(get("artist")),
      cover_url: toNull(get("cover_url")),
      level_bsc: toNullNumber(get("level_bsc")),
      level_adv: toNullNumber(get("level_adv")),
      level_ext: toNullNumber(get("level_ext")),
      level_mas: toNullNumber(get("level_mas")),
      version: toNull(get("version")),
      instrument: instrument_raw as Instrument | null,
      reading: toNull(get("reading")),
      category: category_raw as Category | null,
      tags: toNull(get("tags")),
    });
  }

  if (validRows.length === 0) {
    console.log(`Import complete: 0 inserted, 0 updated, ${skipped} skipped`);
    return;
  }

  // Upsert — ON CONFLICT (konami_song_id) DO UPDATE
  const { error } = await supabase.from("songs").upsert(validRows, {
    onConflict: "konami_song_id",
  });

  if (error) {
    console.error("Upsert failed:", error.message);
    process.exit(1);
  }

  const inserted = validRows.filter(
    (r) => !existingIds.has(r.konami_song_id)
  ).length;
  const updated = validRows.length - inserted;

  console.log(
    `Import complete: ${inserted} inserted, ${updated} updated, ${skipped} skipped`
  );
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
