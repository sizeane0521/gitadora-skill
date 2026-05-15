## ADDED Requirements

### Requirement: GSV.fun Player Score Import

The Import page SHALL provide a gsv.fun-based import capability that fetches individual player score data directly from the gsv.fun GraphQL API without requiring a bookmarklet or leaving the application. The user SHALL provide their gsv.fun player ID (an integer found in their gsv.fun profile URL, e.g., `40575` from `gsv.fun/zh/galaxywave_delta/40575/p`). The player ID SHALL be persisted in localStorage under the key `siz_gsv_player_id` so it is remembered across sessions.

#### Scenario: Successful import from gsv.fun

- **WHEN** the user enters a valid gsv.fun player ID and clicks the import button
- **THEN** the app SHALL POST to `https://gsv.fun/graphql` with the `user` query requesting `guitarSkill` and `drumSkill` data
- **THEN** all `SkillRecord` entries from `guitarSkill.hot.data`, `guitarSkill.other.data`, `drumSkill.hot.data`, and `drumSkill.other.data` SHALL be processed
- **THEN** each record SHALL be upserted into the `scores` table with `source: "gsv"`
- **THEN** a toast SHALL display the count of successfully imported records

#### Scenario: Difficulty and part mapping

- **WHEN** a SkillRecord has `diff` containing "master" (case-insensitive)
- **THEN** the mapped difficulty SHALL be `"MAS"`
- **WHEN** a SkillRecord has `part` containing "drum" (case-insensitive)
- **THEN** the mapped game_type SHALL be `"DM"` and instrument SHALL be `"D"`
- **WHEN** a SkillRecord has `part` containing "bass" (case-insensitive)
- **THEN** the mapped game_type SHALL be `"GF"` and instrument SHALL be `"B"`

#### Scenario: Player ID persisted across sessions

- **WHEN** the user enters a player ID and performs an import
- **THEN** `localStorage.setItem("siz_gsv_player_id", playerId)` SHALL be called
- **WHEN** the user returns to the Import page in a later session
- **THEN** the player ID input SHALL be pre-filled with the stored value
