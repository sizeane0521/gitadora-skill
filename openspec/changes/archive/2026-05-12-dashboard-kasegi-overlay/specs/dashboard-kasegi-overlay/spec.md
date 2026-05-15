## ADDED Requirements

### Requirement: Kasegi Overlay on Dashboard Score Cards

The Dashboard scores page SHALL display a skill-tier scope selector and SHALL fetch community kasegi (skill-farming) song data for the selected scope. Each SongCard SHALL display a "賺" badge and the community average skill when the song appears in the kasegi list for the selected scope tier.

#### Scenario: Scope selector defaults to 7000 on first visit

- **WHEN** an authenticated user navigates to the Dashboard scores page for the first time
- **THEN** the scope selector SHALL default to 7000
- **THEN** kasegi data SHALL be fetched for scope 7000

#### Scenario: Scope selector persists across page reloads

- **WHEN** the user selects a scope tier (e.g., 8000) and reloads the page
- **THEN** the scope selector SHALL restore to 8000 from localStorage

#### Scenario: Song matching kasegi list shows badge

- **WHEN** a song in the player's score list matches a song in the kasegi list for the selected scope (matched by song name AND difficulty)
- **THEN** the SongCard SHALL display a "賺" badge and the community average skill (e.g., "avg 145.2")

#### Scenario: Song not in kasegi list shows no badge

- **WHEN** a song in the player's score list does NOT appear in the kasegi list for the selected scope
- **THEN** the SongCard SHALL render without any kasegi badge

#### Scenario: Changing scope updates badges

- **WHEN** the user selects a different scope tier
- **THEN** the kasegi badge visibility SHALL update to reflect the new scope's kasegi list

##### Example: kasegi badge matching

- **GIVEN** scope is 7000, GF HOT kasegi list includes `{ name: "GHOST", diff: "MAS", averageSkill: 145.2 }`
- **WHEN** the score list contains a song with `歌曲名稱 = "GHOST"` and `譜面等級 = "MAS"`
- **THEN** that SongCard SHALL show badge "賺" and text "avg 145.2"
- **GIVEN** the score list also contains `{ 歌曲名稱: "乱腴の舞姬", 譜面等級: "EXT" }` which is NOT in the kasegi list
- **THEN** that SongCard SHALL show no badge
