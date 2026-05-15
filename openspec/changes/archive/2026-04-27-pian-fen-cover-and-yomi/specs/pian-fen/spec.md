## MODIFIED Requirements

### Requirement: PianFen Page Displays Ranked Song List

Each song row in the PianFen page SHALL display the following elements in order: rank number, cover image (40×40, from Zetaraku CDN or grey placeholder), song name, difficulty badge, instrument label, level value, gojuuon row badge, average skill value.

#### Scenario: Song row contains cover image and yomi badge

- **WHEN** the PianFen data loads and a song row is rendered
- **THEN** the row SHALL contain a 40×40 cover image or placeholder on the left, followed by song name and metadata (difficulty, instrument, level, gojuuon row badge), and average skill on the right
