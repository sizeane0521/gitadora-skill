## Requirements

### Requirement: Song Browse Inside Dashboard

When 全部歌曲 is active, the Dashboard page SHALL render the song browse list including search input and infinite scroll. The song browse content SHALL be implemented via a shared SongsBrowseView component reused by both Dashboard and the standalone Songs page.

#### Scenario: Song search works inside dashboard

- **WHEN** the user is in 全部歌曲 view and types in the search input
- **THEN** the song list SHALL filter by the search query

#### Scenario: Tapping a song navigates to song detail

- **WHEN** the user taps a song row in 全部歌曲 view
- **THEN** the app SHALL navigate to `/songs/:id`
