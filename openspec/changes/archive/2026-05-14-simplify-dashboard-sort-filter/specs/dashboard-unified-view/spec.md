## REMOVED Requirements

### Requirement: Quick-filter Chips for Score Status
**Reason**: The chip row (全部 / 未達標) adds UI complexity without sufficient value; the unified sort/source selector and the Row 1 underperforming toggle replace this pattern with a less cluttered layout.
**Migration**: Remove `quickFilter` state, the chip row JSX, and the `underperforming` branch from the `filtered` useMemo in `src/pages/Dashboard.tsx`.

#### Scenario: No quick-filter chips in filter bar after removal

- **WHEN** an authenticated user views the Dashboard scores page filter bar
- **THEN** the filter bar SHALL NOT contain "全部" or "未達標" chip buttons
- **THEN** the filter bar SHALL NOT contain a standalone source dropdown in Row 2

---

## ADDED Requirements

### Requirement: Sort Options on Dashboard Score List

The Dashboard scores page sort selector SHALL provide exactly three options: "全部" (show all songs, sorted by max skill descending), "家機 Skill ↓" (filter to songs with a home score, sorted by home skill point descending), and "街機 Skill ↓" (filter to songs with an arcade score, sorted by arcade skill point descending). No other sort options (achievement rate, difficulty, song title, kasegi potential) SHALL appear.

The selector SHALL default to "全部" on page load.

When "家機 Skill ↓" is selected, songs with no home score SHALL be excluded. When "街機 Skill ↓" is selected, songs with no arcade score SHALL be excluded.

Row 1 SHALL use a left/right 50% layout: the left half contains the HOT/OTHER tabs; the right half contains the underperforming toggle button and the sort dropdown. The standalone source dropdown Row 2 SHALL be removed.

The underperforming toggle SHALL be a button in Row 1 (not a chip row). Clicking once activates it; clicking again deactivates it. When active, the button SHALL display with a neon-pink glow style. When the underperforming toggle is active, the score list SHALL be filtered to songs where the player's skill for the selected source (home, arcade, or max across both) is below the kasegi average skill for that song (`kasegiMap` lookup). The filtered list SHALL be sorted by gap `(kasegiAvgSkill − playerSkill)` descending. Songs with no kasegi record SHALL be excluded from underperforming results.

When `sortKey` is "家機 Skill ↓", the underperforming comparison SHALL use the home skill point. When `sortKey` is "街機 Skill ↓", the comparison SHALL use the arcade skill point. When `sortKey` is "全部", the comparison SHALL use `Math.max(arcadeSkillPoint, homeSkillPoint)`.

#### Scenario: Sort by all songs (全部)

- **WHEN** the user selects "全部" from the sort dropdown
- **THEN** all songs SHALL be displayed regardless of whether the user has a home or arcade score
- **THEN** songs SHALL be ordered by the user's max skill point (max of home and arcade) descending

#### Scenario: Sort by home skill descending

- **WHEN** the user selects "家機 Skill ↓" from the sort dropdown
- **THEN** only songs where the user has a home (konaste) score SHALL be displayed
- **THEN** songs SHALL be ordered by the user's konaste skill point for that song, descending
- **THEN** songs where the user has no home score SHALL NOT appear

#### Scenario: Sort by arcade skill descending

- **WHEN** the user selects "街機 Skill ↓" from the sort dropdown
- **THEN** only songs where the user has an arcade score SHALL be displayed
- **THEN** songs SHALL be ordered by the user's arcade skill point for that song, descending
- **THEN** songs where the user has no arcade score SHALL NOT appear

#### Scenario: Exactly three sort options present

- **WHEN** the user opens the sort dropdown
- **THEN** the dropdown SHALL contain exactly three items: "全部", "家機 Skill ↓", and "街機 Skill ↓"
- **THEN** options for achievement rate, difficulty, song title, and kasegi potential SHALL NOT appear

