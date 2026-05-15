## Tasks

- [x] **Task 1**: Implements "Difficulty Level Snapshot in Scores" per "Decision 2: `scores.level_value` as the difficulty snapshot column" — Add `level_value` column to `scores` table via Supabase migration
  Create a new SQL migration file in `supabase/migrations/` that executes `ALTER TABLE scores ADD COLUMN IF NOT EXISTS level_value numeric;`. The migration must be idempotent (IF NOT EXISTS). Verify by checking the Supabase schema or running the migration locally — the `scores` table must have a `level_value` column of type numeric, nullable, defaulting to null.

- [x] **Task 2**: Implements "Difficulty Level Snapshot in Scores" per "Decision 2: `scores.level_value` as the difficulty snapshot column" — Update `ScoreRow` TypeScript type to include `level_value`
  In `src/types/database.ts`, add `level_value: number | null;` to the `ScoreRow` interface. Verify: TypeScript compilation (`bun run build` or `tsc --noEmit`) produces no type errors for this field.

- [x] **Task 3**: Implements "GSV.fun Player Score Import" per "Decision 1: Remove localStorage persistence for skillId" and "Bug 1: Query fix" — Fix the GSV import to use `fetchGsvSkillScores` instead of `fetchGsvPlayerScores`
  In `src/pages/Import.tsx`:
  - Change the import from `fetchGsvPlayerScores` to `fetchGsvSkillScores`
  - Rename the state variable `gsvPlayerId` to `gsvSkillId` (both the `useState` declaration and all references in JSX)
  - Replace the `localStorage.getItem("siz_gsv_player_id")` initializer with an empty string `""`
  - Remove the `localStorage.setItem("siz_gsv_player_id", v)` call from the setter
  - Replace `fetchGsvPlayerScores(parseInt(gsvPlayerId, 10))` with `fetchGsvSkillScores(parseInt(gsvSkillId, 10))`
  Verify: entering a real `savedSkillId` (e.g., `44355`) into the import UI and clicking import returns score records. The localStorage key `siz_gsv_player_id` must no longer be written.

- [x] **Task 4**: Implements "Instrument-Isolated Song Fallback Keys" per "Decision 3: Instrument-qualified `gsv_` fallback key" and "Bug 3: Instrument-qualified fallback key" — Add `getGsvFallbackId` helper and fix cross-instrument `gsv_` lookup in Import.tsx
  In `src/pages/Import.tsx`, add a local helper function adjacent to `getZetarakuId`:
  ```
  function getGsvFallbackId(name: string, part: string): string {
    const p = part.toUpperCase();
    if (p === "D" || p.includes("DRUM")) return `gsv_${name}_drum`;
    if (p === "B" || p.includes("BASS")) return `gsv_${name}_bass`;
    return `gsv_${name}_guitar`;
  }
  ```
  Then replace every use of the old instrument-less `gsv_${r.name}` pattern with `getGsvFallbackId(r.name, r.part)`:
  - In `gsvCandidates` (Step 2): `records.map(r => getGsvFallbackId(r.name, r.part))`
  - In the fallback lookup (Step 2): `idLookup.get(getGsvFallbackId(r.name, r.part))`
  Verify: after this change, a GF import for song "GHOST" looks up `gsv_GHOST_guitar` not `gsv_GHOST`. A DM import for "GHOST" looks up `gsv_GHOST_drum`.

- [x] **Task 5**: Implements "Difficulty Level Snapshot in Scores" (replacing removed "Arcade Score DOM Scraping") per "Decision 2: `scores.level_value` as the difficulty snapshot column" and "Bug 2: Difficulty snapshot column" — Remove Step 3b-2 (songs.level_* writes) and write level_value to scores upsert
  In `src/pages/Import.tsx`:
  - Delete the entire Step 3b-2 block: the `DIFF_COL` constant, `levelMap` Map, the `for` loop populating it, and the `Promise.all` that updates `songs`
  - In the score upsert payload (the object passed to `.upsert()`), add the field: `level_value: r.diff_value > 0 ? r.diff_value : null`
  Verify: after import, `songs` rows are not modified (their `level_bsc/adv/ext/mas` remain unchanged). The `scores` rows for imported songs have `level_value` set to the correct numeric value from the snapshot.

- [x] **Task 6**: Implements "Difficulty Level Snapshot in Scores" per "Decision 2: `scores.level_value` as the difficulty snapshot column" — Update `dbScoreToSongData` in adapter to use `scores.level_value` with fallback
  In `src/lib/adapter.ts`, modify the `level` computation in `dbScoreToSongData`:
  - Current: `const level = (song[levelKey] as number | null) ?? 0;`
  - New: `const level = (score.level_value ?? (song[levelKey] as number | null)) ?? 0;`
  Verify: a score with `level_value = 9.2` and linked song `level_mas = 0` produces `難度數值 = 9.2` in the returned `SongData`. A score with `level_value = null` and linked song `level_mas = 7.5` produces `難度數值 = 7.5`.

- [x] **Task 7**: Implements "Instrument-Isolated Song Fallback Keys" per "Decision 4: One-time SQL migration to clean up existing `gsv_${name}` rows" and "Migration: cleanup existing `gsv_${name}` rows" — Write one-time SQL migration to re-link scores and delete orphaned instrument-less songs
  Create a second SQL migration file in `supabase/migrations/` that:
  1. For each score linked to a song whose `konami_song_id` matches `gsv_%` but NOT `%_guitar`, `%_bass`, or `%_drum`:
     - Derives the expected Zetaraku key: if `score.game_type = 'DM'` → `${song_title}_drum`; if instrument is Bass → `${song_title}_bass`; otherwise → `${song_title}_guitar`
     - Looks up that key in `songs`
     - If found, updates `scores.song_id` to that song's id
  2. Deletes all `gsv_*` songs (no instrument suffix) that have zero remaining linked scores
  The migration must be wrapped in a transaction. Verify by checking `SELECT COUNT(*) FROM songs WHERE konami_song_id LIKE 'gsv_%' AND konami_song_id NOT LIKE '%\_guitar' AND konami_song_id NOT LIKE '%\_bass' AND konami_song_id NOT LIKE '%\_drum'` returns 0 for songs with no linked scores.
