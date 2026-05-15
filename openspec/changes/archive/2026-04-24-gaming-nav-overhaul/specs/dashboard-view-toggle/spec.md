## ADDED Requirements

### Requirement: Dashboard View Toggle

The Dashboard page SHALL display a view toggle at the top of the page with two options: 目前成績 (current scores) and 全部歌曲 (all songs). The default active view SHALL be 目前成績.

#### Scenario: Default view is scores

- **WHEN** an authenticated user navigates to `/dashboard` or `/dashboard/:tab`
- **THEN** the 目前成績 toggle option SHALL be active and the GF/DM/對照 tab content SHALL be visible

#### Scenario: Switching to all songs view

- **WHEN** the user taps 全部歌曲
- **THEN** the GF/DM/對照 tabs SHALL be hidden and the song browse list SHALL appear in their place

#### Scenario: Switching back to scores view

- **WHEN** the user taps 目前成績 while in 全部歌曲 view
- **THEN** the GF/DM/對照 tabs SHALL reappear and the song list SHALL be hidden

#### Scenario: Toggle state does not persist across navigation

- **WHEN** the user navigates away from Dashboard and returns
- **THEN** the view SHALL default to 目前成績 regardless of the previous view

### Requirement: Song Browse Inside Dashboard

When 全部歌曲 is active, the Dashboard page SHALL render the song browse list including search input and infinite scroll. The song browse content SHALL be implemented via a shared SongsBrowseView component reused by both Dashboard and the standalone Songs page.

#### Scenario: Song search works inside dashboard

- **WHEN** the user is in 全部歌曲 view and types in the search input
- **THEN** the song list SHALL filter by the search query

#### Scenario: Tapping a song navigates to song detail

- **WHEN** the user taps a song row in 全部歌曲 view
- **THEN** the app SHALL navigate to `/songs/:id`
