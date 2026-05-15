## Context

`SongCard.tsx` 目前用兩欄 layout，左側封面+badge 一欄、右側 `ScoreColumn` 兩欄（家用版/街機版）純文字呈現。需要改成單欄緊湊列，讓視覺與 PianFen RecordRow 一致，同時增加進度條讓達成率可視化。

`SongCardSkeleton.tsx` 需要同步更新骨架結構以防止佈局位移。

## Goals / Non-Goals

**Goals:**
- SongCard 採用 PianFen RecordRow 的精簡列風格
- 街/家成績各一橫列，包含達成率進度條 + skill 數字 + 狀態 badge
- 保留所有現有功能（收藏、編輯、備註、wishlist、HOT/Other 標記）

**Non-Goals:**
- 不改動 Dashboard.tsx 的篩選排序邏輯
- 不引入新的外部依賴

## Decisions

### 進度條填充比例與顏色

進度條寬度 = `achievementRate / 100 * 100%`（max 100%）。

顏色方案：
- 街機版（街）：`var(--neon-pink)` 系列（與 GF 主色一致）
- 家用版（家）：`var(--neon-cyan)` 系列

未遊玩（rate = 0 且 skill = 0）：不顯示進度條，改顯示「—」文字。

### 狀態 badge 規則

| 條件 | badge |
|------|-------|
| `_isExcellent` | EXC（pink） |
| `_isFullCombo && !_isExcellent` | FC（cyan/lime） |
| 未遊玩 | 無 badge，skill 欄顯示「—」 |

注意：`_isExcellent` 和 `_isFullCombo` 是從 `SongData` 衍生的，不區分來源（家/街）。兩列共用同一份 badge 狀態。若未來需要分別記錄，屬於不同 change 的 scope。

### 封面尺寸與 diff border

改為 40×40px（與 PianFen 一致），保留難度色邊框（使用現有 `DIFF_BORDER_COLORS`）。

### Wishlist 目標標籤位置

移至歌名下方第二行（metadata 行右側），以 `text-[10px]` pill 顯示，不佔用成績行空間。

## Risks / Trade-offs

- `_isExcellent` / `_isFullCombo` 欄位不分家/街，badge 顯示可能不精確（現有限制，非本 change scope）
- SongCardSkeleton 需要手動對齊新 layout 的高度，避免資料載入完成時的佈局跳動
