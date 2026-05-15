## ADDED Requirements

### Requirement: PianFen List Sort Order

After filtering by allowed parts (`G`, `B` for GF; `D` for DM), both the `hot` and `other` arrays SHALL be sorted by `averageSkill` in descending order before being returned to the component. The sort SHALL be stable with respect to equal `averageSkill` values (preserve original API order among ties).

#### Scenario: HOT list is sorted by skill descending

- **WHEN** the API returns a `hot` array containing mixed Guitar and Bass entries at various `averageSkill` values
- **THEN** after part filtering and sorting, the first entry SHALL have the highest `averageSkill`
- **THEN** each subsequent entry SHALL have `averageSkill` ≤ the previous entry

#### Scenario: OTHER list is sorted independently

- **WHEN** the API returns an `other` array
- **THEN** the `other` array SHALL be sorted by `averageSkill` descending independently of `hot`
- **THEN** rank numbers displayed (01, 02, 03…) SHALL correspond to sorted position within each section
