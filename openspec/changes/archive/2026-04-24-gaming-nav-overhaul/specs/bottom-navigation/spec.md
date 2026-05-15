## MODIFIED Requirements

### Requirement: Bottom Navigation Items

The bottom navigation bar SHALL display exactly 4 items: 成績 (/dashboard), 賺分曲 (/kasegi), 好友 (/friends), 匯入 (/import). The 歌曲 (/songs) entry SHALL NOT appear in the bottom navigation. Each NavLink SHALL have `position: relative` applied so that child elements with absolute positioning are correctly anchored.

#### Scenario: Bottom nav contains 4 items

- **WHEN** an authenticated user views any page on mobile
- **THEN** the bottom navigation bar SHALL display exactly 4 items: 成績, 賺分曲, 好友, 匯入

#### Scenario: Songs route remains accessible

- **WHEN** a user navigates to `/songs` or `/songs/:id` via direct URL or internal link
- **THEN** the page SHALL render normally without the bottom nav entry

## ADDED Requirements

### Requirement: Bottom Navigation Active State

The active navigation item SHALL use a filled pill style (BottomNav filled pill active 設計): icon and label displayed horizontally inside a container with brand color background at 15% opacity, brand color text, and a subtle glow shadow (`box-shadow: 0 0 8px color-mix(in srgb, var(--color-brand) 30%, transparent)`). The font-display class (Russo One) SHALL be applied to all navigation labels. Inactive items SHALL display icon above label with muted text color and no background.

#### Scenario: Active item shows filled pill

- **WHEN** a user is on the /dashboard route
- **THEN** the 成績 nav item SHALL render as a horizontal pill with brand-colored background and glow, with icon and label side by side

#### Scenario: Inactive items show stacked layout

- **WHEN** a user is on any route other than /kasegi
- **THEN** the 賺分曲 nav item SHALL show icon stacked above label in muted color with no background pill

#### Scenario: Font display applied to labels

- **WHEN** the bottom navigation renders
- **THEN** all nav item labels SHALL use the display font (Russo One)
