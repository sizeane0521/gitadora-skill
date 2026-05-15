## Requirements

### Requirement: Personal Score List Display

The system SHALL display a unified list of all songs on `/dashboard/gf` (Guitar/Bass) and `/dashboard/dm` (Drums), combining the full song catalogue with the authenticated user's personal scores. Each song entry SHALL show: song cover, yomi badge, song title, diff badge, instrument type, difficulty value, rank number, and a two-row arcade/home score comparison section. Songs without a user score SHALL display "—" in both score rows. The filter bar SHALL be reorganised into two sticky rows as defined in the Two-Row Filter Bar requirement.

Within each song entry, Line 2 SHALL display elements in the following left-to-right order: instrument type (left-aligned), then diff badge and difficulty value grouped together (right-aligned, inseparable). Conditional elements such as wishlist badge or kasegi target number SHALL appear between the instrument type and the diff+level group and SHALL NOT cause the diff badge or difficulty value to shift position.

#### Scenario: GF dashboard shows only Guitar and Bass songs

- **WHEN** an authenticated user visits `/dashboard/gf`
- **THEN** the system SHALL display only songs where `game_type = 'GF'`

#### Scenario: DM dashboard shows only Drums songs

- **WHEN** an authenticated user visits `/dashboard/dm`
- **THEN** the system SHALL display only songs where `game_type = 'DM'`

#### Scenario: Empty catalogue state

- **WHEN** the song catalogue returns no results for the selected game type
- **THEN** the system SHALL display an empty state with a link to `/import`

#### Scenario: Line 2 element order

- **WHEN** a song entry is rendered
- **THEN** the instrument name SHALL appear at the left of Line 2, and the diff badge + difficulty value SHALL appear at the right of Line 2 as an inseparable group

#### Scenario: Line 2 layout consistency across cards with and without conditional elements

- **WHEN** some song entries have a kasegi target or wishlist badge and others do not
- **THEN** the diff badge and difficulty value SHALL appear at the same horizontal position (right-aligned) in all entries regardless of whether conditional elements are present

##### Example: layout with and without kasegi overlay

- **GIVEN** Card A has `kasegiOverlay = { averageSkill: 155.6 }` and Card B has `kasegiOverlay = null`
- **WHEN** both cards are visible in the score list
- **THEN** in both cards, the diff badge (e.g. "MAS") and difficulty value (e.g. "7.10") SHALL appear right-aligned as a group, and only Card A SHALL show the target number to the left of that group

---
### Requirement: Score Filtering

The Dashboard scores page filter bar SHALL NOT include BSC/ADV/EXT/MAS difficulty toggle chips. These are superseded by the kasegi overlay which provides more actionable filtering context.

#### Scenario: Difficulty chips absent from filter bar

- **WHEN** an authenticated user views the Dashboard scores page
- **THEN** no BSC, ADV, EXT, or MAS toggle buttons SHALL appear in the filter bar

##### Example: filter bar contents after removal

- **GIVEN** the user is on the Dashboard scores page
- **WHEN** Row 2 of the filter bar is visible
- **THEN** the filter bar SHALL contain: quick-filter chips (全部/可加分/未達標), source dropdown — but SHALL NOT contain any BSC/ADV/EXT/MAS buttons

---
### Requirement: Score Sorting

The score list SHALL support sorting by: skill point (descending, default), achievement rate (descending), song title (ascending alphabetical), and difficulty level (descending).

#### Scenario: Default sort is skill point descending

- **WHEN** a user opens the score list without changing sort settings
- **THEN** scores SHALL be ordered by `skill_point` from highest to lowest

#### Scenario: User changes sort order

- **WHEN** a user selects a different sort option from the sort dropdown
- **THEN** the list SHALL re-order immediately without a page reload

---
### Requirement: Arcade vs. Home Comparison View

The system SHALL provide a comparison view at `/dashboard/compare` that shows each song where the user has scores from both sources side by side.

#### Scenario: Comparison shows both source scores

- **WHEN** an authenticated user visits `/dashboard/compare`
- **THEN** for each song with both arcade and konaste scores, the system SHALL display both achievement rates, both skill points, and the delta (difference) between them

#### Scenario: Filter comparison by only one-sided scores

- **WHEN** a user selects "Arcade only" or "Konaste only" filter on the compare page
- **THEN** the system SHALL show songs that exist in only the selected source

#### Scenario: Sort by delta

- **WHEN** a user selects "Sort by difference" on the compare page
- **THEN** songs SHALL be ordered by the absolute difference between arcade and konaste achievement rates, from largest to smallest

---
### Requirement: Score List Pagination

The score list SHALL paginate results at 50 items per page.

#### Scenario: Large score list is paginated

- **WHEN** a user has more than 50 score entries
- **THEN** the list SHALL display only the first 50 entries and provide a "Load more" button to fetch the next 50

#### Scenario: Load more appends results

- **WHEN** a user clicks "Load more"
- **THEN** the next 50 entries SHALL be appended to the existing list (not replace it)

---
### Requirement: EXC and FC Badge Display

Scores with `is_excellent = true` SHALL display an EXC badge in exc-pink color. Scores with `is_full_combo = true` and `is_excellent = false` SHALL display an FC badge.

#### Scenario: EXC badge shown for excellent scores

- **WHEN** a score entry has `is_excellent = true`
- **THEN** the entry SHALL display an "EXC" badge with background `exc-pink-bg` and text `exc-pink`

#### Scenario: FC badge shown for full combo scores

- **WHEN** a score entry has `is_full_combo = true` and `is_excellent = false`
- **THEN** the entry SHALL display an "FC" badge

---
### Requirement: Sort Dropdown Labels in Natural Chinese

The sort dropdown on the Dashboard scores page SHALL use natural Traditional Chinese labels instead of mathematical/technical terms. The label "降冪" SHALL NOT appear in the UI.

| Sort key | Old label | New label |
|----------|-----------|-----------|
| skill_point | Skill 降冪 | Skill 由高到低 |
| achievement | 達成率降冪 | 達成率 由高到低 |
| level | 難度降冪 | 難度 由高到低 |
| kasegi | 賺分潛力 | 賺分潛力（unchanged） |
| title | 歌名 | 歌名（unchanged） |

#### Scenario: Sort dropdown shows natural Chinese labels

- **WHEN** a user opens the sort dropdown on the Dashboard scores page
- **THEN** the options SHALL display "Skill 由高到低", "達成率 由高到低", "賺分潛力", "難度 由高到低", "歌名"
- **THEN** no option SHALL contain the word "降冪"

##### Example: sort label text

- **GIVEN** the user opens the sort dropdown
- **WHEN** all options are visible
- **THEN** the five labels SHALL be exactly: "Skill 由高到低", "達成率 由高到低", "賺分潛力", "難度 由高到低", "歌名"

---
### Requirement: Remove Minimum Level Filter

The Dashboard scores page SHALL NOT display a minimum-level (等級) dropdown filter. Level-based filtering is superseded by the existing difficulty-badge filter and sort-by-level option.

#### Scenario: No level dropdown rendered

- **WHEN** an authenticated user views the Dashboard scores page
- **THEN** no minimum-level dropdown SHALL be present in the filter bar

##### Example: filter bar contents

- **GIVEN** the user is on the Dashboard scores page
- **WHEN** the filter bar Row 2 is visible
- **THEN** the filter bar SHALL contain: source dropdown, quick-filter chips (全部/可加分/未達標) — but SHALL NOT contain any level/等級 dropdown or BSC/ADV/EXT/MAS difficulty chips
