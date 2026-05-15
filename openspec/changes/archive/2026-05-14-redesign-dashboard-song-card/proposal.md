## Summary

將 Dashboard 成績頁的歌曲卡片（SongCard）重新排版，以 Figma 設計稿為基準，把封面與難度 badge 垂直疊放、將「賺分空間」進度條改為行內 badge 顯示，並新增未達標差距標籤。

## Motivation

現行 SongCard 的難度資訊（Guitar / MAS / 9.2）橫排於卡片右側，佔用 info 區的垂直空間；「賺分空間」進度條放在卡片底部，與目標數字分離，視覺上不直觀。重新設計後：
- 封面＋難度 badge 垂直疊放在左欄，info 區獲得更多橫向空間
- 樂器名稱、未達標 badge、目標值收在同一行，讓「落後多少」一目瞭然
- 移除底部 progress bar，降低卡片高度

## Proposed Solution

依照 Figma 設計稿（node-id 54:284）重構 SongCard 排版：

1. **左欄（固定寬 40px）**：封面圖（40×40px）+ 難度徽章（譜面等級標籤 / 難度數值，上下疊放）
2. **右側 info 區**：
   - Row 1：[樂器初始字母方框] 歌曲名稱
   - Row 2：樂器名稱（左對齊）‖ [未達標 badge ―X.X] 目標 XXX.X（右側群組）
   - neon-pink 漸層分隔線
   - Score rows：街 / 家（依 `hideSource` 仍可隱藏其中一行）
3. **未達標 badge 顯示條件**：有 kasegi 目標且 playerSkill < kasegiAvg 時才顯示
4. **差距值**：`kasegiAvg − playerSkill`（與現有計算一致）
5. **移除**：`kasegiBar` progress bar（`potential` / `maxSkill` prop）

## Non-Goals

- 不修改 PianFen 頁的 SongCard 使用方式（PianFen 不傳 `kasegiBar`/`kasegiOverlay`，不受影響）
- 不改變 Dashboard 的排序、篩選、pagination 邏輯

## Impact

- Affected specs: `dashboard-unified-view`, `dashboard-kasegi-overlay`
- Affected code:
  - Modified: `src/components/SongCard.tsx`
  - Modified: `src/pages/Dashboard.tsx`
  - Modified: `src/hooks/usePianFen.ts`
