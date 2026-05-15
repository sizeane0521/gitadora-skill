## MODIFIED Requirements

### Requirement: Bottom Navigation Active State Indicator

The active navigation item SHALL display a top-edge neon glow bar as its indicator. The bar SHALL be positioned absolutely at the top of the item (`top: 0`), spanning 70% of the item width (`left: 15%; right: 15%`), with `height: 2px` and `border-radius: 0 0 3px 3px`. In dark mode, the bar background SHALL be `var(--neon-lime)` with a triple-layer box-shadow glow. The active item SHALL also render a full-coverage background overlay using `color-mix(in srgb, var(--neon-lime) 6%, transparent)`. The active item's icon SHALL use `color: var(--neon-lime)` with `filter: drop-shadow(0 0 6px var(--neon-lime))`. The active item's label SHALL use `color: var(--neon-lime)` with `text-shadow: 0 0 8px var(--neon-lime)`. In light mode, the active indicator SHALL use `var(--color-brand)` for the bar and text without glow effects.

#### Scenario: Active item shows lime top glow bar in dark mode

- **WHEN** `[data-theme="dark"]` is active AND a navigation item is the current route
- **THEN** the active item SHALL display a 2px top bar spanning `left: 15%` to `right: 15%` with `background: #C6FF1A` and triple box-shadow glow
- **THEN** the active item SHALL display a subtle background overlay of `color-mix(in srgb, #C6FF1A 6%, transparent)`
- **THEN** the active item's icon SHALL be `color: #C6FF1A` with a drop-shadow filter
- **THEN** the active item's label text SHALL be `color: #C6FF1A` with `text-shadow: 0 0 8px #C6FF1A`
- **THEN** inactive items SHALL display icon and label in `var(--text-dim)` (#555) without glow effects
