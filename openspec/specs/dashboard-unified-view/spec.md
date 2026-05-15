## Requirements

### Requirement: Dashboard Page Header

The Dashboard scores page SHALL display a page header above the GF/DM tab bar. The header SHALL show the title "成績" in the display font with neon styling consistent with the PianFen page header. The header SHALL be part of the page scroll (not sticky).

#### Scenario: Header visible on page load

- **WHEN** an authenticated user navigates to `/dashboard/gf` or `/dashboard/dm`
- **THEN** a header with the text "成績" SHALL be visible above the GF/DM tab bar
- **THEN** the header styling SHALL use neon-pink color consistent with the GF active state

---
### Requirement: Unified Song and Score View

The Dashboard scores page (`/dashboard/gf`, `/dashboard/dm`) SHALL display a unified list combining all songs from the song catalogue with the authenticated user's personal scores. Each song SHALL be rendered as a SongCard regardless of whether the user has a score for it. Songs with no matching user score SHALL display "—" in both arcade and home score rows.

#### Scenario: Song with no score shows dash

- **WHEN** a song exists in the catalogue but the authenticated user has no score for it
- **THEN** the SongCard for that song SHALL render with both arcade and home ScoreRow displaying "—" (rate=0, skill=0)

#### Scenario: Song with arcade score only shows home as dash

- **WHEN** a user has an arcade score for a song but no home (konaste) score
- **THEN** the arcade ScoreRow SHALL show the arcade rate and skill, and the home ScoreRow SHALL display "—"

#### Scenario: Song with both scores shows both

- **WHEN** a user has both arcade and home scores for the same song
- **THEN** both ScoreRow entries SHALL show their respective rate and skill values

##### Example: merge result

| Scenario           | 街 row               | 家 row               |
|--------------------|----------------------|----------------------|
| No score           | — (hidden bar)       | — (hidden bar)       |
| Arcade only (75%)  | bar 75%, skill shown | —                    |
| Home only (90%)    | —                    | bar 90%, skill shown |
| Both               | arcade data          | home data            |

---
### Requirement: HOT / OTHER Tab Switching on Dashboard

The Dashboard scores page SHALL provide HOT and OTHER tab buttons styled identically to the PianFen page (skewed clip-path, neon-pink for HOT, neon-cyan for OTHER). HOT shows songs where `新舊分類 === "HOT"`, OTHER shows all remaining songs. Switching tabs SHALL reset the page counter to 1.

#### Scenario: HOT tab shows only current-version songs

- **WHEN** the user selects the HOT tab
- **THEN** only songs with `新舊分類 === "HOT"` SHALL be displayed

#### Scenario: OTHER tab shows non-HOT songs

- **WHEN** the user selects the OTHER tab
- **THEN** only songs with `新舊分類 !== "HOT"` SHALL be displayed

#### Scenario: Tab switch resets pagination

- **WHEN** the user switches between HOT and OTHER tabs
- **THEN** the displayed page SHALL reset to page 1

---
### Requirement: Skill Scope Selector in Dashboard Header

The Dashboard scores page header SHALL display a horizontal scope selector showing all available `SCOPE_TIERS` values (6750 through 9500). The selected scope SHALL be highlighted with neon-pink styling. The selector SHALL persist the selected value to `localStorage` under the key `"dashboard_scope"` and restore it on page load, defaulting to 7000 if no stored value exists.

#### Scenario: Scope selector visible in header

- **WHEN** an authenticated user views the Dashboard scores page
- **THEN** a row of scope tier buttons (6750, 7000, 7250 ... 9500) SHALL be visible in the header section

#### Scenario: Active scope is highlighted

- **WHEN** a scope tier button is selected
- **THEN** it SHALL be styled with `var(--neon-pink)` border and background tint
- **THEN** all other tier buttons SHALL appear in muted style

#### Scenario: Scope persists across reload

- **WHEN** the user selects scope 8000 and reloads the page
- **THEN** scope 8000 SHALL be restored and kasegi data SHALL be fetched for scope 8000

---
### Requirement: Two-Row Filter Bar

The Dashboard scores page filter bar Row 2 SHALL NOT contain BSC/ADV/EXT/MAS difficulty toggle buttons. The difficulty chips are removed to reduce filter bar complexity; the kasegi overlay provides more actionable song context.

#### Scenario: No difficulty chips in filter bar

- **WHEN** an authenticated user views the Dashboard scores page filter bar
- **THEN** the filter bar SHALL NOT contain BSC, ADV, EXT, or MAS toggle buttons

---
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

---
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

---
### Requirement: Page-based Pagination on Dashboard Score List

The Dashboard scores page SHALL display songs in pages of 25 songs each, using a page-navigation control (SongListPagination component). The "載入更多" (load more) button SHALL be removed. When the user navigates to a different page, the browser window SHALL scroll to the top of the page.

The pagination control SHALL display: first-page button, previous-page button, up to 5 consecutive page number buttons (with ellipsis when there are more pages), next-page button, and last-page button. The current page number SHALL be visually highlighted. The pagination control SHALL NOT render when there is only 1 page.

Navigating between HOT/OTHER tabs, changing the sort selector, or toggling the underperforming filter SHALL reset the current page to 1.

#### Scenario: First page shows items 1–25

- **WHEN** the Dashboard scores page loads with more than 25 songs matching the current filter
- **THEN** only the first 25 songs SHALL be displayed
- **THEN** the pagination control SHALL be visible below the song list

#### Scenario: Navigating to page 2 shows items 26–50

- **WHEN** the user clicks the next-page button or page 2 button
- **THEN** songs 26–50 SHALL be displayed
- **THEN** the browser window SHALL scroll to the top of the page

#### Scenario: Filter change resets to page 1

- **WHEN** the user switches between HOT and OTHER tabs while on page 3
- **THEN** the displayed page SHALL reset to page 1 and songs 1–25 SHALL be shown

#### Scenario: Single page hides pagination control

- **WHEN** the total number of filtered songs is 25 or fewer
- **THEN** the pagination control SHALL NOT be rendered

##### Example: page calculation

| Total songs | PAGE_SIZE | Total pages | Page 1 items | Page 2 items |
|-------------|-----------|-------------|--------------|--------------|
| 60 | 25 | 3 | 1–25 | 26–50 |
| 25 | 25 | 1 | 1–25 | (no page 2) |
| 26 | 25 | 2 | 1–25 | 26–26 |

---
### Requirement: Scroll-to-Top Button

The Dashboard scores page SHALL display a floating "scroll to top" button that appears when the user has scrolled more than 300px from the top of the window. Clicking the button SHALL scroll the browser window smoothly to the top. The button SHALL be positioned at the bottom-right of the viewport, above the BottomNav bar, and SHALL animate in/out with a 150ms opacity+translate transition.

#### Scenario: Button appears after scrolling past threshold

- **WHEN** the user scrolls down more than 300px on the Dashboard scores page
- **THEN** the scroll-to-top button SHALL become visible

#### Scenario: Button scrolls to top when clicked

- **WHEN** the user clicks the scroll-to-top button
- **THEN** `window.scrollTo({ top: 0, behavior: "smooth" })` SHALL be invoked
- **THEN** the button SHALL disappear once the scroll position returns below 300px
