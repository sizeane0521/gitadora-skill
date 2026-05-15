## MODIFIED Requirements

### Requirement: Score Filtering

The Dashboard scores page filter bar SHALL NOT include BSC/ADV/EXT/MAS difficulty toggle chips. These are superseded by the kasegi overlay which provides more actionable filtering context.

#### Scenario: Difficulty chips absent from filter bar

- **WHEN** an authenticated user views the Dashboard scores page
- **THEN** no BSC, ADV, EXT, or MAS toggle buttons SHALL appear in the filter bar

##### Example: filter bar contents after removal

- **GIVEN** the user is on the Dashboard scores page
- **WHEN** Row 2 of the filter bar is visible
- **THEN** the filter bar SHALL contain: quick-filter chips (全部/可加分/未達標), source dropdown — but SHALL NOT contain any BSC/ADV/EXT/MAS buttons
