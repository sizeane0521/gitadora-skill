## 1. 修正 sync-kasegi.ts 新增 songs.level_* 更新

- [x] 1.1 修改 Admin Kasegi Sync Script（`scripts/sync-kasegi.ts`），完成 upsert kasegi_records 後，新增 `updateSongsLevel()` function：將同步到的所有 `diff_value > 0` 記錄，依 `part`（G→guitar, B→bass, D→drums）找到 `songs` 表對應行，依 `diff`（BSC/ADV/EXT/MAS）對應 `level_bsc/adv/ext/mas` 欄位，聚合同一 song_id 的多個難度欄位後以 `Promise.all` 批次 UPDATE；`diff_value = 0` 或 null 的記錄跳過不寫。驗證：執行 `npm run sync:kasegi` 後，查詢 Supabase `songs` 表中 GHOST guitar 記錄，`level_mas` 應為 9.2；成績頁 GHOST MAS Guitar 難度數值從 0.00 變為 9.2。
