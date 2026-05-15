## MODIFIED Requirements

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
