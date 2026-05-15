## ADDED Requirements

### Requirement: Display Song Cover Image in PianFen List

Each song row in the PianFen page SHALL display a 40×40 cover image thumbnail sourced from the Zetaraku CDN. The cover image SHALL be determined by matching the song's `name` field (from gsv.fun) against the `title` field in the Zetaraku song database. When a match is found, the cover URL SHALL be constructed as `https://dp4p6x0xfi5o9.cloudfront.net/gitadora/img/cover/{imageName}`. When no match is found or the image fails to load, a 40×40 grey placeholder div SHALL be displayed in place of the cover image.

#### Scenario: Cover image displays for matched song

- **WHEN** a PianFen record's `name` matches a `title` in the Zetaraku dataset
- **THEN** the row SHALL display a 40×40 rounded cover image using the Zetaraku CDN URL

#### Scenario: Placeholder displays for unmatched song

- **WHEN** a PianFen record's `name` does not match any `title` in the Zetaraku dataset
- **THEN** the row SHALL display a 40×40 rounded grey placeholder div in place of the cover image

### Requirement: Fetch and Cache Zetaraku Song Data

The system SHALL fetch the Zetaraku GITADORA song database from `https://dp4p6x0xfi5o9.cloudfront.net/gitadora/data.json` at most once per browser session using TanStack Query with `staleTime: Infinity`. The fetched data SHALL be used to build a `Map<string, string>` mapping each song `title` to its `imageName`. Fetch failure SHALL result in an empty Map with no error shown to the user.

#### Scenario: Zetaraku fetch failure degrades gracefully

- **WHEN** the fetch to Zetaraku data.json fails
- **THEN** all song rows SHALL show placeholder images and no error message SHALL be displayed
