## Why

玩家在使用「賺分曲」頁面時，需要手動記憶哪些歌是賺分推薦、再切回「成績」頁確認自己有沒有玩過、分數如何。兩個頁面之間的來回切換讓比較過程繁瑣。此外，成績頁目前仍保留 BSC/ADV/EXT/MAS 難度篩選chips，對大多數玩家用處不大。

## What Changes

- 成績頁 header 加入分段選擇器（預設 7000，範圍同賺分曲頁的 SCOPE_TIERS），選擇後 fetch 對應分段的賺分曲資料
- 每張 SongCard 若命中當前分段的賺分曲清單，顯示「賺」badge 及該歌在此分段的社群平均 Skill（`averageSkill`）
- 移除成績頁篩選列的 BSC/ADV/EXT/MAS 難度篩選 chips

## Capabilities

### New Capabilities

- `dashboard-kasegi-overlay`: 成績頁賺分曲對照標記（分段選擇器、SongCard badge、averageSkill 顯示）

### Modified Capabilities

- `dashboard-unified-view`: header 加入 scope 選擇器；移除難度篩選 chips
- `score-list`: 移除 BSC/ADV/EXT/MAS 難度篩選

## Impact

- Affected specs: `dashboard-kasegi-overlay`（新增）、`dashboard-unified-view`（修改）、`score-list`（修改）
- Affected code:
  - Modified: `src/pages/Dashboard.tsx`
  - Modified: `src/components/SongCard.tsx`
