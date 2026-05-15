## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Two-Row Filter Bar

The Dashboard scores page filter bar Row 2 SHALL NOT contain BSC/ADV/EXT/MAS difficulty toggle buttons. The difficulty chips are removed to reduce filter bar complexity; the kasegi overlay provides more actionable song context.

#### Scenario: No difficulty chips in filter bar

- **WHEN** an authenticated user views the Dashboard scores page filter bar
- **THEN** the filter bar SHALL NOT contain BSC, ADV, EXT, or MAS toggle buttons
