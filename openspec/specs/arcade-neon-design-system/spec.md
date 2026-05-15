## Requirements

### Requirement: Neon Color Token System

The design system SHALL define a physical neon color token layer in `src/index.css` under `:root` with the following tokens and values: `--neon-cyan: #00F0FF`, `--neon-pink: #FF1B8D`, `--neon-lime: #C6FF1A`, `--neon-purple: #B026FF`, `--neon-amber: #FFB100`. These tokens SHALL be available globally regardless of theme or instrument mode.

#### Scenario: Neon tokens available in dark mode

- **WHEN** `[data-theme="dark"]` is active
- **THEN** all `--neon-*` tokens SHALL resolve to their defined hex values
- **THEN** `--diff-bsc` SHALL equal `--neon-cyan`, `--diff-adv` SHALL equal `--neon-amber`, `--diff-ext` SHALL equal `--neon-pink`, `--diff-mas` SHALL equal `--neon-purple`

#### Scenario: Neon tokens available in light mode

- **WHEN** light mode is active (no `[data-theme="dark"]`)
- **THEN** all `--neon-*` tokens SHALL still resolve to their defined hex values
- **THEN** diff color tokens in light mode SHALL retain their existing hue-based values (no change to light mode diff colors)

---
### Requirement: Dark Mode Deep Background

The dark mode SHALL use `--bg-void: #05030E` as the deepest background layer. The existing `--color-bg-primary` in `[data-theme="dark"]` SHALL be updated to `#05030E`. `--color-bg-secondary` SHALL update to `#0A051A` and `--color-bg-elevated` SHALL update to `rgba(255,255,255,0.025)`.

---
### Requirement: Skill Neon Token

The design system SHALL define `--skill-neon: #C6FF1A` (lime) as the dedicated skill value color for dark mode. In dark mode, components displaying skill point values SHALL use `--skill-neon` instead of `--skill-gold-dark`.

---
### Requirement: CRT Visual Effects (Dark Mode Only)

In dark mode, the `body` element SHALL render three layered background effects using CSS pseudo-elements and background properties, all with `pointer-events: none`:

1. **CRT Scanlines** (`body::before`): A repeating horizontal stripe pattern using `linear-gradient(180deg, transparent 0px, transparent 2px, rgba(0,240,255,0.022) 2px, rgba(0,240,255,0.022) 3px)` with `background-size: 100% 3px`, covering the full viewport, `position: fixed`, `z-index: 0`.

2. **Ambient Glow** (applied via `body` background): `radial-gradient(ellipse at top, rgba(176,38,255,0.22), transparent 60%), radial-gradient(ellipse at bottom, rgba(255,27,141,0.14), transparent 70%), linear-gradient(180deg, #0A051A 0%, #05030E 100%)`.

3. **Vignette** (`body::after`): `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)`, `position: fixed`, `inset: 0`, `z-index: 0`, `mix-blend-mode: multiply`.

In light mode, none of these effects SHALL be applied.

---
### Requirement: Glow Utility Classes

The design system SHALL provide CSS utility classes for neon glow effects:

- `.glow-neon`: Applies `box-shadow: 0 0 6px var(--neon-cyan)` in dark mode; no effect in light mode.
- `.glow-neon-md`: Applies `box-shadow: 0 0 10px var(--neon-cyan), 0 0 24px color-mix(in srgb, var(--neon-cyan) 50%, transparent)` in dark mode; no effect in light mode.
- `.skill-neon-glow`: Applies `text-shadow: 0 0 10px var(--neon-lime), 0 0 24px color-mix(in srgb, var(--neon-lime) 50%, transparent)` in dark mode; no effect in light mode.

---
### Requirement: JetBrains Mono Font

The design system SHALL load `JetBrains Mono` from Google Fonts (weights 400, 700) and define `--font-mono: 'JetBrains Mono', monospace` as a CSS token. Components displaying level numbers, rank numbers, and version indicators SHALL use `--font-mono`.

---
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

---
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

---
### Requirement: PianFen Rank Accent Line Uses 700 Variant

In dark mode, the left-edge accent line of each `RecordRow` in the PianFen page SHALL use the 700 variant of the brand scale rather than the full-saturation 500. Odd-ranked rows SHALL use `--gf-700` (`#991055`), even-ranked rows SHALL use `--dm-700` (`#009099`).

#### Scenario: Accent line is visually subdued in dark mode

- **WHEN** dark mode is active and the PianFen page renders song rows
- **THEN** odd-rank rows (1, 3, 5…) SHALL display a left border of `#991055`
- **THEN** even-rank rows (2, 4, 6…) SHALL display a left border of `#009099`
- **THEN** neither color SHALL be the full-saturation neon value (`#FF1B8D` / `#00F0FF`)

---
### Requirement: Instrument Mode DOM Attribute Sync

When the user navigates to a page that has an instrument context (GF or DM), the application SHALL set `document.documentElement.dataset.instrument` to the lowercase instrument identifier (`"gf"` or `"dm"`). This enables CSS selectors of the form `[data-instrument="dm"]` to activate the correct brand color scale. When the user leaves the instrument-specific page, the attribute SHALL be removed from `document.documentElement`.

#### Scenario: DM instrument activates cyan brand scale in light mode

- **WHEN** the user navigates to `/pian-fen/dm`
- **THEN** `document.documentElement.dataset.instrument` SHALL equal `"dm"`
- **THEN** CSS `[data-instrument="dm"]` selectors SHALL match
- **THEN** `--color-brand` SHALL resolve to `--dm-500: #00F0FF`
- **THEN** the DM tab active indicator SHALL display in cyan, not pink

#### Scenario: Attribute is cleaned up on navigation away

- **WHEN** the user navigates away from `/pian-fen/:instrument`
- **THEN** `document.documentElement.dataset.instrument` SHALL be removed or reset

---
### Requirement: Light Mode Skill Score Color Contrast

In light mode, the skill score value displayed on each PianFen row SHALL use a color with a contrast ratio of at least 4.5:1 against a white background. The color SHALL be derived from the active instrument's brand scale: GF mode uses `--gf-600: #CC1671` (contrast 5.1:1), DM mode uses `--dm-600: #00C0CC` (contrast 4.7:1).

#### Scenario: GF skill score passes contrast in light mode

- **WHEN** light mode is active AND instrument is GF
- **THEN** the skill score text color SHALL be `#CC1671`
- **THEN** the contrast ratio against white (`#FFFFFF`) SHALL be ≥ 4.5:1

#### Scenario: DM skill score passes contrast in light mode

- **WHEN** light mode is active AND instrument is DM
- **THEN** the skill score text color SHALL be `#00C0CC`
- **THEN** the contrast ratio against white (`#FFFFFF`) SHALL be ≥ 4.5:1
