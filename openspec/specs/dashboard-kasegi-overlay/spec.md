## Requirements

### Requirement: Kasegi Overlay on Dashboard Score Cards

Each SongCard on the Dashboard scores page SHALL display an inline underperforming badge and gap value when the player's best skill is below the kasegi average skill for the selected scope. The badge SHALL appear in the instrument row alongside the target value, replacing the former bottom progress bar.

The kasegi information SHALL be shown as two grouped elements on the right side of the instrument row:
1. When the player is underperforming (`playerBestSkill < kasegiAvgSkill`): an "未達標" badge with the gap value `－{gap}` where `gap = kasegiAvgSkill − playerBestSkill`, followed by "目標 {kasegiAvgSkill}"
2. When the player has met or exceeded the target (`playerBestSkill >= kasegiAvgSkill`): only "目標 {kasegiAvgSkill}" is shown, without the badge
3. When no kasegi data exists for the song: neither badge nor target is shown

Where `playerBestSkill = Math.max(arcadeSkillPoint, homeSkillPoint)`.

#### Scenario: Underperforming badge shows gap to target

- **WHEN** a SongCard is rendered with `kasegiOverlay.averageSkill = 160.2` and player best skill is 155.6
- **THEN** the instrument row SHALL display `[未達標] ―4.6  目標 160.2`
- **THEN** no progress bar SHALL appear anywhere on the card

#### Scenario: Target only when player has reached kasegi average

- **WHEN** a SongCard is rendered with `kasegiOverlay.averageSkill = 150.0` and player best skill is 152.3
- **THEN** only `目標 150.0` SHALL appear, without the "未達標" badge

#### Scenario: No display when no kasegi data

- **WHEN** SongCard is rendered with `kasegiOverlay = null`
- **THEN** neither "未達標" badge nor "目標" label SHALL appear in the instrument row

##### Example: badge display conditions

| kasegiAvg | playerBestSkill | Display |
|-----------|----------------|---------|
| 160.2 | 155.6 | [未達標] ―4.6  目標 160.2 |
| 150.0 | 152.3 | 目標 150.0 |
| null | any | (nothing) |
