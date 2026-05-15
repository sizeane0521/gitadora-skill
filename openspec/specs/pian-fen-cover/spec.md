## Requirements

### Requirement: Display Song Cover Image in PianFen List

Each song row in the PianFen page SHALL display a 40×40 cover image thumbnail sourced from the Zetaraku CDN. The cover image SHALL be determined by matching the song's `name` field (from gsv.fun) against the `title` field in the Zetaraku song database. When a match is found, the cover URL SHALL be constructed as `https://dp4p6x0xfi5o9.cloudfront.net/gitadora/img/cover/{imageName}`. When no match is found or the image fails to load, a 40×40 grey placeholder div SHALL be displayed in place of the cover image.

#### Scenario: Cover image displays for matched song

- **WHEN** a PianFen record's `name` matches a `title` in the Zetaraku dataset
- **THEN** the row SHALL display a 40×40 rounded cover image using the Zetaraku CDN URL

#### Scenario: Placeholder displays for unmatched song

- **WHEN** a PianFen record's `name` does not match any `title` in the Zetaraku dataset
- **THEN** the row SHALL display a 40×40 rounded grey placeholder div in place of the cover image

---
### Requirement: Fetch and Cache Zetaraku Song Data

The system SHALL fetch the Zetaraku GITADORA song database from `https://dp4p6x0xfi5o9.cloudfront.net/gitadora/data.json` at most once per browser session using TanStack Query with `staleTime: Infinity`. The fetched data SHALL be used to build a `Map<string, string>` mapping each song `title` to its `imageName`. Fetch failure SHALL result in an empty Map with no error shown to the user.

#### Scenario: Zetaraku fetch failure degrades gracefully

- **WHEN** the fetch to Zetaraku data.json fails
- **THEN** all song rows SHALL show placeholder images and no error message SHALL be displayed

---
### Requirement: Cover Image Border in Light Mode

In light mode, each song row's cover image container SHALL use the `padding: 1px` + `background: #94A3B8` (slate-400) technique to produce a visible border — identical in principle to the dark mode gradient border. The container SHALL be 40×40px (outer) and the image or placeholder SHALL be 38×38px (inner). When no cover image is available, the placeholder background SHALL be `#FFFFFF` in light mode. In dark mode, the existing gradient border behavior SHALL remain unchanged.

#### Scenario: Cover has visible border in light mode

- **WHEN** light mode is active and a cover image is found
- **THEN** the cover container SHALL be 40×40px with `padding: 1px` and `background: #94A3B8`
- **THEN** the inner cover image SHALL be 38×38px

#### Scenario: Placeholder has visible border in light mode

- **WHEN** light mode is active and no cover image match is found
- **THEN** the 40×40px container SHALL apply `padding: 1px` + `background: #94A3B8`
- **THEN** the placeholder inner div SHALL be 38×38px with `background: #FFFFFF`
- **THEN** the placeholder SHALL be visually distinguishable from the white page background
