## ADDED Requirements

### Requirement: Cover Image Name Column

The `songs` table SHALL contain an `image_name` column storing the zetaraku CDN filename for the song jacket image. The cover image URL SHALL be constructed as `https://dp4p6x0xfi5o9.cloudfront.net/gitadora/img/cover/{image_name}`.

#### Scenario: image_name present

- **WHEN** a client reads a song row with a non-null `image_name`
- **THEN** the cover image URL SHALL be constructed from the zetaraku CDN base and the `image_name` value

#### Scenario: image_name absent

- **WHEN** a song row has a null `image_name`
- **THEN** the system SHALL fall back to `cover_url` if present, otherwise display a placeholder icon

### Requirement: Cursor-Based Pagination Query

The songs list query SHALL support cursor-based pagination using Supabase `.range(from, to)` with a page size of 50, ordered by `title` ascending.

#### Scenario: Page 1 query

- **WHEN** fetching page 1 of GF songs
- **THEN** the query SHALL use `.range(0, 49)` with `instrument = 'guitar'`

#### Scenario: Page 2 query

- **WHEN** fetching page 2 of GF songs
- **THEN** the query SHALL use `.range(50, 99)` with `instrument = 'guitar'`
