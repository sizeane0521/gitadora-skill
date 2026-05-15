## MODIFIED Requirements

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

## MODIFIED Requirements

### Requirement: Sidebar Navigation Items

The desktop sidebar SHALL NOT display a 歌曲列表 (/songs) or 賺分曲 (/kasegi) navigation entry. The sidebar SHALL display: 成績總覽, 賺分曲 (/pian-fen), 好友, 匯入成績, 個人資料. The 賺分曲 item SHALL link to `/pian-fen` and use the `TrendingUp` icon.

#### Scenario: Sidebar includes 賺分曲 entry linking to /pian-fen

- **WHEN** an authenticated user views any page on a screen wider than 768px
- **THEN** the desktop sidebar SHALL display a 賺分曲 navigation entry linking to `/pian-fen`

#### Scenario: Sidebar has no /kasegi entry

- **WHEN** an authenticated user views any page on a screen wider than 768px
- **THEN** the desktop sidebar SHALL NOT display a navigation entry linking to `/kasegi`
