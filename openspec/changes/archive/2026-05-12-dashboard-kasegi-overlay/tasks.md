## 1. Remove Difficulty Chips from Filter Bar（Score Filtering、Two-Row Filter Bar）

- [x] 1.1 在 `src/pages/Dashboard.tsx` 執行 Remove Difficulty Chips from Filter Bar：刪除 `DIFFICULTIES` 常數、`difficulties` state、`toggleDiff` 函式、難度 chip 按鈕 JSX（`{DIFFICULTIES.map(...)}` 區塊）、`filtered` useMemo 中的難度篩選邏輯、`hasFilter` 中的 `difficulties.length > 0`、`resetFilters` 中的 `setDifficulties([])`（涵蓋 Score Filtering 與 Two-Row Filter Bar 規格）

## 2. Skill Scope Selector in Dashboard Header

- [x] 2.1 在 `src/pages/Dashboard.tsx` 的 `Dashboard` 元件新增 `scope` state（Skill Scope Selector in Dashboard Header），型別 `ScopeTier`，初始值 `(Number(localStorage.getItem("dashboard_scope")) || 7000) as ScopeTier`；從 `@/hooks/usePianFen` import `SCOPE_TIERS`、`ScopeTier`
- [x] 2.2 在 Dashboard header 的 `<h1>成績</h1>` 下方加入分段選擇器列（Skill Scope Selector in Dashboard Header）：橫向排列 `SCOPE_TIERS` 按鈕，active 樣式為 `var(--neon-pink)` 邊框 + `color-mix(in srgb, var(--neon-pink) 10%, transparent)` 背景，inactive 為 `var(--bg-mute)` 邊框；點擊時 `setScope(tier)` 並 `localStorage.setItem("dashboard_scope", String(tier))`；字型 `var(--font-mono)`、fontSize `10px`，按鈕文字格式 `{tier}~`
- [x] 2.3 在 `ScoreList` props interface 加入 `scope: ScopeTier`，在 `Dashboard` render 傳入 `<ScoreList ... scope={scope} />`

## 3. Kasegi Overlay on Dashboard Score Cards — Fetch PianFen Data in ScoreList

- [x] 3.1 在 `src/pages/Dashboard.tsx` 的 `ScoreList` 元件內 Fetch PianFen Data in ScoreList：呼叫 `usePianFen(mode === "DM" ? "DM" : "GF", scope)`（import `usePianFen` 從 `@/hooks/usePianFen`）；用 `useMemo` 建立 lookup map，合併 `pianFenData?.hot` 和 `pianFenData?.other`，key 為 `` `${r.name}|${r.diff}` ``，value 為 `r.averageSkill`；HOT 先寫入、OTHER 不覆蓋已有 key

## 4. Kasegi Overlay on Dashboard Score Cards — KasegiOverlay Prop on SongCard

- [x] 4.1 在 `src/components/SongCard.tsx` 新增 KasegiOverlay Prop on SongCard：`SongCardProps` interface 加入 `kasegiOverlay?: { averageSkill: number } | null`；`SongCardInner` 解構加入 `kasegiOverlay`；memo comparator 加入 `prev.kasegiOverlay === next.kasegiOverlay`
- [x] 4.2 在 `SongCard` 歌名行右側加入賺分曲 badge section（Kasegi Overlay on Dashboard Score Cards）：僅當 `kasegiOverlay` 有值時渲染；「賺」文字（`var(--font-display)`，`var(--neon-pink)` 邊框，fontSize `8px`，padding `1px 4px`）；旁邊 `avg {kasegiOverlay.averageSkill.toFixed(1)}` 文字（`var(--color-text-muted)`，`10px`）
- [x] 4.3 在 `src/pages/Dashboard.tsx` 的 `ScoreList` render 迴圈，以 `` `${item.歌曲名稱}|${item.譜面等級}` `` 查詢 lookup map，命中則傳 `kasegiOverlay={{ averageSkill }}` 給 `<SongCard>`，未命中傳 `kasegiOverlay={null}`

## 5. 驗證

- [x] 5.1 確認 Dashboard 篩選列無 BSC/ADV/EXT/MAS 按鈕（Remove Difficulty Chips from Filter Bar）
- [x] 5.2 確認 header 有分段選擇器，預設 7000，reload 後維持選擇（Skill Scope Selector in Dashboard Header）
- [x] 5.3 確認命中賺分曲的成績卡顯示「賺」badge 與 `avg X.X`，未命中無 badge（Kasegi Overlay on Dashboard Score Cards）
