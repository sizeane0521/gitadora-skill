## MODIFIED Requirements

### Requirement: Personal Score List Display

The system SHALL display a unified list of all songs on `/dashboard/gf` (Guitar/Bass) and `/dashboard/dm` (Drums), combining the full song catalogue with the authenticated user's personal scores. Each song entry SHALL show: song cover, yomi badge, song title, diff badge, instrument type, difficulty value, rank number, and a two-row arcade/home score comparison section. Songs without a user score SHALL display "—" in both score rows. The filter bar SHALL be reorganised into two sticky rows as defined in the Two-Row Filter Bar requirement.

#### Scenario: GF dashboard shows only Guitar and Bass songs

- **WHEN** an authenticated user visits `/dashboard/gf`
- **THEN** the system SHALL display only songs where `game_type = 'GF'`

#### Scenario: DM dashboard shows only Drums songs

- **WHEN** an authenticated user visits `/dashboard/dm`
- **THEN** the system SHALL display only songs where `game_type = 'DM'`

#### Scenario: Empty catalogue state

- **WHEN** the song catalogue returns no results for the selected game type
- **THEN** the system SHALL display an empty state with a link to `/import`
