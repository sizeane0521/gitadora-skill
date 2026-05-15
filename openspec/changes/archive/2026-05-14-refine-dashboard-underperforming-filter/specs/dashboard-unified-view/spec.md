## MODIFIED Requirements

### Requirement: Quick-filter Chips for Score Status

The Dashboard scores page SHALL provide two quick-filter chips — "全部" and "未達標" — displayed at the start of the filter bar Row 2. The "可加分" chip SHALL be removed. The active chip SHALL be visually highlighted. Switching chips SHALL reset pagination to page 1.

The "未達標" chip SHALL filter songs where the player's best skill is below the kasegi average skill for that song. The kasegi average skill SHALL be looked up from the `kasegiMap` using key `"${songTitle}|${diff}|${part}"`. If no kasegi record exists for a song, that song SHALL NOT be included in the "未達標" results.

When the "未達標" chip is active, the displayed list SHALL be sorted by the gap `(kasegiAvgSkill − playerBestSkill)` in descending order (largest gap first), regardless of the current sort selector value.

| Chip label | Filter condition | Sort override |
|------------|-----------------|---------------|
| 全部 | None (default) | Follows sort selector |
| 未達標 | playerBestSkill < kasegiAvgSkill AND kasegi record exists | Gap descending (kasegiAvgSkill − playerBestSkill) |

Where `playerBestSkill = Math.max(arcadeSkillPoint, homeSkillPoint)`.

#### Scenario: 未達標 uses kasegi average skill, not achievement rate threshold

- **WHEN** the user selects the "未達標" chip
- **THEN** only songs where a kasegi record exists AND `Math.max(arcadeSkill, homeSkill) < kasegiMap.get(key)` SHALL be displayed
- **THEN** songs with no kasegi record SHALL NOT appear in the results

#### Scenario: 未達標 list is sorted by gap descending

- **WHEN** the user selects the "未達標" chip
- **THEN** the displayed songs SHALL be ordered so that the song with the largest `(kasegiAvgSkill − playerBestSkill)` appears first
- **THEN** the sort selector value SHALL be ignored while "未達標" is active

#### Scenario: 全部 chip shows all songs

- **WHEN** the user selects the "全部" chip
- **THEN** no skill filter SHALL be applied, and the sort selector controls the order

#### Scenario: Chip switch resets pagination

- **WHEN** the user switches between quick-filter chips
- **THEN** the displayed page SHALL reset to page 1

##### Example: 未達標 filtering and sort order

- **GIVEN** three songs:
  - Song A: playerBestSkill=130, kasegiAvgSkill=150 → gap=20
  - Song B: playerBestSkill=140, kasegiAvgSkill=145 → gap=5
  - Song C: playerBestSkill=160, kasegiAvgSkill=155 → no match (playerSkill > avg)
- **WHEN** the user selects "未達標"
- **THEN** Song C SHALL NOT appear (playerSkill exceeds kasegi average)
- **THEN** the order SHALL be: Song A (gap=20), Song B (gap=5)
