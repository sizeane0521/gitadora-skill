## ADDED Requirements

### Requirement: Dashboard Page Header

The Dashboard scores page SHALL display a page header above the GF/DM tab bar. The header SHALL show the title "成績" in the display font with neon styling consistent with the PianFen page header. The header SHALL be part of the page scroll (not sticky).

#### Scenario: Header visible on page load

- **WHEN** an authenticated user navigates to `/dashboard/gf` or `/dashboard/dm`
- **THEN** a header with the text "成績" SHALL be visible above the GF/DM tab bar
- **THEN** the header styling SHALL use neon-pink color consistent with the GF active state
