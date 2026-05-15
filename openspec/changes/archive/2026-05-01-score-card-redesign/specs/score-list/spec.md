## MODIFIED Requirements

### Requirement: Personal Score List Display

The system SHALL display the authenticated user's scores on `/dashboard/gf` (Guitar/Bass) and `/dashboard/dm` (Drums). Each score entry SHALL use a compact list card style consistent with the PianFen leaderboard rows. Each card SHALL show: song cover (40×40px, difficulty-colored border), yomi classification badge, song title, diff badge, instrument type, difficulty value, and a two-row arcade/home score comparison section. The comparison section SHALL display arcade (街) and home (家) scores each as one row containing: a horizontal progress bar filled to the achievement rate percentage, the skill point value, and an EXC or FC badge if applicable.

#### Scenario: GF dashboard shows only Guitar and Bass scores

- **WHEN** an authenticated user visits `/dashboard/gf`
- **THEN** the system SHALL display only scores where `game_type = 'GF'`

#### Scenario: DM dashboard shows only Drums scores

- **WHEN** an authenticated user visits `/dashboard/dm`
- **THEN** the system SHALL display only scores where `game_type = 'DM'`

#### Scenario: Empty state when no scores exist

- **WHEN** an authenticated user has no scores for the selected game type
- **THEN** the system SHALL display an empty state with a link to `/import`

#### Scenario: Score card shows progress bar at correct fill level

- **WHEN** a score entry has arcade achievement rate 75.00%
- **THEN** the arcade progress bar SHALL be filled to 75% of its total width

#### Scenario: Unplayed source shows dash instead of score

- **WHEN** a score entry has arcade achievement rate 0 and arcade skill 0
- **THEN** the arcade row SHALL display "—" instead of a number, and no progress bar SHALL be shown

##### Example: progress bar fill

| achievementRate | progressBar fill |
|-----------------|------------------|
| 0               | hidden (—)       |
| 50.00           | 50%              |
| 95.48           | 95.48%           |
| 100.00          | 100%             |
