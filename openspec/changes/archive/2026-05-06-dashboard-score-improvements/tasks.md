## 1. Sort Dropdown Labels in Natural Chinese

- [x] 1.1 在 `src/pages/Dashboard.tsx` 的 `ScoreList` 元件中，將 Sort dropdown 的 `<SelectItem>` 文字改為自然繁中（Sort Dropdown Labels in Natural Chinese）：`Skill 由高到低`、`達成率 由高到低`、`難度 由高到低`（賺分潛力、歌名不變）

## 2. Remove Minimum Level Filter

- [x] 2.1 在 `src/pages/Dashboard.tsx` 執行 Remove Minimum Level Filter：刪除 `LEVEL_OPTIONS` 常數、`minLevel` state、minLevel `<Select>` 控制項及其 JSX、`filtered` useMemo 中的 level filter 邏輯，並更新 `hasFilter` 移除 `minLevel !== null` 條件、`resetFilters` 移除對 minLevel 的重設

## 3. Quick-filter Chips for Score Status

- [x] 3.1 在 `src/pages/Dashboard.tsx` 的 `ScoreList` 元件新增 `quickFilter` state（Quick-filter Chips for Score Status），型別為 `"all" | "improvable" | "underperforming"`，初始值 `"all"`
- [x] 3.2 在 `filtered` useMemo 加入 quickFilter 過濾邏輯：`improvable` 條件為 `bestRate < 95`，`underperforming` 條件為 `bestRate < 80`（`bestRate = Math.max(arcadeRate, homeRate)`）；切換時 reset page 至 1；更新 `hasFilter` 加入 `quickFilter !== "all"`；`resetFilters` 加入重設 `quickFilter` 至 `"all"`
- [x] 3.3 在 Row 2 篩選列最前方加入三個 quick-filter chip 按鈕（全部 / 可加分 / 未達標），active chip 使用 `var(--color-brand)` 背景白色文字，inactive 使用 `var(--color-border-default)` 邊框文字

## 4. Kasegi Bar on Dashboard SongCard

- [x] 4.1 在 `src/components/SongCard.tsx` 的 `SongCardProps` interface 新增選用 prop（Kasegi Bar on Dashboard SongCard）：`kasegiBar?: { potential: number; maxSkill: number } | null`
- [x] 4.2 在 `SongCard` 元件 ScoreRow 區塊下方加入賺分空間 section：僅當 `kasegiBar` 有值時渲染；標籤「賺分空間」（`var(--font-display)`，`var(--neon-pink)`，10px）；進度條填充寬度 = `(1 - kasegiBar.potential / kasegiBar.maxSkill) * 100%`；右側文字「還差 X.X pt」（potential 四捨五入一位小數）
- [x] 4.3 在 `src/pages/Dashboard.tsx` 的 `ScoreList` render 迴圈，對每首歌使用 `calculateKasegiPotential(item.難度數值, bestRate)` 計算 kasegi 並以 `kasegiBar` prop 傳入 `<SongCard>`（`bestRate = Math.max(Number(item["街機版最佳達成率 (%)"]) || 0, Number(item["家用版最佳達成率 (%)"]) || 0)`）

## 5. 驗證

- [x] 5.1 確認 Sort dropdown 無「降冪」字樣，三個選項正確顯示「由高到低」（Sort Dropdown Labels in Natural Chinese）
- [x] 5.2 確認 Dashboard 頁面不存在等級篩選 dropdown（Remove Minimum Level Filter）
- [x] 5.3 確認「可加分」chip 只顯示 bestRate < 95% 的歌，「未達標」chip 只顯示 bestRate < 80% 的歌（Quick-filter Chips for Score Status）
- [x] 5.4 確認每張 SongCard 底部顯示賺分空間進度條與「還差 X.X pt」文字（Kasegi Bar on Dashboard SongCard）
