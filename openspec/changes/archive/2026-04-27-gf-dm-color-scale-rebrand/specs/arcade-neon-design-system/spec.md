## ADDED Requirements

### Requirement: GF Brand Color Scale

The GF instrument mode SHALL define a complete 11-step color scale (`--gf-50` through `--gf-950`) with `#FF1B8D` (neon pink) as the canonical 500 value. The scale SHALL be computed by interpolating linearly toward white for steps 50–400 and toward black for steps 600–950. The exact values SHALL be:

- `--gf-50: #FFE8F4`
- `--gf-100: #FFD1E8`
- `--gf-200: #FFAFD7`
- `--gf-300: #FF82C0`
- `--gf-400: #FF54AA`
- `--gf-500: #FF1B8D`
- `--gf-600: #CC1671`
- `--gf-700: #991055`
- `--gf-800: #660B38`
- `--gf-900: #33051C`
- `--gf-950: #1A030E`

`--neon-pink` SHALL remain `#FF1B8D`, matching `--gf-500` as the physical reference.

#### Scenario: GF brand tokens reflect neon pink scale

- **WHEN** the instrument is `gf` (or default `:root`)
- **THEN** `--gf-500` SHALL resolve to `#FF1B8D`
- **THEN** `--color-brand` SHALL resolve to `#FF1B8D`
- **THEN** `--gf-700` SHALL resolve to `#991055` (dark accent variant)
- **THEN** `--gf-950` SHALL resolve to `#1A030E`

### Requirement: DM Brand Color Scale

The DM instrument mode SHALL define a complete 11-step color scale (`--dm-50` through `--dm-950`) with `#00F0FF` (neon cyan) as the canonical 500 value. The exact values SHALL be:

- `--dm-50: #E6FEFF`
- `--dm-100: #CCFCFF`
- `--dm-200: #A6FAFF`
- `--dm-300: #73F7FF`
- `--dm-400: #40F4FF`
- `--dm-500: #00F0FF`
- `--dm-600: #00C0CC`
- `--dm-700: #009099`
- `--dm-800: #006066`
- `--dm-900: #003033`
- `--dm-950: #00181A`

`--neon-cyan` SHALL remain `#00F0FF`, matching `--dm-500` as the physical reference.

#### Scenario: DM brand tokens reflect neon cyan scale

- **WHEN** the instrument is `dm`
- **THEN** `--dm-500` SHALL resolve to `#00F0FF`
- **THEN** `--color-brand` SHALL resolve to `#00F0FF`
- **THEN** `--dm-700` SHALL resolve to `#009099` (dark accent variant)
- **THEN** `--dm-950` SHALL resolve to `#00181A`

### Requirement: PianFen Rank Accent Line Uses 700 Variant

In dark mode, the left-edge accent line of each `RecordRow` in the PianFen page SHALL use the 700 variant of the brand scale rather than the full-saturation 500. Odd-ranked rows SHALL use `--gf-700` (`#991055`), even-ranked rows SHALL use `--dm-700` (`#009099`).

#### Scenario: Accent line is visually subdued in dark mode

- **WHEN** dark mode is active and the PianFen page renders song rows
- **THEN** odd-rank rows (1, 3, 5…) SHALL display a left border of `#991055`
- **THEN** even-rank rows (2, 4, 6…) SHALL display a left border of `#009099`
- **THEN** neither color SHALL be the full-saturation neon value (`#FF1B8D` / `#00F0FF`)
