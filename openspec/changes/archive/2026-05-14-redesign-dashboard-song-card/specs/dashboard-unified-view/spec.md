## REMOVED Requirements

### Requirement: Kasegi Bar on Dashboard SongCard
**Reason**: The progress bar at the bottom of the card is replaced by an inline "未達標" badge and gap value (－X.X) displayed in the instrument/target row. This reduces card height and makes the gap more immediately visible alongside the target value.
**Migration**: Remove the `kasegiBar` prop from `SongCard` component interface and all usage in `src/pages/Dashboard.tsx`. Remove `calculateKasegiPotential` call and `kasegiBarData` calculation in the Dashboard render loop.

#### Scenario: No kasegi bar after redesign

- **WHEN** SongCard is rendered on the Dashboard scores page with `kasegiOverlay` data
- **THEN** no "賺分空間" progress bar SHALL appear below the score rows
- **THEN** the gap to target SHALL be displayed as an inline badge in the instrument row instead

---

## ADDED Requirements

### Requirement: SongCard Vertical Layout on Dashboard

Each SongCard on the Dashboard scores page SHALL use a vertical left column containing the cover image (40×40px) and the difficulty badge (譜面等級 label stacked above 難度數值) directly below the cover. The instrument name SHALL move from the difficulty row to the instrument/target row as the leftmost element.

A neon-pink gradient separator line (height 2px, left-to-right fade) SHALL appear between the instrument/target row and the score rows.

#### Scenario: Cover and difficulty badge are vertically stacked

- **WHEN** a SongCard is rendered
- **THEN** the cover image SHALL appear at the top of the left column
- **THEN** the difficulty badge (e.g., MAS / 9.2) SHALL appear directly below the cover in the same column
- **THEN** the instrument name (e.g., Guitar) SHALL appear at the left of the instrument/target row, not beside the difficulty badge

#### Scenario: Gradient separator between info and scores

- **WHEN** a SongCard is rendered with at least one visible score row
- **THEN** a 2px neon-pink gradient separator line SHALL appear between the instrument/target row and the score rows
