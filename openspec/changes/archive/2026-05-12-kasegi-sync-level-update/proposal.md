## Problem

成績頁（Dashboard）的歌曲難度數值（如 GHOST MAS Guitar = 9.2）顯示為 0.00。`songs.level_*` 欄位是 NULL 或 0，因為 `sync-kasegi.ts` 只寫入 `kasegi_records` 表，沒有同步更新 `songs.level_bsc/adv/ext/mas` 欄位。

## Root Cause

`songs.level_*` 的更新依賴兩個不穩定的時機：
1. Zetaraku sync（部分歌曲 Zetaraku 無難度資料）
2. 玩家自行匯入成績時的 step 3b-2（需要玩家重新觸發）

`kasegi_records.diff_value` 已有正確難度數值（e.g., 9.2），但沒有任何機制將它同步回 `songs.level_*`，造成兩張表資料不一致。

## Proposed Solution

在 `scripts/sync-kasegi.ts` 完成 upsert `kasegi_records` 之後，新增一個 pass：將各歌曲的 `diff_value` 聚合後，批次 UPDATE `songs` 表的對應 `level_*` 欄位（`level_bsc/adv/ext/mas`），以 `title` 和 `instrument` 對應 songs 記錄，只更新 `diff_value > 0` 的欄位，不覆蓋 diff_value = 0 的資料。

## Success Criteria

- 執行 `npm run sync:kasegi` 後，`songs.level_mas` 對 GHOST Guitar 記錄為 9.2
- 成績頁 GHOST MAS Guitar 難度顯示 9.2，不再顯示 0.00
- 難度值為 0 或 null 的記錄不被覆蓋

## Impact

- Affected specs: `kasegi-db-sync`（修改：Admin Kasegi Sync Script 需求）
- Affected code:
  - Modified: scripts/sync-kasegi.ts
