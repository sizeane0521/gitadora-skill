## ADDED Requirements

### Requirement: Sort Dropdown Labels in Natural Chinese

The sort dropdown on the Dashboard scores page SHALL use natural Traditional Chinese labels instead of mathematical/technical terms. The label "降冪" SHALL NOT appear in the UI.

| Sort key | Old label | New label |
|----------|-----------|-----------|
| skill_point | Skill 降冪 | Skill 由高到低 |
| achievement | 達成率降冪 | 達成率 由高到低 |
| level | 難度降冪 | 難度 由高到低 |
| kasegi | 賺分潛力 | 賺分潛力（unchanged） |
| title | 歌名 | 歌名（unchanged） |

#### Scenario: Sort dropdown shows natural Chinese labels

- **WHEN** a user opens the sort dropdown on the Dashboard scores page
- **THEN** the options SHALL display "Skill 由高到低", "達成率 由高到低", "賺分潛力", "難度 由高到低", "歌名"
- **THEN** no option SHALL contain the word "降冪"

##### Example: sort label text

- **GIVEN** the user opens the sort dropdown
- **WHEN** all options are visible
- **THEN** the five labels SHALL be exactly: "Skill 由高到低", "達成率 由高到低", "賺分潛力", "難度 由高到低", "歌名"

---

### Requirement: Remove Minimum Level Filter

The Dashboard scores page SHALL NOT display a minimum-level (等級) dropdown filter. Level-based filtering is superseded by the existing difficulty-badge filter and sort-by-level option.

#### Scenario: No level dropdown rendered

- **WHEN** an authenticated user views the Dashboard scores page
- **THEN** no minimum-level dropdown SHALL be present in the filter bar

##### Example: filter bar contents

- **GIVEN** the user is on the Dashboard scores page
- **WHEN** the filter bar Row 2 is visible
- **THEN** the filter bar SHALL contain: difficulty chips (BSC/ADV/EXT/MAS), source dropdown, quick-filter chips — but SHALL NOT contain any level/等級 dropdown
