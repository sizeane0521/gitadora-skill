## 1. 建立 useUnifiedSongList hook

- [x] 1.1 新增 `src/hooks/useUnifiedSongList.ts`：useUnifiedSongList hook 合併策略 — 使用 TanStack Query 呼叫 `fetchSongs(mode)` 取得全部歌曲，同時以 `useScores({ source: "arcade" })` 和 `useScores({ source: "konaste" })` 取得使用者成績，staleTime 設 5 分鐘（Unified Song and Score View、Personal Score List Display）
- [x] 1.2 useUnifiedSongList hook 合併策略：實作 merge 邏輯 — 以 `歌曲名稱 + 樂器類型.toUpperCase() + 譜面等級.toUpperCase()` 為 key，arcade record 覆蓋 `街機版最佳達成率 (%)` 和 `街機版 Skill 點數`，konaste record 覆蓋 `家用版最佳達成率 (%)` 和 `家用版 Skill 點數`；Google Sheets 值作為 fallback（Unified Song and Score View — merge result）
- [x] 1.3 hook 回傳 `{ data: SongData[], isLoading: boolean }`，`isLoading` 在 Google Sheets 或任一 Supabase 查詢仍在載入時為 true

## 2. 重設計 Dashboard filter bar（Two-Row Filter Bar）

- [x] 2.1 在 `src/pages/Dashboard.tsx` 的 `ScoreList` 新增 `hotOther` state（`"hot" | "other"`，預設 `"hot"`），切換時 reset page 為 1（HOT / OTHER Tab Switching on Dashboard — Tab switch resets pagination）
- [x] 2.2 Row 1：HOT/OTHER skewed clip-path 按鈕（HOT / OTHER tab 切換，完全複製賺分曲的 GF/DM tab 樣式，HOT=neon-pink, OTHER=neon-cyan）+ 右側排序下拉，整列 `sticky` 貼在 GF/DM tab bar 下方（Two-Row Filter Bar — Row 1 is sticky）
- [x] 2.3 Filter bar 兩列設計 — Row 2：難度按鈕（BSC/ADV/EXT/MAS）+ 來源下拉（全部來源/家用/街機）+ 等級下拉（全部等級/6.0+…9.5+）；有任一篩選啟用時顯示「重設」按鈕，點擊清除全部篩選（Two-Row Filter Bar — Reset clears all filters）
- [x] 2.4 HOT/OTHER 篩選邏輯：`hotOther === "hot"` → 只顯示 `song.新舊分類 === "HOT"` 的歌；`"other"` → 其餘（HOT / OTHER Tab Switching on Dashboard）

## 3. 整合統一視圖至 Dashboard

- [x] 3.1 在 `src/pages/Dashboard.tsx` 的 `ScoreList` 將 `useScores` 替換為 `useUnifiedSongList`；移除 `source` 篩選傳入 hook（改由 UI 篩選）（Unified Song and Score View）
- [x] 3.2 Zetaraku cover lookup 保留：`useZetarakuSongs()` 仍在 `ScoreList` 中使用，merge cover URL 邏輯不變
- [x] 3.3 移除 DashboardView toggle：`DashboardView` state、「目前成績」/「全部歌曲」按鈕、`SongsBrowseView` import 及其渲染路徑全部移除（Dashboard View Toggle — REMOVED）
- [x] 3.4 移除舊 `ScoreRow` 函式（已由 `SongCard` 取代）

## 4. 驗證

- [x] 4.1 確認有成績的歌顯示完整進度條，無成績的歌顯示「—」（Unified Song and Score View — Song with no score shows dash）
- [x] 4.2 確認 HOT tab 只顯示 HOT 曲，OTHER tab 只顯示非 HOT 曲（HOT / OTHER Tab Switching on Dashboard）
- [x] 4.3 確認 Row 1（HOT/OTHER + 排序）隨捲動保持 sticky，Row 2 正常捲動（Two-Row Filter Bar — Row 1 is sticky）
