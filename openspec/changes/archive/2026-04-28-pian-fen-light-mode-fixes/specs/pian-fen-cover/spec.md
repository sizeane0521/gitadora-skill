## ADDED Requirements

### Requirement: Cover Image Border in Light Mode

In light mode, each song row's cover image container SHALL display a visible border of `1px solid #E2E8F0` (slate-200). The cover container SHALL maintain a fixed size of 38×38px (inner image) with `border-radius: 2px`. When no cover image is available, the placeholder div SHALL receive the same border styling. In dark mode, the existing gradient border behavior SHALL remain unchanged.

#### Scenario: Cover has border in light mode

- **WHEN** light mode is active and a cover image is found
- **THEN** the cover container SHALL display a `1px solid #E2E8F0` border around the 38×38px image
- **THEN** the cover image SHALL have `border-radius: 2px`

#### Scenario: Placeholder has border in light mode

- **WHEN** light mode is active and no cover image match is found
- **THEN** the placeholder div SHALL display the same `1px solid #E2E8F0` border
- **THEN** the placeholder SHALL be visually distinguishable from the white page background
