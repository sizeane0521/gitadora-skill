## MODIFIED Requirements

### Requirement: Fetch Community Pian-Fen Data from gsv.fun

The PianFen page SHALL read skill-farming song data from the `kasegi_records` Supabase table instead of fetching directly from the gsv.fun GraphQL API. The data structure returned SHALL remain identical to the existing `PianFenData` type (`{ hot: PianFenRecord[], other: PianFenRecord[], totalCount: number }`). If the `kasegi_records` table contains no data for the requested scope and game type, the page SHALL display a message "賺分曲資料尚未同步，請管理者執行同步" in place of the song list.

#### Scenario: PianFen page reads from DB

- **WHEN** an authenticated user navigates to the PianFen page with scope 7000 and game type GF
- **THEN** the page SHALL query `kasegi_records` WHERE `scope = 7000 AND game_type = 'GF'`
- **THEN** the page SHALL NOT make any HTTP request to gsv.fun

#### Scenario: Empty kasegi_records shows sync prompt

- **WHEN** `kasegi_records` contains no records for the selected scope and game type
- **THEN** the PianFen page SHALL display "賺分曲資料尚未同步，請管理者執行同步" in place of the HOT/OTHER song lists

##### Example: DB query mapping

- **GIVEN** scope = 7000, game_type = GF
- **WHEN** the query returns a record `{ category: 'HOT', song_title: 'GHOST', diff: 'MAS', part: 'G', diff_value: 9.2, average_skill: 148.0, player_percent: 71.59 }`
- **THEN** the PianFen page SHALL render that record in the HOT section with diff badge MAS, instrument Guitar, level 9.2, average skill 148.0, player% 71.59%
