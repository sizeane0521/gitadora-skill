## MODIFIED Requirements

### Requirement: Admin Kasegi Sync Script

The system SHALL provide a `scripts/sync-kasegi.ts` Node.js script that fetches all 24 combinations of 12 scope tiers × 2 game types (GF/DM) from the gsv.fun `kasegiNew` GraphQL API and upserts them into the `kasegi_records` table. After completing the upsert, the script SHALL also update the `songs` table `level_*` columns (`level_bsc`, `level_adv`, `level_ext`, `level_mas`) using the `diff_value` from the synced records. The update SHALL use the song `title` and `instrument` to identify the target row in the `songs` table, and only write values where `diff_value > 0`. If multiple kasegi records reference the same song row and difficulty, any consistent non-zero value SHALL be used.

#### Scenario: Sync script populates kasegi_records

- **WHEN** the admin runs `npm run sync:kasegi`
- **THEN** the script SHALL fetch HOT and OTHER records for all 12 scope tiers × GF and DM
- **THEN** all fetched records SHALL be upserted into `kasegi_records` with correct field mapping
- **THEN** the script SHALL print the total number of records upserted and the sync completion time

#### Scenario: Sync script updates songs.level_* after kasegi upsert

- **WHEN** the admin runs `npm run sync:kasegi` and `kasegi_records` contains a record with `song_title = "GHOST"`, `diff = "MAS"`, `part = "G"`, `diff_value = 9.2`
- **THEN** the corresponding `songs` row for GHOST guitar SHALL have `level_mas = 9.2` after the sync completes
- **THEN** no `songs` row SHALL have its `level_*` column set to 0 or null as a result of the sync

#### Scenario: Sync script does not overwrite with zero

- **WHEN** a kasegi record has `diff_value = 0` or `diff_value` is null
- **THEN** the sync script SHALL NOT update the corresponding `songs.level_*` column

#### Scenario: Sync script handles gsv.fun errors gracefully

- **WHEN** a specific scope × game_type combination returns an error from gsv.fun
- **THEN** the script SHALL log the error and continue processing remaining combinations

##### Example: diff to level_* column mapping

| diff | target column |
|------|---------------|
| BSC  | level_bsc     |
| ADV  | level_adv     |
| EXT  | level_ext     |
| MAS  | level_mas     |

##### Example: instrument to songs row mapping

| part | songs.instrument |
|------|-----------------|
| G    | guitar          |
| B    | bass            |
| D    | drums           |
