## Requirements

### Requirement: GSV.fun Player Score Import

The Import page SHALL provide a gsv.fun-based import capability that fetches individual player score data directly from the gsv.fun GraphQL API without requiring a bookmarklet or leaving the application. The user SHALL provide their gsv.fun **skill snapshot ID** (an integer that changes with each upload, found in the gsv.fun profile URL, e.g., `44355` from `gsv.fun/zh/galaxywave_delta/44355/p`). The skill snapshot ID SHALL NOT be persisted in localStorage between sessions; users must enter the current snapshot ID each time they import, as the value changes with every bookmarklet run.

The Import page SHALL display only the arcade (gsv.fun) import section. There SHALL be no Konaste (home version) import tab or UI.

#### Scenario: Successful import from gsv.fun

- **WHEN** the user enters a valid gsv.fun skill snapshot ID and clicks the import button
- **THEN** the app SHALL POST to `https://gsv.fun/graphql` with the `savedSkill` query using the `skillId` variable
- **THEN** all `SkillRecord` entries from `skill.hot.data` and `skill.other.data` for both GF and DM game types SHALL be processed
- **THEN** each new record SHALL be inserted into the `scores` table with `source: "arcade"`
- **THEN** each existing record (matched by user_id + song_id + game_type + difficulty + source "arcade") SHALL be updated in place with the new achievement_rate, skill_point, and level_value
- **THEN** a toast SHALL display the count of successfully imported or updated records

#### Scenario: Re-import deduplication

- **WHEN** the user imports the same skill snapshot ID a second time (or imports a new snapshot with overlapping songs)
- **THEN** existing scores with `source: "arcade"` SHALL be matched by `(user_id, song_id, game_type, difficulty)` and updated rather than inserted
- **THEN** no 409 Conflict errors SHALL occur

##### Example: re-import updates existing score

- **GIVEN** the scores table already contains a row with `user_id=U`, `song_id=S`, `game_type="GF"`, `difficulty="MAS"`, `source="arcade"`, `achievement_rate=79.5`
- **WHEN** the user imports a new snapshot where the same song now has `achievement_rate=82.0`
- **THEN** the existing row SHALL be updated to `achievement_rate=82.0`
- **THEN** no new row SHALL be inserted for that song

#### Scenario: Difficulty and part mapping

- **WHEN** a SkillRecord has `diff` containing "MAS" (case-insensitive)
- **THEN** the mapped difficulty SHALL be `"MAS"`
- **WHEN** a SkillRecord has `part` containing "D" or "drum" (case-insensitive)
- **THEN** the mapped game_type SHALL be `"DM"` and instrument SHALL be `"D"`
- **WHEN** a SkillRecord has `part` containing "B" or "bass" (case-insensitive)
- **THEN** the mapped game_type SHALL be `"GF"` and instrument SHALL be `"B"`

---
### Requirement: Difficulty Level Snapshot in Scores

During gsv.fun score import, the system SHALL write the `diff_value` from each score record into the `scores.level_value` column (a snapshot of the difficulty at time of import). The system SHALL NOT write `diff_value` to the `songs` table `level_*` columns; those columns are exclusively maintained by the Zetaraku admin sync.

#### Scenario: Import writes diff_value to scores.level_value

- **WHEN** a gsv.fun import record has `name = "GHOST"`, `diff = "MAS"`, `diff_value = 9.2`
- **THEN** after import the corresponding `scores` row SHALL have `level_value = 9.2`
- **THEN** the corresponding `songs` row `level_mas` column SHALL NOT be modified by the import

#### Scenario: Import does not write when diff_value is zero

- **WHEN** a record has `diff_value = 0` or `diff_value` is absent
- **THEN** `scores.level_value` SHALL be set to null for that record

#### Scenario: Difficulty display uses score snapshot with fallback

- **WHEN** displaying a song entry that has a `scores` row with `level_value` set
- **THEN** the UI SHALL display `scores.level_value` as the difficulty number
- **WHEN** displaying a song entry where `scores.level_value` is null
- **THEN** the UI SHALL fall back to the corresponding `songs.level_*` column value

##### Example: level_value takes precedence over songs.level_*

- **GIVEN** a scores row has `difficulty = "MAS"` and `level_value = 9.2`
- **AND** the linked songs row has `level_mas = 0`
- **WHEN** the song card is rendered
- **THEN** the displayed difficulty number SHALL be `9.2`

---
### Requirement: Instrument-Isolated Song Fallback Keys

When a gsv.fun import cannot find a Zetaraku song match for a given song+instrument combination, the fallback lookup key SHALL include the instrument suffix (`_guitar`, `_bass`, or `_drum`). Guitar, Bass, and Drums scores for the same song title SHALL never share a fallback song row.

#### Scenario: Guitar and Drums scores for same song title do not share a song row

- **GIVEN** a Drums import previously created a fallback song row with key `gsv_SONGNAME_drum`
- **WHEN** a Guitar import processes the same song title
- **THEN** the Guitar import SHALL look up `gsv_SONGNAME_guitar` (not `gsv_SONGNAME_drum`)
- **THEN** if no `gsv_SONGNAME_guitar` exists, the import SHALL create a new row for it
- **THEN** the Guitar score SHALL be linked to the guitar row, not the drum row

#### Scenario: No instrument-less gsv_ rows remain after migration

- **WHEN** the one-time cleanup migration has run
- **THEN** no rows in the `songs` table SHALL have a `konami_song_id` matching `gsv_%` without a `_guitar`, `_bass`, or `_drum` suffix, unless those rows still have linked scores with no matching Zetaraku or instrument-qualified row

##### Example: instrument-qualified fallback key format

| song title | part | fallback key     |
|------------|------|------------------|
| GHOST      | G    | gsv_GHOST_guitar |
| GHOST      | B    | gsv_GHOST_bass   |
| GHOST      | D    | gsv_GHOST_drum   |

---
### Requirement: GSV.fun API Fetch Timeout

All HTTP requests to the gsv.fun GraphQL endpoint SHALL be wrapped with a 15-second timeout using an AbortController. If the request does not complete within 15 seconds, it SHALL be aborted and the import function SHALL throw an AbortError.

The import handler SHALL catch any thrown error (including AbortError) and SHALL call `setGsvImporting(false)` to release the loading state, then display a destructive toast with title "匯入失敗" and description "gsv.fun 連線失敗，請稍後再試".

#### Scenario: gsv.fun API responds within 15 seconds

- **WHEN** the user clicks the import button with a valid skill ID
- **THEN** the fetch SHALL complete normally and the import SHALL proceed to the Supabase write steps

#### Scenario: gsv.fun API does not respond within 15 seconds

- **WHEN** the gsv.fun GraphQL endpoint does not return a response within 15 seconds
- **THEN** the AbortController SHALL cancel the in-flight request
- **THEN** the import button SHALL return to its default (non-loading) state
- **THEN** a destructive toast SHALL appear with title "匯入失敗" and description "gsv.fun 連線失敗，請稍後再試"
- **THEN** no data SHALL be written to the `scores` or `songs` tables

##### Example: timeout boundary

| Elapsed time | Expected behaviour |
| ------------ | ------------------ |
| 0–14.999 s   | Request in-flight, button shows "匯入中…" |
| 15.000 s     | AbortController fires, request cancelled, toast shown, button resets |
