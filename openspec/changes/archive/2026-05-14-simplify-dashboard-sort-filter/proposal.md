## Why

Dashboard 成績頁的排序選單包含五個選項（Skill、達成率、賺分潛力、難度、歌名），其中大多對使用者無實際參考價值，且 loading skeleton 的顏色與頁面風格不符、兩頁呈現不一致。

## What Changes

- 排序/來源選單合併為一個 selector，三個選項：「全部」（顯示所有、依 max Skill 排序）、「家機 Skill ↓」（filter 有家機分數、依家機 Skill 排序）、「街機 Skill ↓」（filter 有街機分數、依街機 Skill 排序）；移除獨立的「全部來源」來源 dropdown
- 「未達標」改回 Row 1 的 toggle 按鈕（非 chip 列），點一次開啟、再點取消；active 時以 neon-pink 亮光樣式顯示；選對應來源時，比對該來源的 Skill 與 kasegiAvg
- `SongCard` 新增 `hideSource` prop：選「家機 Skill ↓」時隱藏街機 score row，選「街機 Skill ↓」時隱藏家機 score row
- Row 1 改為左右各 50% 布局：左半 HOT/OTHER tabs、右半 未達標 toggle + sort dropdown
- 統一 Dashboard 成績頁與 賺分曲頁的 loading skeleton 包裹樣式，修正 shimmer 顏色使其與卡片深色背景協調；改用 `animate-pulse`，移除 inline `<style>` 注入
- 賺分曲頁（`PianFen.tsx`）資料載入由圈圈改為 `SongCardSkeleton`，與 Dashboard/Index 一致
- `App.tsx` PageLoader 和 `ProtectedRoute.tsx` 全頁載入圈圈加入說明文字（「載入中…」/「驗證中…」）
- 修正所有 spinner 的 CSS bug：`style={{ borderColor }}` 覆蓋 Tailwind `border-t-transparent`，改以 `borderTopColor: "transparent"` inline 方式修正，使圓弧缺口與旋轉動畫正常顯示

## Non-Goals

- 不修改賺分曲頁（Index.tsx）的排序或篩選邏輯

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `dashboard-unified-view`：移除舊 Quick-filter Chips 需求（chip 列）；新增 Sort Options（三選項 selector 兼 source filter）；新增 Loading Skeleton Style；恢復「未達標」為 toggle 按鈕並更新篩選邏輯

## Impact

- Affected specs: `dashboard-unified-view`
- Affected code:
  - Modified: `src/pages/Dashboard.tsx`
  - Modified: `src/components/SongCardSkeleton.tsx`
  - Modified: `src/pages/PianFen.tsx`
  - Modified: `src/App.tsx`
  - Modified: `src/components/ProtectedRoute.tsx`
  - Modified: `src/components/SongCard.tsx`
