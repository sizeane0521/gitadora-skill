## ADDED Requirements

### Requirement: Kasegi Records Database Table

The system SHALL maintain a `kasegi_records` table in Supabase that stores pre-synced skill-farming song data. The table SHALL enforce a unique constraint on `(scope, game_type, category, song_title, diff, part)` to allow upsert operations. The table SHALL be publicly readable via RLS and writable only via service role.

#### Scenario: Kasegi records table stores all required fields

- **WHEN** a sync operation upserts a record for scope 7000, game_type GF, category HOT, song "GHOST", diff "MAS", part "G"
- **THEN** the record SHALL contain `diff_value`, `average_skill`, `player_percent`, `player_count`, `average_player_skill`, and `synced_at`

---

### Requirement: Admin Kasegi Sync Script

The system SHALL provide a `scripts/sync-kasegi.ts` Node.js script that fetches all 24 combinations of 12 scope tiers × 2 game types (GF/DM) from the gsv.fun `kasegiNew` GraphQL API and upserts them into the `kasegi_records` table. The script SHALL read `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from environment variables. A `sync:kasegi` npm script SHALL be registered in `package.json`.

#### Scenario: Sync script populates kasegi_records

- **WHEN** the admin runs `npm run sync:kasegi`
- **THEN** the script SHALL fetch HOT and OTHER records for all 12 scope tiers × GF and DM
- **THEN** all fetched records SHALL be upserted into `kasegi_records` with correct field mapping
- **THEN** the script SHALL print the total number of records upserted and the sync completion time

#### Scenario: Sync script handles gsv.fun errors gracefully

- **WHEN** a specific scope × game_type combination returns an error from gsv.fun
- **THEN** the script SHALL log the error and continue processing remaining combinations
- **THEN** the script SHALL report how many combinations succeeded and how many failed

---

### Requirement: Import Page Sync Date Display

The Import page SHALL display the date of the most recent kasegi sync (from `MAX(synced_at)` in `kasegi_records`) formatted as `YYYY/MM/DD`. This display SHALL be visible to all authenticated users. If no sync has occurred, the Import page SHALL display "賺分曲：尚未同步".

#### Scenario: Sync date is visible to players

- **WHEN** an authenticated user visits the Import page and kasegi_records contains records
- **THEN** the page SHALL show "賺分曲資料：YYYY/MM/DD" where the date is the most recent synced_at value

#### Scenario: No sync shows placeholder text

- **WHEN** kasegi_records is empty
- **THEN** the Import page SHALL show "賺分曲：尚未同步"

---

### Requirement: Admin Sync UI on Import Page

The Import page SHALL display an admin-only section when `user.email` equals the `VITE_ADMIN_EMAIL` environment variable. This section SHALL contain two informational buttons: one for Zetaraku song sync and one for kasegi sync. In Phase 1, buttons SHALL display the corresponding terminal command (`npm run sync:songs` and `npm run sync:kasegi`) as instructional text rather than triggering server-side sync.

#### Scenario: Admin sees sync buttons

- **WHEN** the logged-in user's email matches VITE_ADMIN_EMAIL
- **THEN** the Import page SHALL display an admin section with "同步 Zetaraku 歌曲" and "同步賺分曲" entries showing their respective npm commands

#### Scenario: Non-admin users do not see admin section

- **WHEN** the logged-in user's email does NOT match VITE_ADMIN_EMAIL
- **THEN** no admin sync section SHALL be visible on the Import page

##### Example: admin detection

- **GIVEN** VITE_ADMIN_EMAIL is "sizeane0521@gmail.com"
- **WHEN** user with email "sizeane0521@gmail.com" views Import page
- **THEN** admin section IS shown
- **WHEN** user with email "other@example.com" views Import page
- **THEN** admin section IS NOT shown
