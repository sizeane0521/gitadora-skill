## MODIFIED Requirements

### Requirement: Arcade Score DOM Scraping

During gsv.fun score import, the system SHALL also update the `songs` table `level_*` columns using the `diff_value` from each score record. For each record with `diff_value > 0`, the system SHALL write the value into `level_bsc`, `level_adv`, `level_ext`, or `level_mas` (determined by the record's `diff` field) for the corresponding song row. This update SHALL be batched by song_id using `Promise.all` after the category update step.

#### Scenario: Import writes diff_value to level columns

- **WHEN** a gsv.fun import record has `name = "GHOST"`, `diff = "MAS"`, `diff_value = 9.2`
- **THEN** after import the corresponding song row SHALL have `level_mas = 9.2`

#### Scenario: Import does not overwrite when diff_value is zero

- **WHEN** a record has `diff_value = 0` or `diff_value` is absent
- **THEN** the system SHALL NOT update the `level_*` column for that song

##### Example: level column mapping

| diff  | target column |
|-------|---------------|
| BSC   | level_bsc     |
| ADV   | level_adv     |
| EXT   | level_ext     |
| MAS   | level_mas     |
