## Problem

Three data integrity bugs in the gsv.fun import flow cause incorrect data to be stored and displayed:

1. **Wrong GraphQL query**: `handleGsvImport` calls `fetchGsvPlayerScores` which uses `user(playerId: Int)` query. However, the number in the gsv.fun URL (e.g., `44355` from `gsv.fun/zh/galaxywave_delta/44355/p`) is a `savedSkillId` — a sequential ID assigned to each upload — not a fixed player ID. The correct query is `savedSkill(skillId: Int)` via `fetchGsvSkillScores`. Additionally, the ID is persisted to localStorage but serves no purpose since it changes with every bookmarklet run.

2. **Difficulty written to wrong table**: During import (Step 3b-2), `diff_value` from the player's score data is written to `songs.level_bsc/adv/ext/mas` columns. These columns belong to Zetaraku (the admin song catalogue source) and should not be touched by player imports. This causes Zetaraku-managed difficulty values to be overwritten by player snapshot data.

3. **Cross-instrument `gsv_` fallback contamination**: When a song cannot be matched to a Zetaraku entry, the import falls back to a `gsv_${name}` key (without instrument suffix). If a Drums import previously created a `gsv_SONGNAME` row, a subsequent Guitar import for the same song finds that row via fallback and links Guitar scores to a Drums song — causing Guitar/Bass dashboard to show Drums instrument labels.

## Root Cause

- Bug 1: A previous change (`gsv-use-player-id-for-import`) incorrectly assumed the URL number was a stable player ID and switched from the correct `savedSkill` query to `user` query.
- Bug 2: No separate column exists for player-imported difficulty snapshots; the import flow writes to the Zetaraku-owned column as a workaround.
- Bug 3: The `gsv_` fallback key does not encode instrument information, so cross-instrument rows are indistinguishable.

## Proposed Solution

1. **Fix the query**: Replace the `fetchGsvPlayerScores` call in `handleGsvImport` with `fetchGsvSkillScores`. Remove localStorage persistence of the skill snapshot ID (the UI input field already holds it per session). Update the spec to clarify that the ID changes with each bookmarklet run.

2. **Add `level_value` to `scores` table**: Add a nullable `numeric` column `level_value` to the `scores` table. During import, write `diff_value` to `scores.level_value` instead of `songs.level_*`. Display logic reads `scores.level_value` first, falling back to `songs.level_*` when null.

3. **Fix `gsv_` fallback key to include instrument**: Change the fallback lookup key from `gsv_${name}` to `gsv_${name}_guitar` / `gsv_${name}_bass` / `gsv_${name}_drum` so each instrument has its own slot. Migrate any existing scores still linked to old `gsv_${name}` rows to the correct instrument-specific song rows, then remove the orphaned `gsv_${name}` songs.

## Non-Goals

- Changing how Zetaraku admin sync works (it continues to own `songs.level_*`).
- Modifying the bookmarklet scripts themselves.
- Changing the kasegi import flow.
- Adding new UI beyond removing the now-unused localStorage field.

## Success Criteria

- Importing a gsv.fun skill snapshot URL returns score data (currently fails silently or returns wrong data with `user` query).
- After import, `songs.level_bsc/adv/ext/mas` values set by Zetaraku are not changed.
- `scores.level_value` contains the difficulty value from the player's snapshot.
- Guitar/Bass dashboard shows only Guitar/Bass instrument labels; Drums dashboard shows only Drums labels, even when both game types have scores for the same song title.
- No `gsv_${name}` (instrument-less) rows remain in the `songs` table after migration.

## Impact

- Affected specs: gsv-import
- Affected code:
  - Modified: src/pages/Import.tsx
  - Modified: src/hooks/useGsvImport.ts
  - Modified: supabase/migrations (new migration file for `scores.level_value` column and `gsv_` cleanup)
  - Modified: src/components/SongCard.tsx
