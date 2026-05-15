## MODIFIED Requirements

### Requirement: GSV.fun Player Score Import

The Import page SHALL provide a gsv.fun-based import capability that fetches individual player score data directly from the gsv.fun GraphQL API without requiring a bookmarklet or leaving the application. The user SHALL provide their gsv.fun **player ID** (a persistent integer found in the player's gsv.fun profile URL, e.g., `1935` from `gsv.fun/zh/galaxywave_delta/1935/p`). The player ID SHALL be persisted in localStorage under the key `siz_gsv_player_id` so it is remembered across sessions and never needs to be re-entered.

The Import page SHALL display only the arcade (gsv.fun) import section. There SHALL be no Konaste (home version) import tab or UI.

#### Scenario: Successful import from gsv.fun using player ID

- **WHEN** the user enters a valid gsv.fun player ID and clicks the import button
- **THEN** the app SHALL POST to `https://gsv.fun/graphql` with the `user` query, once with `type: g` (GF) and once with `type: d` (DM), both using `version: galaxywave_delta`
- **THEN** GF records SHALL be read from `user.guitarSkill.hot.data` and `user.guitarSkill.other.data`
- **THEN** DM records SHALL be read from `user.drumSkill.hot.data` and `user.drumSkill.other.data`
- **THEN** each new record SHALL be inserted into the `scores` table with `source: "arcade"`
- **THEN** each existing record (matched by user_id + song_id + game_type + difficulty + source "arcade") SHALL be updated in place with the new achievement_rate and skill_point
- **THEN** a toast SHALL display the count of successfully imported or updated records

##### Example: player ID is persistent across imports

- **GIVEN** the user's gsv.fun profile URL is `gsv.fun/zh/galaxywave_delta/1935/p`
- **WHEN** the user saves a new skill snapshot on gsv.fun and returns to the Import page
- **THEN** the player ID input SHALL still show `1935` (unchanged)
- **THEN** clicking import SHALL fetch the latest scores without entering a new ID

#### Scenario: Re-import deduplication

- **WHEN** the user clicks import a second time (same or updated scores)
- **THEN** existing scores with `source: "arcade"` SHALL be matched by `(user_id, song_id, game_type, difficulty)` and updated rather than inserted
- **THEN** no 409 Conflict errors SHALL occur

#### Scenario: Difficulty and part mapping

- **WHEN** a SkillRecord has `diff` containing "MAS" (case-insensitive)
- **THEN** the mapped difficulty SHALL be `"MAS"`
- **WHEN** a SkillRecord has `part` containing "D" or "drum" (case-insensitive)
- **THEN** the mapped game_type SHALL be `"DM"` and instrument SHALL be `"D"`
- **WHEN** a SkillRecord has `part` containing "B" or "bass" (case-insensitive)
- **THEN** the mapped game_type SHALL be `"GF"` and instrument SHALL be `"B"`

#### Scenario: Player ID persisted across sessions

- **WHEN** the user enters a player ID and performs an import
- **THEN** `localStorage.setItem("siz_gsv_player_id", playerId)` SHALL be called
- **WHEN** the user returns to the Import page in a later session
- **THEN** the player ID input SHALL be pre-filled with the stored value
