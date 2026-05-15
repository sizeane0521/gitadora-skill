## Context

The gsv.fun import flow (`src/pages/Import.tsx` + `src/hooks/useGsvImport.ts`) has three independent data integrity bugs that were introduced by a previous change (`gsv-use-player-id-for-import`):

1. It calls `fetchGsvPlayerScores` (the `user(playerId)` GraphQL query) instead of `fetchGsvSkillScores` (the `savedSkill(skillId)` query). The URL number is a `savedSkillId` that changes every time the bookmarklet runs, not a fixed player ID.
2. It writes `diff_value` to `songs.level_bsc/adv/ext/mas` — columns owned by the Zetaraku admin sync. This overwrites canonical difficulty values with player snapshot data.
3. The fallback song-lookup key `gsv_${name}` has no instrument suffix. A Drums import that previously created `gsv_SONGNAME` is indistinguishable from the Guitar version, causing cross-instrument score linkage.

The `难度数值` field in the UI is populated by `src/lib/adapter.ts` which reads `songs.level_*` via `level_${score.difficulty.toLowerCase()}`. The `ScoreRow` type lives in `src/types/database.ts` and `SongRow` holds the `level_*` columns.

## Goals / Non-Goals

**Goals:**
- Fix the wrong GraphQL query so gsv.fun imports actually return data
- Stop writing difficulty values to `songs.level_*` from player imports
- Give scores their own `level_value` snapshot column so difficulty is still displayed correctly
- Make `gsv_` fallback keys instrument-specific so cross-instrument contamination cannot occur
- Migrate and remove all existing `gsv_${name}` (instrument-less) rows from the songs table

**Non-Goals:**
- Changing the Zetaraku admin sync or how `songs.level_*` is populated by admins
- Modifying bookmarklet scripts
- Changing the kasegi import flow
- Altering how `scores` deduplication works (upsert key unchanged)

## Decisions

### Decision 1: Remove localStorage persistence for skillId

The `savedSkillId` changes with every bookmarklet run. Persisting it gives users false confidence that the stored value is reusable. The UI input field already holds the value for the current session. Remove the `localStorage.getItem/setItem` calls. The spec says `siz_gsv_skill_id` should be persisted; this decision supersedes that — we will update the spec to remove the persistence requirement.

### Decision 2: `scores.level_value` as the difficulty snapshot column

Rather than deriving difficulty display from `songs.level_*`, each score row will carry a `level_value` snapshot of the difficulty at time of import. The adapter reads `score.level_value` first, falling back to `song[level_*]` when null (covers Zetaraku-synced songs without a player score).

### Decision 3: Instrument-qualified `gsv_` fallback key

The fallback key becomes `gsv_${name}_guitar`, `gsv_${name}_bass`, or `gsv_${name}_drum` (matching the suffix convention already used by Zetaraku IDs). This means each instrument has its own slot and cannot collide.

### Decision 4: One-time SQL migration to clean up existing `gsv_${name}` rows

A Supabase migration file will:
1. For each score linked to a `gsv_${name}` song (no `_guitar`/`_bass`/`_drum` suffix), determine the correct song by looking up `${name}_guitar`, `${name}_bass`, or `${name}_drum` in the `songs` table based on the score's `game_type`.
2. Re-point the score's `song_id` to the found Zetaraku song (or leave it on a newly-created `gsv_${name}_guitar/bass/drum` row if no Zetaraku match exists).
3. Delete all `gsv_${name}` songs that have zero remaining scores.

## Implementation Contract

### Bug 1: Query fix

**Behavior:** `handleGsvImport` calls `fetchGsvSkillScores(parseInt(skillId, 10))` — the `savedSkill(skillId)` GraphQL query. The `user(playerId)` query path (`fetchGsvPlayerScores`) is removed from the import flow (the function itself remains in `useGsvImport.ts` for reference but is no longer called by `Import.tsx`).

**Interface:** `Import.tsx` imports `fetchGsvSkillScores` (not `fetchGsvPlayerScores`) from `useGsvImport.ts`. The variable name in `Import.tsx` state changes from `gsvPlayerId` to `gsvSkillId`. The localStorage key `siz_gsv_player_id` is no longer read or written.

**Failure mode:** If `fetchGsvSkillScores` returns empty, the existing error toast fires: "找不到此成績 ID 的資料，請確認網址中的數字是否正確，且 gsv.fun 已完成更新".

**Acceptance criteria:** Entering a valid `savedSkillId` from a recent gsv.fun URL into the import form and clicking import successfully fetches and processes records (previously this returned 0 records or threw because `user(playerId)` query rejected the ID).

