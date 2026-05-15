## ADDED Requirements

### Requirement: Songs Table Schema Definition

The `songs` table SHALL contain the following columns as the authoritative source of song master data for GF/DM:

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | bigint (identity) | NOT NULL | Auto-generated primary key |
| `konami_song_id` | text | NOT NULL | Unique song identifier from Konami website (e.g., `xxxxxx`) |
| `title` | text | NOT NULL | Song display title |
| `artist` | text | NOT NULL | Artist name (defaults to empty string) |
| `cover_url` | text | YES | URL to jacket/cover image |
| `game_type` | enum(GF,DM) | NOT NULL | Which game the entry belongs to |
| `level_bsc` | numeric(4,2) | YES | Basic difficulty level |
| `level_adv` | numeric(4,2) | YES | Advanced difficulty level |
| `level_ext` | numeric(4,2) | YES | Extreme difficulty level |
| `level_mas` | numeric(4,2) | YES | Master difficulty level |
| `version` | text | YES | Game version the song was added in |
| `instrument` | text CHECK IN ('guitar','bass','drums') | YES | Instrument type; guitar/bass for GF, drums for DM |
| `reading` | text | YES | Furigana/reading of the song title (Japanese pronunciation) |
| `category` | text CHECK IN ('HOT','Other') | YES | Song category; HOT indicates currently featured songs |
| `tags` | text | YES | Free-form comma-separated tags for classification |

#### Scenario: songs table has correct columns

- **WHEN** a developer inspects the `songs` table schema in Supabase
- **THEN** all fourteen columns above SHALL be present with their defined types and constraints

---

### Requirement: Song Record Uniqueness

Each `(konami_song_id)` pair SHALL be unique across the songs table. The same song title MAY appear twice if it exists in both GF and DM (as separate rows with different `game_type`).

#### Scenario: Duplicate konami_song_id is rejected

- **WHEN** an insert attempts to use a `konami_song_id` that already exists
- **THEN** the database SHALL raise a unique constraint violation

#### Scenario: Same title in GF and DM is allowed

- **WHEN** a GF row and a DM row share the same `title` but have different `konami_song_id`
- **THEN** both rows SHALL coexist in the table

---

### Requirement: CSV Import Format

The CSV batch import file SHALL use the following format to populate the songs table.

The file MUST be UTF-8 encoded. The first row MUST be a header row using the exact column names below.

Required columns (MUST be present and non-empty):
`konami_song_id`, `title`, `game_type`

Optional columns (empty values are written as NULL):
`artist`, `cover_url`, `level_bsc`, `level_adv`, `level_ext`, `level_mas`, `version`, `instrument`, `reading`, `category`, `tags`

#### Scenario: Valid CSV row is accepted

- **WHEN** a CSV row has all required fields and valid enum values for `game_type`, `instrument`, and `category`
- **THEN** the import script SHALL upsert the row into the songs table

##### Example: minimal valid row

| konami_song_id | title | game_type | level_ext |
|---|---|---|---|
| `abc123` | Reason | GF | 8.50 |

##### Example: invalid game_type is rejected

| konami_song_id | title | game_type |
|---|---|---|
| `abc123` | Reason | GUITAR |

- **THEN** the row SHALL be skipped and an error reported

#### Scenario: Missing required column halts import

- **WHEN** the CSV header row is missing `konami_song_id`, `title`, or `game_type`
- **THEN** the script SHALL exit with an error before processing any rows

#### Scenario: Empty optional field becomes NULL

- **WHEN** an optional column cell is empty
- **THEN** the database column SHALL be set to NULL (not an empty string)

---

### Requirement: CSV Import Upsert Behavior

The import script SHALL upsert records using `konami_song_id` as the conflict key. On conflict, all columns SHALL be updated with CSV values (overwrite).

#### Scenario: Existing song is updated

- **WHEN** a CSV row has a `konami_song_id` that already exists in the songs table
- **THEN** all provided columns SHALL be updated to the CSV values

#### Scenario: New song is inserted

- **WHEN** a CSV row has a `konami_song_id` that does not exist in the songs table
- **THEN** a new row SHALL be inserted

#### Scenario: Script is idempotent

- **WHEN** the same CSV file is imported twice
- **THEN** the songs table state SHALL be identical after both runs

---

### Requirement: CSV Import Error Reporting

The import script SHALL validate each row before upserting and report errors without halting the entire import.

#### Scenario: Invalid row is skipped with error report

- **WHEN** a row fails validation (e.g., invalid enum value, missing required field)
- **THEN** the script SHALL log the row number and reason, skip that row, and continue processing remaining rows

#### Scenario: Import summary is displayed

- **WHEN** the import completes
- **THEN** the script SHALL print a summary: "Import complete: N inserted, M updated, K skipped"
