## Requirements

### Requirement: Public Song Browse List

The `/songs` page SHALL display all songs from the `songs` table without requiring the user to have imported scores. The page SHALL be accessible to any authenticated user.

#### Scenario: Songs load on page visit with no scores

- **WHEN** an authenticated user with no imported scores visits `/songs`
- **THEN** the system SHALL display a list of songs with cover images, title, and version

---
### Requirement: Infinite Scroll Pagination

The songs list SHALL load 50 songs per page. When the user scrolls to the bottom sentinel element, the system SHALL automatically fetch and append the next 50 songs.

#### Scenario: Initial load

- **WHEN** the user opens `/songs`
- **THEN** the system SHALL fetch the first 50 songs ordered by title ascending and render them

#### Scenario: Load more on scroll

- **WHEN** the sentinel element at the bottom of the list enters the viewport
- **THEN** the system SHALL call `fetchNextPage()` and append the results to the existing list

#### Scenario: End of list

- **WHEN** the last page returns fewer than 50 songs
- **THEN** the system SHALL NOT attempt to fetch another page and SHALL show no loading indicator

---
### Requirement: Server-Side Search with Pagination Reset

The search input SHALL filter songs via a server-side `ilike` query. Changing the search term SHALL reset the list to page 1.

#### Scenario: Search resets page

- **WHEN** the user types a new search term
- **THEN** the system SHALL reset to page 1 and display matching results from the beginning

#### Scenario: Empty search result

- **WHEN** the search term matches no songs
- **THEN** the system SHALL display a "找不到歌曲" message

---
### Requirement: Instrument-Filtered Query

When fetching songs for the list, the system SHALL filter by instrument to ensure exactly one row per song title:
- GF mode: `instrument = 'guitar'`
- DM mode: `instrument = 'drums'`

#### Scenario: GF mode shows one row per title

- **WHEN** the user is in GF mode
- **THEN** each song title SHALL appear exactly once in the list

#### Scenario: DM mode shows drum songs only

- **WHEN** the user is in DM mode
- **THEN** only songs with `instrument = 'drums'` SHALL appear in the list

---
### Requirement: Scroll-to-Top Button

The page SHALL display a floating scroll-to-top button when the user has scrolled more than 300px from the top.

#### Scenario: Button appears on scroll

- **WHEN** the user scrolls more than 300px down the songs list
- **THEN** a floating button SHALL appear in the bottom-right area of the viewport

#### Scenario: Button scrolls to top

- **WHEN** the user taps the scroll-to-top button
- **THEN** the page SHALL scroll smoothly back to the top and the button SHALL hide
