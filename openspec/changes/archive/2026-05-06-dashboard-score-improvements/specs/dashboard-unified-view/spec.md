## ADDED Requirements

### Requirement: Quick-filter Chips for Score Status

The Dashboard scores page SHALL provide three quick-filter chips — "全部", "可加分", and "未達標" — displayed at the start of the filter bar Row 2. The active chip SHALL be visually highlighted. Switching chips SHALL reset pagination to page 1.

| Chip label | Filter condition | Definition |
|------------|-----------------|------------|
| 全部 | None | Show all songs (default) |
| 可加分 | bestRate < 95% | Best achievement rate across arcade and home is below 95% |
| 未達標 | bestRate < 80% | Best achievement rate across arcade and home is below 80% |

Where `bestRate = max(arcadeAchievementRate, homeAchievementRate)`.

#### Scenario: 可加分 chip filters songs with room to improve

- **WHEN** the user selects the "可加分" chip
- **THEN** only songs where `max(arcadeRate, homeRate) < 95` SHALL be displayed

#### Scenario: 未達標 chip filters songs with low achievement

- **WHEN** the user selects the "未達標" chip
- **THEN** only songs where `max(arcadeRate, homeRate) < 80` SHALL be displayed

#### Scenario: 全部 chip shows all songs

- **WHEN** the user selects the "全部" chip
- **THEN** no achievement-rate filter SHALL be applied

#### Scenario: Chip switch resets pagination

- **WHEN** the user switches between quick-filter chips
- **THEN** the displayed page SHALL reset to page 1

##### Example: chip filtering

- **GIVEN** three songs with bestRate 97%, 85%, 72%
- **WHEN** the user selects "可加分"
- **THEN** the list SHALL show only the songs with 85% and 72%
- **WHEN** the user then selects "未達標"
- **THEN** the list SHALL show only the song with 72%

---

### Requirement: Kasegi Bar on Dashboard SongCard

Each SongCard on the Dashboard scores page SHALL display a "賺分空間" (kasegi potential) progress bar below the score rows when kasegi data is provided. The bar SHALL show how much of the maximum possible skill the player has already achieved, and SHALL display the remaining potential in points.

The kasegi bar SHALL only appear on the Dashboard scores page, not on PianFen or other pages that use SongCard.

#### Scenario: Bar reflects current vs max skill

- **WHEN** a song has `level = 8.0` and `bestAchievementRate = 80%`
- **THEN** the bar fill SHALL be 80% of full width, and the label SHALL read "還差 3.2 pt"
  - current_skill = 8.0 × (80/100) × 2 = 12.8
  - max_skill = 8.0 × 2 = 16.0
  - potential = 16.0 − 12.8 = 3.2

#### Scenario: Bar is hidden when no kasegi data passed

- **WHEN** SongCard is rendered without the `kasegiBar` prop (e.g., on PianFen page)
- **THEN** no kasegi bar section SHALL be rendered

##### Example: kasegi bar calculation

| level | bestRate | fill % | label |
|-------|----------|--------|-------|
| 9.0 | 90% | 90% | 還差 1.8 pt |
| 7.5 | 100% | 100% | 還差 0.0 pt |
| 8.5 | 60% | 60% | 還差 6.8 pt |
