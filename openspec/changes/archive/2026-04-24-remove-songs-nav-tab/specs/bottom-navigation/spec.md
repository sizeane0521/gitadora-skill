## ADDED Requirements

### Requirement: Bottom Navigation Items

The bottom navigation bar SHALL display exactly 4 items: 成績 (/dashboard), 賺分曲 (/kasegi), 好友 (/friends), 匯入 (/import). The 歌曲 (/songs) entry SHALL NOT appear in the bottom navigation.

#### Scenario: Bottom nav contains 4 items

- **WHEN** an authenticated user views any page on mobile
- **THEN** the bottom navigation bar SHALL display exactly 4 items: 成績, 賺分曲, 好友, 匯入

#### Scenario: Songs route remains accessible

- **WHEN** a user navigates to `/songs` or `/songs/:id` via direct URL or internal link
- **THEN** the page SHALL render normally without the bottom nav entry

### Requirement: Sidebar Navigation Items

The desktop sidebar SHALL NOT display a 歌曲列表 (/songs) navigation entry. The sidebar SHALL retain all other navigation items: 成績總覽, 賺分曲, 好友, 匯入成績, 個人資料.

#### Scenario: Sidebar has no songs entry

- **WHEN** an authenticated user views any page on a screen wider than 768px
- **THEN** the desktop sidebar SHALL NOT display a 歌曲列表 entry
