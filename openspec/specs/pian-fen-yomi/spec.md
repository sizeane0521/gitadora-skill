## Requirements

### Requirement: Display Gojuuon Row Badge in PianFen List

Each song row in the PianFen page SHALL display a gojuuon row badge (五十音行) indicating which GITADORA arcade TITLE folder the song belongs to. The badge SHALL appear inline with the difficulty, instrument, and level metadata. For Japanese kana song names the badge text SHALL be one of: `あ行`, `か行`, `さ行`, `た行`, `な行`, `は行`, `ま行`, `や行`, `ら行`, `わ行`. For ASCII letter song names the badge SHALL display the actual uppercase first letter (e.g. `G` for GHOST, `N` for New Order). For digit or symbol song names the badge SHALL display `#`.

#### Scenario: Katakana or hiragana song name displays correct row

- **WHEN** a song name begins with a katakana or hiragana character (after skipping leading brackets)
- **THEN** the badge SHALL display the corresponding gojuuon row synchronously (no loading delay)
- **THEN** voiced and semi-voiced variants (e.g. ガ, バ, パ) SHALL map to the same row as their unvoiced base (か行, は行)

#### Scenario: ASCII letter song name displays actual first letter

- **WHEN** a song name begins with an ASCII letter (A–Z or a–z)
- **THEN** the badge SHALL display that letter in uppercase (e.g. `G` for GHOST)

#### Scenario: Digit or symbol song name displays hash

- **WHEN** a song name begins with a digit or non-letter ASCII character
- **THEN** the badge SHALL display `#`

#### Scenario: Kanji song name resolves via kuroshiro

- **WHEN** a song name begins with a kanji character
- **THEN** the system SHALL convert the song name to hiragana using kuroshiro and display the correct row badge
- **THEN** the badge SHALL appear within 2 seconds on first load and instantly on subsequent visits (result cached in memory)

---
### Requirement: Kuroshiro Lazy Initialization

The system SHALL initialize the kuroshiro analyzer only when the first kanji song name is encountered on the PianFen page. The kuroshiro instance SHALL be initialized at most once per browser session (singleton pattern). Initialization failure SHALL result in the badge defaulting to `A-Z` with no error shown to the user.

#### Scenario: Kuroshiro initializes on demand

- **WHEN** the PianFen page data loads and contains at least one kanji-starting song name
- **THEN** the system SHALL begin initializing kuroshiro in the background
- **THEN** katakana and ASCII song badges SHALL display immediately without waiting for kuroshiro

#### Scenario: Kuroshiro failure degrades silently

- **WHEN** kuroshiro initialization fails
- **THEN** kanji song names SHALL display `A-Z` as their badge
- **THEN** no error message SHALL be shown to the user
