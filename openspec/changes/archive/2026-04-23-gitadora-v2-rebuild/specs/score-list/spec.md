## ADDED Requirements

### Requirement: Personal Score List Display

The system SHALL display the authenticated user's scores on `/dashboard/gf` (Guitar/Bass) and `/dashboard/dm` (Drums). Each score entry SHALL show: song cover, song title, instrument type, difficulty, achievement rate, skill point, best grade, EXC/FC badge (if applicable), and source (arcade/konaste icon).

#### Scenario: GF dashboard shows only Guitar and Bass scores

- **WHEN** an authenticated user visits `/dashboard/gf`
- **THEN** the system SHALL display only scores where `game_type = 'GF'`

#### Scenario: DM dashboard shows only Drums scores

- **WHEN** an authenticated user visits `/dashboard/dm`
- **THEN** the system SHALL display only scores where `game_type = 'DM'`

#### Scenario: Empty state when no scores exist

- **WHEN** an authenticated user has no scores for the selected game type
- **THEN** the system SHALL display an empty state with a link to `/import`

---

### Requirement: Score Filtering

The score list SHALL support filtering by difficulty, source (arcade/konaste/both), and best grade range.

#### Scenario: Filter by difficulty

- **WHEN** a user selects one or more difficulty values (BSC, ADV, EXT, MAS) from the filter panel
- **THEN** the score list SHALL show only entries matching the selected difficulties

#### Scenario: Filter by source

- **WHEN** a user selects "Arcade", "Konaste", or "Both" from the source filter
- **THEN** the score list SHALL show only entries from the selected source(s)

#### Scenario: Reset filters

- **WHEN** a user clicks "Reset Filters"
- **THEN** all filter values SHALL return to their defaults and the full score list SHALL re-render

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
