## MODIFIED Requirements

### Requirement: GSV.fun Player Score Import

The Import page SHALL provide a gsv.fun-based import capability that fetches individual player score data directly from the gsv.fun GraphQL API without requiring a bookmarklet or leaving the application. The user SHALL provide their gsv.fun **skill snapshot ID** (an integer that changes with each upload, found in the gsv.fun profile URL, e.g., `44355` from `gsv.fun/zh/galaxywave_delta/44355/p`). The skill snapshot ID SHALL be persisted in localStorage under the key `siz_gsv_skill_id` so it is remembered across sessions.

The Import page SHALL display only the arcade (gsv.fun) import section. There SHALL be no Konaste (home version) import tab or UI.

#### Scenario: Successful import from gsv.fun

- **WHEN** the user enters a valid gsv.fun skill snapshot ID and clicks the import button
- **THEN** the app SHALL POST to `https://gsv.fun/graphql` with the `savedSkill` query using the `skillId` variable
- **THEN** all `SkillRecord` entries from `skill.hot.data` and `skill.other.data` for both GF and DM game types SHALL be processed
- **THEN** each new record SHALL be inserted into the `scores` table with `source: "arcade"`
- **THEN** each existing record (matched by user_id + song_id + game_type + difficulty + source "arcade") SHALL be updated in place with the new achievement_rate and skill_point
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

#### Scenario: Skill snapshot ID persisted across sessions

- **WHEN** the user enters a skill snapshot ID and performs an import
- **THEN** `localStorage.setItem("siz_gsv_skill_id", skillId)` SHALL be called
- **WHEN** the user returns to the Import page in a later session
- **THEN** the skill snapshot ID input SHALL be pre-filled with the stored value
