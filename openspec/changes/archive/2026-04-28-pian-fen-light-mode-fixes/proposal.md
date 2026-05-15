## Problem

PianFen 頁面（賺分曲）在亮色模式與排序上存在 4 個 bug：

1. **排序錯誤**：HOT / OTHER 列表在 filter 掉不相關的 part 之後，未依 `averageSkill` 降序重新排列，導致分數高的歌曲出現在排名靠後的位置（例：161.4 分的曲目出現在第 3 名而非第 1 名）。
2. **DM 色彩未套用**：`data-instrument` 屬性從未被設定在 `document.documentElement` 上，導致 CSS `[data-instrument="dm"]` selector 永遠不生效，DM tab 在亮色模式顯示 GF 粉色（`#FF1B8D`）而非青色。
3. **Skill 分數低對比**：亮色模式使用 `--skill-gold-dark: #B8860B`（對比度約 3.7:1），低於 WCAG AA 標準（4.5:1），視覺上過暗且不符合品牌色系。
4. **封面無 border**：亮色模式下封面圖片無任何邊框，浮在白底上缺乏視覺邊界感。

## Root Cause

1. `usePianFen.ts` 的 filter 結果未排序：`raw.hot.filter(...)` 保留 API 回傳的社群熱門度排序，而非 skill 分數排序。
2. `PianFen.tsx` 在 instrument 切換時未執行 `document.documentElement.dataset.instrument = ...`，CSS instrument selector 無從生效。
3. 亮色模式的 skill 分數 color token 選用了 `--skill-gold-dark`，與新品牌色系（`--gf-*` / `--dm-*`）脫節且對比不足。
4. 亮色模式的封面容器刻意設為 `padding: 0; background: transparent`，未提供任何 border 樣式。

## Proposed Solution

1. **排序**：在 `usePianFen.ts` 的 filter 之後加 `.sort((a, b) => b.averageSkill - a.averageSkill)`，HOT 與 OTHER 各自獨立降序排列。
2. **data-instrument**：在 `PianFen.tsx` 加 `useEffect`，當 `gameType` 改變時執行 `document.documentElement.dataset.instrument = gameType.toLowerCase()`；組件卸載時清除（`delete document.documentElement.dataset.instrument`）。
3. **Skill 分數色**：亮色模式改用 `var(--color-brand)` 的深版——GF 模式用 `--gf-600: #CC1671`（對比度 5.1:1），DM 模式由於 data-instrument 修正後會自動取得 `--dm-600: #00C0CC`（對比度 4.7:1）。實作方式：新增 CSS variable `--skill-score-color` 讓兩種 instrument 各自定義，或在 component 內依 `gameType` 選擇。
4. **封面 border**：亮色模式下封面外層 div 加 `border: 1px solid #E2E8F0`（slate-200），圖片容器 `border-radius: 2px`，與暗色模式的漸層 border 同等高度（38×38px）。

## Non-Goals

- 不修改深色模式的任何樣式（僅修正 row shadow 技法，視覺不變）
- 不更改排序的依據欄位（固定為 `averageSkill` 降序）

## Success Criteria

- HOT 第 1 名的 `averageSkill` ≥ 第 2 名，以此類推，OTHER 同
- 切換至 DM tab 後，亮色模式的 active 底線與文字顯示青色（`#00C0CC` 或 `#00F0FF`），不顯示粉色
- 亮色模式 skill 分數對比度 ≥ 4.5:1（白底）
- 亮色模式每首歌的封面圖片（或 placeholder）均有可見的 1px 邊框

## 追加修正（第二輪）

實作過程中發現並修正的額外問題：

5. **封面 border 技法修正**：原方案用 CSS `border` 屬性，但 Tailwind 的 `box-sizing: border-box` 導致 image 溢出覆蓋 border（只顯示左右）。改為與 dark mode 一致的「`padding: 1px` + `background` 顏色」技法：亮色模式 `background: #94A3B8`（slate-400），container 40×40，placeholder 白底 `#FFFFFF`。
6. **Diff badge 跨模式不一致**：dark/light badge 用兩套獨立實作（字級、padding、圓角各異）。統一為單一 `<span>`：`fontSize: 9px`、`padding: 1px 5px`、`borderRadius: 3px`，僅切換顏色方案。
7. **Row 左側 border 造成 3px 位移**：dark mode 的 `borderLeft: 3px solid` 讓 row 內所有元素右移 3px，light mode 無此偏移。改為 `boxShadow: inset 3px 0 0 accentColor`，不佔 layout 空間。
8. **GF/DM tab light mode 無外框**：light mode tab 完全沒有 border，與 dark mode 視覺結構不一致。加入 `1px solid var(--color-border-default)`（inactive）和 `1px solid var(--color-brand)`（active）。
9. **分頁機制**：取消原先「不引入分頁機制」的限制，實作每頁 25 首。HOT + OTHER 合併成 tagged flat array，依 section 動態插入標題，◄ ► 翻頁控制，切換 instrument/scope 自動重置至第 1 頁。

## Impact

- Affected specs: `pian-fen`（排序行為、分頁）、`pian-fen-cover`（亮色 border 技法）、`arcade-neon-design-system`（instrument selector 機制、badge 一致性）
- Affected code:
  - Modified: `src/hooks/usePianFen.ts`
  - Modified: `src/pages/PianFen.tsx`
