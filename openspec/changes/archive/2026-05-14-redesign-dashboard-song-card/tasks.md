## 1. 移除 kasegiBar prop（Kasegi Bar on Dashboard SongCard）

- [x] 1.1 實作「Kasegi Bar on Dashboard SongCard」移除（SongCard）：在 `src/components/SongCard.tsx` 中，從 `SongCardProps` interface 移除 `kasegiBar?: { potential: number; maxSkill: number } | null`；從 `SongCardInner` 解構參數中移除 `kasegiBar`；刪除 kasegiBar progress bar 的 JSX 區塊（`{kasegiBar && kasegiBar.maxSkill > 0 && (...)}` 整段）；從 `React.memo` 的 areEqual 函式中移除 `prev.kasegiBar === next.kasegiBar` 判斷；驗證：TypeScript 編譯無錯誤，SongCard 不再渲染「賺分空間」進度條

- [x] 1.2 實作「Kasegi Bar on Dashboard SongCard」移除（Dashboard）：在 `src/pages/Dashboard.tsx` 中，移除 `kasegiBarData` 計算（包含 `overlayAvg != null` 的三元判斷和 `calculateKasegiPotential` 的 fallback IIFE）、移除 `bestRate` 計算、移除 `kasegiBar={...}` prop 傳遞；保留 `overlayAvg` 計算與 `kasegiOverlay` prop；驗證：TypeScript 編譯無錯誤，`calculateKasegiPotential` import 可一併移除（如無其他用途）

## 2. 更新 kasegiOverlay 行內顯示（Kasegi Overlay on Dashboard Score Cards）

- [x] 2.1 實作「Kasegi Overlay on Dashboard Score Cards」差距計算：在 `src/components/SongCard.tsx` 的 `SongCardInner` 函式內，從 `song` data 計算 `playerBestSkill = Math.max(Number(song["街機版 Skill 點數"]) || 0, Number(song["家用版 Skill 點數"]) || 0)`；計算 `kasegiGap = kasegiOverlay ? kasegiOverlay.averageSkill - playerBestSkill : null`；驗證：`kasegiGap` 在 playerBestSkill=155.6、averageSkill=160.2 時得出 4.6

- [x] 2.2 實作「Kasegi Overlay on Dashboard Score Cards」行內 badge 顯示：在 `src/components/SongCard.tsx` 的 instrument/target row JSX 中，將現有的 `kasegiOverlay` 顯示邏輯（「目標」標籤 + 數值）改為：當 `kasegiOverlay` 存在時，右側群組顯示（1）若 `kasegiGap > 0`：`[未達標 badge]` + `―{kasegiGap.toFixed(1)}`；（2）`目標 {kasegiOverlay.averageSkill.toFixed(1)}`；當 `kasegiOverlay` 為 null 時整個群組不渲染；驗證：kasegiAvg=160.2、playerBest=155.6 → 顯示「未達標 ―4.6 目標 160.2」；kasegiAvg=150.0、playerBest=152.3 → 只顯示「目標 150.0」；kasegiOverlay=null → 不顯示

## 3. 重構卡片 Layout（SongCard Vertical Layout on Dashboard）

- [x] 3.1 實作「SongCard Vertical Layout on Dashboard」左欄重構：在 `src/components/SongCard.tsx` 中，將左欄改為垂直 flex column，包含：（1）封面圖（40×40px，保持現有樣式）；（2）難度徽章區塊（譜面等級標籤如 MAS 在上、難度數值如 9.2 在下，寬度同封面 40px）；驗證：卡片左側封面下方有難度徽章，不再出現在 info 行中

- [x] 3.2 實作「SongCard Vertical Layout on Dashboard」樂器名稱位置：在 `src/components/SongCard.tsx` 的 info 區第一行移除樂器名稱；在第二行（instrument/target row）將樂器名稱（Guitar/Bass/Drums）放置最左側，`kasegiOverlay` 群組靠右；驗證：「Guitar」出現在「未達標」左側同一行，難度 badge 不再出現在此行

- [x] 3.3 實作「SongCard Vertical Layout on Dashboard」分隔線：在 `src/components/SongCard.tsx` 的 instrument/target row 與 score rows 之間插入 neon-pink 漸層分隔線（`height: "2px"`, `background: "linear-gradient(to left, rgba(255,27,141,0.6) 0%, transparent 80%)"`，粉紅色在右側漸層至左側透明，對齊 Figma rotate-180 的效果）；驗證：卡片中間有一條從右側 neon-pink 漸變至左側透明的水平線

## 4. Bug 修正與資料來源優化

- [x] 4.1 修正難度數值顯示 NaN 的 Bug：在 `src/components/SongCard.tsx` 難度徽章區塊中，將 `song.難度數値`（含日文字元 `値` U+5024）更正為 `song.難度數值`（正確中文字元 `值`），與 `src/types/song.ts` 的型別定義一致；驗證：卡片左欄難度徽章顯示正確數值（如 9.2），不再顯示 NaN

- [x] 4.2 修正 neon-pink 分隔線方向：在 `src/components/SongCard.tsx` 漸層分隔線的 CSS 中，將 `linear-gradient(to right, ...)` 改為 `linear-gradient(to left, ...)`，使粉紅色顯示在右側、透明在左側，與 Figma 設計稿的 `rotate-180` 效果一致；驗證：分隔線粉紅端在右側

- [x] 4.3 將 Dashboard kasegi 資料來源從 `useKasegiFromDB`（讀 Supabase DB）改為 `usePianFen`（直打 gsv.fun API）：在 `src/pages/Dashboard.tsx` 中，將 import 從 `useKasegiFromDB` 改為 `usePianFen`，將 `useKasegiFromDB(mode, scope)` 呼叫改為 `usePianFen(mode, scope)`；驗證：Dashboard 成績頁的「目標」值在首次載入時自動從 gsv.fun 取得，不依賴 DB 是否有資料；React Query 5 分鐘快取有效，同 scope 不重複打 API
