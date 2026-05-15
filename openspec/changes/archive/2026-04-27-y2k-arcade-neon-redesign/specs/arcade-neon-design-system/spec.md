## ADDED Requirements

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

### Requirement: Dark Mode Deep Background

The dark mode SHALL use `--bg-void: #05030E` as the deepest background layer. The existing `--color-bg-primary` in `[data-theme="dark"]` SHALL be updated to `#05030E`. `--color-bg-secondary` SHALL update to `#0A051A` and `--color-bg-elevated` SHALL update to `rgba(255,255,255,0.025)`.

### Requirement: Skill Neon Token

The design system SHALL define `--skill-neon: #C6FF1A` (lime) as the dedicated skill value color for dark mode. In dark mode, components displaying skill point values SHALL use `--skill-neon` instead of `--skill-gold-dark`.

### Requirement: CRT Visual Effects (Dark Mode Only)

In dark mode, the `body` element SHALL render three layered background effects using CSS pseudo-elements and background properties, all with `pointer-events: none`:

1. **CRT Scanlines** (`body::before`): A repeating horizontal stripe pattern using `linear-gradient(180deg, transparent 0px, transparent 2px, rgba(0,240,255,0.022) 2px, rgba(0,240,255,0.022) 3px)` with `background-size: 100% 3px`, covering the full viewport, `position: fixed`, `z-index: 0`.

2. **Ambient Glow** (applied via `body` background): `radial-gradient(ellipse at top, rgba(176,38,255,0.22), transparent 60%), radial-gradient(ellipse at bottom, rgba(255,27,141,0.14), transparent 70%), linear-gradient(180deg, #0A051A 0%, #05030E 100%)`.

3. **Vignette** (`body::after`): `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)`, `position: fixed`, `inset: 0`, `z-index: 0`, `mix-blend-mode: multiply`.

In light mode, none of these effects SHALL be applied.

### Requirement: Glow Utility Classes

The design system SHALL provide CSS utility classes for neon glow effects:

- `.glow-neon`: Applies `box-shadow: 0 0 6px var(--neon-cyan)` in dark mode; no effect in light mode.
- `.glow-neon-md`: Applies `box-shadow: 0 0 10px var(--neon-cyan), 0 0 24px color-mix(in srgb, var(--neon-cyan) 50%, transparent)` in dark mode; no effect in light mode.
- `.skill-neon-glow`: Applies `text-shadow: 0 0 10px var(--neon-lime), 0 0 24px color-mix(in srgb, var(--neon-lime) 50%, transparent)` in dark mode; no effect in light mode.

### Requirement: JetBrains Mono Font

The design system SHALL load `JetBrains Mono` from Google Fonts (weights 400, 700) and define `--font-mono: 'JetBrains Mono', monospace` as a CSS token. Components displaying level numbers, rank numbers, and version indicators SHALL use `--font-mono`.
