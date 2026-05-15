## Requirements

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

---
### Requirement: PianFen Page Displays Ranked Song List

Each song row in the PianFen page SHALL display the following elements in order: rank number, cover image (40×40, from Zetaraku CDN or grey placeholder), song name, difficulty badge, instrument label, level value, gojuuon row badge, average skill value.

#### Scenario: Song row contains cover image and yomi badge

- **WHEN** the PianFen data loads and a song row is rendered
- **THEN** the row SHALL contain a 40×40 cover image or placeholder on the left, followed by song name and metadata (difficulty, instrument, level, gojuuon row badge), and average skill on the right

---
### Requirement: Data Caching via TanStack Query

The `usePianFen` hook SHALL use TanStack Query `useQuery` with a `staleTime` of 5 minutes (300,000 ms) to avoid redundant requests to gsv.fun during a session.

#### Scenario: Repeated navigation does not re-fetch within stale window

- **WHEN** the user visits PianFen GF, navigates away, and returns within 5 minutes
- **THEN** the system SHALL serve the cached response without issuing a new HTTP request to gsv.fun

---
### Requirement: PianFen List Sort Order

After filtering by allowed parts (`G`, `B` for GF; `D` for DM), both the `hot` and `other` arrays SHALL be sorted according to the active `sortBy` mode before being returned to the component. When `sortBy` is `"skill"` (default), arrays SHALL be sorted by `averageSkill` descending. When `sortBy` is `"percent"`, arrays SHALL be sorted by `percent` descending. The sort SHALL be stable with respect to equal values (preserve original API order among ties). The `hot` and `other` arrays SHALL each maintain their own independent pagination at 25 items per page.

#### Scenario: HOT list sorted by skill descending (default)

- **WHEN** the PianFen page loads with default sort mode
- **THEN** the HOT list SHALL display songs ordered by `averageSkill` descending
- **THEN** each subsequent entry SHALL have `averageSkill` ≤ the previous entry

#### Scenario: HOT list sorted by player percent descending

- **WHEN** the user switches sort mode to "玩家%"
- **THEN** the HOT list SHALL re-order songs by `percent` descending immediately
- **THEN** the OTHER list SHALL also re-order by `percent` descending simultaneously

##### Example: sort mode switch

- **GIVEN** two HOT songs: A(`averageSkill`=148, `percent`=45%), B(`averageSkill`=152, `percent`=30%)
- **WHEN** sort mode is `"skill"`: order is B, A
- **WHEN** sort mode is `"percent"`: order is A, B

#### Scenario: HOT and OTHER sections have independent pagination

- **WHEN** the combined HOT list has 225 entries and combined OTHER list has 750 entries
- **THEN** the HOT section SHALL show items 1–25 with its own ◄► controls and page indicator
- **THEN** the OTHER section SHALL show items 1–25 with its own ◄► controls and page indicator
- **THEN** navigating HOT to page 2 SHALL NOT affect the OTHER page state

#### Scenario: Page state resets on instrument or scope change

- **WHEN** the user changes the instrument (GF ↔ DM) or the scope tier
- **THEN** both HOT page and OTHER page SHALL reset to page 1

---
### Requirement: PianFen Player Percent Field

The system SHALL calculate a `percent` field for each `PianFenRecord` representing the ratio of players in the selected scope tier who use that song to earn skill. The formula SHALL be `Math.round((record.count / totalCount) * 10000) / 100` where `totalCount` is the `count` field from the `kasegiNew` top-level response. If `totalCount` is 0, `percent` SHALL be 0.

#### Scenario: Percent computed correctly from API data

- **WHEN** `kasegiNew.count` is 100 and a record has `count` 45
- **THEN** the record's `percent` field SHALL equal 45.00

##### Example: percent calculation boundary cases

| totalCount | record.count | Expected percent |
|------------|--------------|------------------|
| 100        | 45           | 45.00            |
| 100        | 1            | 1.00             |
| 0          | 10           | 0 (guard)        |
| 500        | 123          | 24.60            |

#### Scenario: Percent is displayed in each song row

- **WHEN** a song row is rendered
- **THEN** the row SHALL display the `percent` value formatted as `XX.XX%` on the right side alongside `averageSkill`

---
### Requirement: PianFen Sort Mode Toggle

The PianFen page SHALL provide a sort mode toggle that lets the user switch between sorting by `averageSkill` (label: "技能分") and sorting by `percent` (label: "玩家%"). The default sort mode SHALL be `"skill"`. The toggle SHALL be visible in the controls bar alongside the scope selector. Switching sort mode SHALL NOT reset the HOT or OTHER page numbers.

#### Scenario: Sort toggle switches between skill and percent

- **WHEN** the user taps "玩家%" toggle button
- **THEN** both HOT and OTHER lists SHALL re-sort by `percent` descending
- **THEN** the "玩家%" button SHALL appear active and "技能分" inactive
- **WHEN** the user taps "技能分" toggle button
- **THEN** both lists SHALL re-sort by `averageSkill` descending
