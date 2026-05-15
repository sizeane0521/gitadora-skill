## ADDED Requirements

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

### Requirement: Two-Row Filter Bar

The filter bar on the Dashboard scores page SHALL be reorganised into two rows. Row 1 SHALL contain HOT/OTHER tab buttons on the left and a sort dropdown on the right, and SHALL be sticky below the GF/DM tab bar. Row 2 SHALL contain difficulty toggle buttons (BSC/ADV/EXT/MAS), a source dropdown (全部來源/家用/街機), and a minimum-level dropdown. A reset button SHALL appear in Row 2 whenever any filter is active.

#### Scenario: Row 1 is sticky

- **WHEN** the user scrolls down through the song list
- **THEN** Row 1 (HOT/OTHER tabs and sort dropdown) SHALL remain visible at the top of the viewport below the GF/DM tab bar

#### Scenario: Reset clears all filters

- **WHEN** the user taps the reset button
- **THEN** difficulty selection, source, and minimum-level SHALL all return to their default values
