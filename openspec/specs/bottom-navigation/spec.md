## Requirements

### Requirement: Bottom Navigation Items

The bottom navigation bar SHALL display exactly 4 items: 成績 (/dashboard), 賺分曲 (/pian-fen), 好友 (/friends), 匯入 (/import). The 歌曲 (/songs) and /kasegi entries SHALL NOT appear in the bottom navigation. Each NavLink SHALL have `position: relative` applied so that child elements with absolute positioning are correctly anchored. The 賺分曲 item SHALL use the `TrendingUp` icon from lucide-react and link to `/pian-fen`.

#### Scenario: Bottom nav contains 4 items

- **WHEN** an authenticated user views any page on mobile
- **THEN** the bottom navigation bar SHALL display exactly 4 items in order: 成績, 賺分曲, 好友, 匯入

#### Scenario: Songs route remains accessible

- **WHEN** a user navigates to `/songs` or `/songs/:id` via direct URL or internal link
- **THEN** the page SHALL render normally without the bottom nav entry

#### Scenario: 賺分曲 item is active on pian-fen routes

- **WHEN** a user is on any route starting with `/pian-fen`
- **THEN** the 賺分曲 nav item SHALL render as the active filled pill with brand color

---
### Requirement: Bottom Navigation Active State Indicator

The active navigation item SHALL display a top-edge neon glow bar as its indicator. The bar SHALL be positioned absolutely at the top of the item (`top: 0`), spanning 70% of the item width (`left: 15%; right: 15%`), with `height: 2px` and `border-radius: 0 0 3px 3px`. In dark mode, the bar background SHALL be `var(--neon-lime)` with a triple-layer box-shadow glow. The active item SHALL also render a full-coverage background overlay using `color-mix(in srgb, var(--neon-lime) 6%, transparent)`. The active item's icon SHALL use `color: var(--neon-lime)` with `filter: drop-shadow(0 0 6px var(--neon-lime))`. The active item's label SHALL use `color: var(--neon-lime)` with `text-shadow: 0 0 8px var(--neon-lime)`. In light mode, the active indicator SHALL use `var(--color-brand)` for the bar and text without glow effects.

#### Scenario: Active item shows lime top glow bar in dark mode

- **WHEN** `[data-theme="dark"]` is active AND a navigation item is the current route
- **THEN** the active item SHALL display a 2px top bar spanning `left: 15%` to `right: 15%` with `background: #C6FF1A` and triple box-shadow glow
- **THEN** the active item SHALL display a subtle background overlay of `color-mix(in srgb, #C6FF1A 6%, transparent)`
- **THEN** the active item's icon SHALL be `color: #C6FF1A` with a drop-shadow filter
- **THEN** the active item's label text SHALL be `color: #C6FF1A` with `text-shadow: 0 0 8px #C6FF1A`
- **THEN** inactive items SHALL display icon and label in `var(--text-dim)` (#555) without glow effects

---
### Requirement: Sidebar Navigation Items

The desktop sidebar SHALL NOT display a 歌曲列表 (/songs) or 賺分曲 (/kasegi) navigation entry. The sidebar SHALL display: 成績總覽, 賺分曲 (/pian-fen), 好友, 匯入成績, 個人資料. The 賺分曲 item SHALL link to `/pian-fen` and use the `TrendingUp` icon.

#### Scenario: Sidebar includes 賺分曲 entry linking to /pian-fen

- **WHEN** an authenticated user views any page on a screen wider than 768px
- **THEN** the desktop sidebar SHALL display a 賺分曲 navigation entry linking to `/pian-fen`

#### Scenario: Sidebar has no /kasegi entry

- **WHEN** an authenticated user views any page on a screen wider than 768px
- **THEN** the desktop sidebar SHALL NOT display a navigation entry linking to `/kasegi`
