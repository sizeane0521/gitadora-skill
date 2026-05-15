## 1. src/hooks/usePianFen.ts — PianFen List Sort Order

- [x] 1.1 PianFen List Sort Order：在 `fetchPianFen` 的回傳值中，對 `hot` 和 `other` 各自加上 `.sort((a, b) => b.averageSkill - a.averageSkill)`，位置在 `.filter(...)` 之後、`return` 之前。確保 HOT 與 OTHER 各自獨立排序，不互相影響。

## 2. src/pages/PianFen.tsx — Instrument Mode DOM Attribute Sync

- [x] 2.1 Instrument Mode DOM Attribute Sync：在 `PianFen` 主元件加入 `useEffect`，依賴 `[gameType]`。Effect 內執行 `document.documentElement.dataset.instrument = gameType.toLowerCase()`（`"gf"` 或 `"dm"`）。Cleanup 函式執行 `delete document.documentElement.dataset.instrument`。

## 3. src/pages/PianFen.tsx — Light Mode Skill Score Color Contrast

- [x] 3.1 Light Mode Skill Score Color Contrast：在 `RecordRow` 的 skill 分數 `<p>` 元素，亮色模式的 color 由 `var(--skill-gold-dark)` 改為依 `record.part` 決定：part 為 `"D"`（Drums）時用 `#00C0CC`（dm-600），其餘（Guitar / Bass）用 `#CC1671`（gf-600）。深色模式維持 `var(--neon-lime)` 不變。

## 4. src/pages/PianFen.tsx — Cover Image Border in Light Mode

- [x] 4.1 Cover Image Border in Light Mode：在 `RecordRow` 的封面外層 `<div>` style，亮色模式加入 `border: "1px solid #E2E8F0"`，padding 維持 `0`（不需要像深色模式一樣用 padding 模擬 border）。內層圖片與 placeholder `<div>` 的 `borderRadius` 維持 `"2px"`。

## 5. 驗證（第一輪）

- [x] 5.1 執行 `npx tsc --noEmit`，確認無 TypeScript 錯誤
- [x] 5.2 開啟 GF 賺分曲（亮色模式），確認 HOT 第 1 名的 averageSkill ≥ 第 2 名
- [x] 5.3 切換至 DM tab（亮色模式），確認 active 底線與文字顯示青色而非粉色
- [x] 5.4 亮色模式確認 skill 分數可讀（深玫瑰色，非金色）
- [x] 5.5 亮色模式確認封面圖片及 placeholder 均有 1px 淺灰邊框

## 6. src/pages/PianFen.tsx — Cover Image Border in Light Mode（技法修正）

- [x] 6.1 Cover Image Border in Light Mode 修正：改用 padding 技法（同 dark mode）。外層 div `padding: "1px"`、`background: isDark ? coverGradient : "#94A3B8"`、`width: "40px"`、`height: "40px"`。移除錯誤的 `border: "1px solid #E2E8F0"` 方案（與 box-sizing: border-box 衝突）。
- [x] 6.2 Placeholder 亮色模式背景改為 `#FFFFFF`（純白），使 `#94A3B8` border 對比清楚可見。

## 7. src/pages/PianFen.tsx — UI 一致性修正

- [x] 7.1 Diff Badge 統一：移除 `{isDark ? (...) : (...)}` 雙實作，改為單一 `<span>`，`fontSize: "9px"`、`padding: "1px 5px"`、`borderRadius: "3px"`，dark/light 僅切換 background/color/className 顏色方案。
- [x] 7.2 Row 左側線由 `borderLeft: 3px solid` 改為 `boxShadow: \`inset 3px 0 0 ${accentColor}\``，避免 dark mode 的 3px border 造成 row 內容位移。
- [x] 7.3 GF/DM tab light mode 加入外框：`border: \`1px solid ${isActive ? "var(--color-brand)" : "var(--color-border-default)"}\``，與 dark mode 的邊框結構對齊。

## 8. src/pages/PianFen.tsx — 分頁功能（每頁 25 首）

- [x] 8.1 新增 `useMemo` import，加入 `page` state（預設 1）與 `PAGE_SIZE = 25` 常數。
- [x] 8.2 新增 `useEffect` 監聽 `[gameType, scope]`，任一變動時重置 `page` 為 1。
- [x] 8.3 `taggedRecords`（useMemo）：將 `data.hot` 和 `data.other` 合併為 `{ record, section: "HOT"|"OTHER", rank }`，HOT 在前。
- [x] 8.4 `totalPages` 計算：`Math.max(1, Math.ceil(taggedRecords.length / 25))`；`pageItems` 切片：`taggedRecords.slice((page-1)*25, page*25)`。
- [x] 8.5 Render 改為迭代 `pageItems`，利用 `idx === 0 || item.section !== pageItems[idx-1].section` 動態插入 `SectionHeader`。
- [x] 8.6 分頁控制 UI：`totalPages > 1` 時顯示 ◄ 頁數/總頁數 ►，disabled 時透明度 0.4；樣式跟隨 isDarkMode 切換顏色。

## 9. 驗證（第二輪）

- [x] 9.1 執行 `npx tsc --noEmit`，確認無 TypeScript 錯誤
- [x] 9.2 亮色模式確認封面 border 四邊均勻顯示（非只有左右）
- [x] 9.3 dark/light 模式確認 EXT/MAS badge 字級、padding、圓角視覺一致
- [x] 9.4 dark/light 模式確認 row 內容水平位置對齊（無 3px 偏移）
- [x] 9.5 GF/DM tab 亮色模式有外框線
- [x] 9.6 HOT+OTHER 超過 25 首時顯示分頁控制，翻頁正確，切換 scope 回到第 1 頁