### Bug 2: Difficulty snapshot column

**Behavior:** `Import.tsx` no longer updates `songs.level_bsc/adv/ext/mas` at any point. Instead, for each score record with `diff_value > 0`, the value is written to `scores.level_value` in the score upsert payload.

**Interface / data shape:**
- New column: `scores.level_value NUMERIC` (nullable, default null)
- `ScoreRow` in `src/types/database.ts` gains `level_value: number | null`
- `dbScoreToSongData` in `src/lib/adapter.ts` computes `難度數值` as: `score.level_value ?? (song[levelKey] as number | null) ?? 0`
- `Import.tsx` removes the entire Step 3b-2 block (the `levelMap` + `Promise.all` that updated `songs`)
- The score upsert object gains `level_value: r.diff_value > 0 ? r.diff_value : null`

**Failure mode:** If `level_value` is null (Zetaraku-synced song with no player score), fallback to `songs.level_*` applies — display is unchanged for those songs.

**Acceptance criteria:** After import, querying `songs` for a song that had its `level_mas` set by a previous player import shows the original Zetaraku value (or null), not the player's snapshot. The `scores` row for that song has `level_value` = the player's diff_value.

### Bug 3: Instrument-qualified fallback key

**Behavior:** The `gsv_` fallback key in `handleGsvImport` uses `getGsvFallbackId(name, part)` which returns `gsv_${name}_guitar`, `gsv_${name}_bass`, or `gsv_${name}_drum` based on `r.part`. Songs created by Step 3 when no Zetaraku match is found use `getZetarakuId` as before (unchanged).

**Interface:**
- New internal helper `getGsvFallbackId(name: string, part: string): string` in `Import.tsx` (same logic as `getZetarakuId` but with `gsv_` prefix)
- `gsvCandidates` (Step 2 query) built from `getGsvFallbackId` instead of `gsv_${r.name}`
- Fallback on line 106 uses `idLookup.get(getGsvFallbackId(r.name, r.part))` instead of `idLookup.get(`gsv_${r.name}`)`

**Failure mode:** Old `gsv_${name}` rows (no suffix) are not in `gsvCandidates` so they will never be found via fallback after this change — they are handled entirely by the migration.

**Acceptance criteria:** After a GF import, no Guitar score is linked to a song row where `instrument = 'D'` or `game_type = 'DM'`. GF dashboard shows only Guitar/Bass labels; DM dashboard shows only Drums labels.

### Migration: cleanup existing `gsv_${name}` rows

**Behavior:** Supabase migration SQL:
1. Identifies songs where `konami_song_id LIKE 'gsv_%'` AND `konami_song_id NOT LIKE '%\_guitar'` AND `konami_song_id NOT LIKE '%\_bass'` AND `konami_song_id NOT LIKE '%\_drum'`
2. For each such song, joins with `scores` to find linked records
3. Per score, looks up `songs` for `${song_title}_guitar`, `${song_title}_bass`, or `${song_title}_drum` (matching based on score `game_type`: GF → `_guitar` or `_bass` based on score instrument, DM → `_drum`)
4. Updates `scores.song_id` to the found song id (or the original if no match, to avoid nulling foreign keys)
5. Deletes `gsv_${name}` songs where `id NOT IN (SELECT DISTINCT song_id FROM scores)`

**Failure mode:** If no Zetaraku match exists for a `gsv_*` song, the score's `song_id` is left on the original row (no data loss). The orphaned row is only deleted if it has zero linked scores.

**Acceptance criteria:** After migration, `SELECT COUNT(*) FROM songs WHERE konami_song_id LIKE 'gsv_%' AND konami_song_id NOT LIKE '%\_guitar' AND konami_song_id NOT LIKE '%\_bass' AND konami_song_id NOT LIKE '%\_drum'` returns 0 rows with no linked scores. Songs with unresolved scores retain their row.

## Risks / Trade-offs

- **Migration irreversibility**: Re-linking `scores.song_id` cannot be undone without a backup. The migration should be reviewed before running in production.
- **`level_value` null for old scores**: Scores imported before this change have `level_value = null`. They fall back to `songs.level_*` (correct for Zetaraku-synced songs, but 0 for songs that only ever had player-import difficulty). These users will need to re-import to populate `level_value`.
- **`fetchGsvPlayerScores` is now dead code**: Kept in `useGsvImport.ts` for reference. Could be removed in a follow-up cleanup.
