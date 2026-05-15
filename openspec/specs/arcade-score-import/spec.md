## Requirements

### Requirement: Arcade Score DOM Scraping

When the arcade bookmarklet executes on p.eagate.573.jp, it SHALL extract score data from the skill target song table using the following verified selectors: rows at `div.maincont table.skill_table_tb tbody tr`, song title at `div.title a.text_link`, instrument part at `div.seq_icon[class*="part_"]`, difficulty at `div.seq_icon[class*="diff_"]`, skill point at `td.skill_cell`, achievement rate at `td.achive_cell`, and difficulty level at `td.diff_cell`. Rows with no title SHALL be skipped silently.

#### Scenario: Bookmarklet extracts GHOST score correctly

- **GIVEN** a row containing `div.title a.text_link` with text `GHOST`, `div.seq_icon part_GUITAR`, `div.seq_icon diff_MASTER`, `td.skill_cell` text `146.28 pt`, `td.achive_cell` text `79.50%`, `td.diff_cell` text `9.20`
- **WHEN** the bookmarklet scrapes the row
- **THEN** the extracted record SHALL have `title: "GHOST"`, `game_type: "GF"`, `part: "G"`, `difficulty: "MAS"`, `skill_point: 146.28`, `achievement_rate: 79.50`, `diff_level: 9.20`

#### Scenario: Drum part maps to DM

- **GIVEN** a row with `div.seq_icon part_DRUM`
- **WHEN** the bookmarklet scrapes the row
- **THEN** `game_type` SHALL be `"DM"` and `part` SHALL be `"D"`

#### Scenario: No scores found

- **WHEN** `div.maincont table.skill_table_tb tbody tr` returns 0 rows
- **THEN** the bookmarklet SHALL alert the user to navigate to the score page first and stop execution

---
### Requirement: Arcade Score Upsert to Supabase

The bookmarklet SHALL upsert each extracted score to Supabase via REST API. For each score, it SHALL first find or create a song record using `konami_song_id = "arcade_" + title`. It SHALL then upsert a score record with `source: "arcade"` using `Prefer: resolution=merge-duplicates`. Upon completion it SHALL alert the user with a count of successfully imported and failed records.

#### Scenario: Successful import

- **WHEN** the bookmarklet completes uploading N scores with 0 failures
- **THEN** it SHALL alert `[SIZ_GITADORA] Import complete: N songs updated`

#### Scenario: Partial failure

- **WHEN** some score upserts fail
- **THEN** it SHALL alert with both success count and failure count
