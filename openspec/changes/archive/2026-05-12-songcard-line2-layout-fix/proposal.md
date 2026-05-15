## Why

`SongCard` 的 Line 2（難度/樂器/數值列）使用 `justify-between` 排版，造成三個問題：

1. **標籤跑掉**：`justify-between` + 條件式元素（目標、wishlist badge）會在不同卡片間產生不一致的排版。有條件元素的卡片和沒有的卡片，相同的欄位出現在不同水平位置。
2. **難度與數值分離**：diff badge（如 `MAS`）和難度數值（如 `7.10`）是描述同一個譜面的兩個部分，視覺上應是一體的，但目前作為獨立 flex item 被均分。
3. **顯示順序錯誤**：目前順序是 `[MAS] [Guitar] [7.10]`，但邏輯上應是「樂器」在前，「難度+數值」在後 —— 因為使用者先選樂器（Guitar/Bass），再選難度（MAS/EXT...）。

## What Changes

Line 2 改為兩端固定佈局：

- 左側：樂器名稱（`Guitar` / `Bass` / `Drums`）
- 右側：diff badge + 難度數值 包成一個 flex group，視覺上不可分割

條件元素（目標 badge、wishlist badge）插入在右 group 左側，不影響兩端固定的主體結構。

新順序：`[Guitar]  ⟵spacing⟶  [MAS 7.10]`

## Non-Goals

- 不修改 Line 1（歌名、操作按鈕）
- 不修改 ScoreRow（街/家分數列）
- 不修改 kasegi bar
- 不處理 Issue 1（GF 列表出現 DM 標籤的資料污染問題）

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `score-list`: SongCard Line 2 顯示順序與群組方式改變 — 樂器左對齊，diff badge + 難度數值右側群組化

## Impact

- Affected specs: `score-list`
- Affected code:
  - Modified: `src/components/SongCard.tsx`
