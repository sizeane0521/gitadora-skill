## ADDED Requirements

### Requirement: Kasegi Skill Calculation

The system SHALL calculate "kasegi potential" for each song using the Gitadora Skill formula: `Skill = level × (achievement_rate / 100) × 2`. The maximum achievable skill for a song at a given difficulty is `level × 2` (at 100% achievement). The kasegi potential is defined as `max_skill - current_skill`.

#### Scenario: Kasegi potential calculation is correct

- **WHEN** a score has `level = 7.5` and `achievement_rate = 90.0`
- **THEN** the system SHALL calculate `current_skill = 7.5 × (90/100) × 2 = 13.5`, `max_skill = 7.5 × 2 = 15.0`, and `kasegi_potential = 1.5`

#### Scenario: Scores at 100% have zero kasegi potential

- **WHEN** a score has `achievement_rate = 100.0`
- **THEN** the system SHALL calculate `kasegi_potential = 0` and this entry SHALL appear at the bottom of the kasegi list

---

### Requirement: Kasegi List Display

The system SHALL display the kasegi list at `/kasegi/gf` and `/kasegi/dm`, ordered by `kasegi_potential` descending. Each entry SHALL show: song title, current skill, maximum achievable skill, kasegi potential (highlighted in skill-gold color), difficulty, and current achievement rate.

#### Scenario: Kasegi list is ordered by potential

- **WHEN** an authenticated user visits `/kasegi/gf`
- **THEN** the list SHALL be sorted by `kasegi_potential` from highest to lowest

#### Scenario: Empty state when no scores exist

- **WHEN** the user has no scores for the selected game type
- **THEN** the system SHALL display an empty state with a link to `/import`

---

### Requirement: Kasegi Filtering

The kasegi list SHALL support filtering by: difficulty level range (e.g., 7.50–7.99), source (arcade/konaste/both), and grade (exclude EXC entries, or show all).

#### Scenario: Filter by difficulty range

- **WHEN** a user sets a minimum level of 7.50 and maximum of 7.99
- **THEN** the kasegi list SHALL show only scores where the song level falls within [7.50, 7.99]

#### Scenario: Filter by source

- **WHEN** a user selects "Arcade" as the source filter
- **THEN** the kasegi list SHALL show only scores where `source = 'arcade'`

#### Scenario: Exclude EXC scores

- **WHEN** a user enables the "Hide EXC" toggle
- **THEN** the kasegi list SHALL exclude entries where `is_excellent = true`

---

### Requirement: Kasegi GF/DM Tab Switching

The kasegi page SHALL provide tabs to switch between GF and DM views. The active tab SHALL update the URL to `/kasegi/gf` or `/kasegi/dm`.

#### Scenario: Tab switch updates displayed scores

- **WHEN** a user clicks the DM tab on `/kasegi/gf`
- **THEN** the URL SHALL change to `/kasegi/dm` and the list SHALL re-render with DM scores only
