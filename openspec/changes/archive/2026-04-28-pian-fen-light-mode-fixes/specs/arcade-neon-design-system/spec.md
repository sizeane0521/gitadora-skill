## ADDED Requirements

### Requirement: Instrument Mode DOM Attribute Sync

When the user navigates to a page that has an instrument context (GF or DM), the application SHALL set `document.documentElement.dataset.instrument` to the lowercase instrument identifier (`"gf"` or `"dm"`). This enables CSS selectors of the form `[data-instrument="dm"]` to activate the correct brand color scale. When the user leaves the instrument-specific page, the attribute SHALL be removed from `document.documentElement`.

#### Scenario: DM instrument activates cyan brand scale in light mode

- **WHEN** the user navigates to `/pian-fen/dm`
- **THEN** `document.documentElement.dataset.instrument` SHALL equal `"dm"`
- **THEN** CSS `[data-instrument="dm"]` selectors SHALL match
- **THEN** `--color-brand` SHALL resolve to `--dm-500: #00F0FF`
- **THEN** the DM tab active indicator SHALL display in cyan, not pink

#### Scenario: Attribute is cleaned up on navigation away

- **WHEN** the user navigates away from `/pian-fen/:instrument`
- **THEN** `document.documentElement.dataset.instrument` SHALL be removed or reset

### Requirement: Light Mode Skill Score Color Contrast

In light mode, the skill score value displayed on each PianFen row SHALL use a color with a contrast ratio of at least 4.5:1 against a white background. The color SHALL be derived from the active instrument's brand scale: GF mode uses `--gf-600: #CC1671` (contrast 5.1:1), DM mode uses `--dm-600: #00C0CC` (contrast 4.7:1).

#### Scenario: GF skill score passes contrast in light mode

- **WHEN** light mode is active AND instrument is GF
- **THEN** the skill score text color SHALL be `#CC1671`
- **THEN** the contrast ratio against white (`#FFFFFF`) SHALL be ≥ 4.5:1

#### Scenario: DM skill score passes contrast in light mode

- **WHEN** light mode is active AND instrument is DM
- **THEN** the skill score text color SHALL be `#00C0CC`
- **THEN** the contrast ratio against white (`#FFFFFF`) SHALL be ≥ 4.5:1