#### Scenario: Underperforming toggle activates neon-pink style

- **WHEN** the user clicks the underperforming toggle button and it is not already active
- **THEN** the button SHALL display with a neon-pink glow border style
- **THEN** the score list SHALL be filtered to songs where the player's skill is below the kasegi average

#### Scenario: Underperforming toggle deactivates on second click

- **WHEN** the underperforming toggle is active and the user clicks it again
- **THEN** the toggle SHALL deactivate and the score list SHALL revert to the normal sort/filter state

#### Scenario: Underperforming uses source-specific skill for comparison

- **WHEN** the underperforming toggle is active and sortKey is "家機 Skill ↓"
- **THEN** the comparison SHALL use the home (konaste) skill point against the kasegi average
- **WHEN** the underperforming toggle is active and sortKey is "街機 Skill ↓"
- **THEN** the comparison SHALL use the arcade skill point against the kasegi average
- **WHEN** the underperforming toggle is active and sortKey is "全部"
- **THEN** the comparison SHALL use `Math.max(arcadeSkillPoint, homeSkillPoint)` against the kasegi average

#### Scenario: Row 1 uses 50% left/right layout

- **WHEN** an authenticated user views the Dashboard scores page filter bar
- **THEN** the HOT/OTHER tab group SHALL occupy the left 50% of Row 1
- **THEN** the underperforming toggle button and sort dropdown SHALL occupy the right 50% of Row 1
- **THEN** the underperforming toggle button SHALL NOT wrap to a new line (whitespace-nowrap)

##### Example: underperforming filter by source

| sortKey | Player Skill Used | Condition |
| ------- | ----------------- | --------- |
| 全部 | max(arcade, home) | max < kasegiAvgSkill |
| 家機 Skill ↓ | homeSkillPoint | home < kasegiAvgSkill |
| 街機 Skill ↓ | arcadeSkillPoint | arcade < kasegiAvgSkill |

---

### Requirement: Loading Skeleton Style on Dashboard

The Dashboard scores page loading skeleton SHALL render card-shaped placeholder items using `animate-pulse` (no inline `<style>` shimmer injection). The background and border of each skeleton card SHALL match the SongCard visual style (dark background coordinated with `#1E1530`). The shimmer highlight color SHALL be subtle rather than a bright flash in dark mode.

The skeleton list wrapper SHALL use `className="space-y-2 px-4 py-3"` so that the padding is visually identical to the `<main className="px-4 py-3">` wrapper on the 賺分曲 (PianFen) and Index pages. The `SongCardSkeleton` components SHALL NOT use inline `marginBottom` style.

The 賺分曲 page (PianFen.tsx) loading state SHALL render `SongCardSkeleton` cards (not a spinner), consistent with Dashboard and Index.

#### Scenario: Skeleton card matches SongCard background

- **WHEN** the Dashboard scores page is fetching data
- **THEN** each skeleton placeholder SHALL display with a dark background coordinated with the SongCard dark card color
- **THEN** the shimmer animation SHALL use `animate-pulse` and SHALL NOT inject inline `<style>` blocks
- **THEN** the shimmer highlight SHALL NOT appear visually brighter than the card background in dark mode

#### Scenario: Consistent padding between Dashboard and PianFen skeleton lists

- **WHEN** the Dashboard scores page renders its skeleton list
- **THEN** the skeleton list wrapper SHALL apply `px-4 py-3` padding
- **THEN** the gap and padding between skeleton cards SHALL be visually identical to the skeleton list rendered on the 賺分曲 page

#### Scenario: PianFen loading uses SongCardSkeleton instead of spinner

- **WHEN** the 賺分曲 page (PianFen.tsx) is fetching data
- **THEN** the loading state SHALL render `SongCardSkeleton` cards inside a `space-y-2 px-4 py-3` wrapper
- **THEN** no spinner (animate-spin circle) SHALL appear during the PianFen data load
