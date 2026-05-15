## 1. Songs Table Schema Definition

- [x] 1.1 確認 `supabase/migrations/002_songs_metadata_columns.sql` 已建立，包含 `instrument`（CHECK IN guitar/bass/drums）、`reading`、`category`（CHECK IN HOT/Other）、`tags` 四個欄位，滿足 Songs Table Schema Definition 規格
- [x] 1.2 更新 `src/types/database.ts` 的 `SongUpdate` type，加入 `instrument`、`reading`、`category`、`tags` 四個可更新欄位

## 2. Song Record Uniqueness

- [x] 2.1 確認 `songs` 表的 `konami_song_id` 欄位有 UNIQUE constraint（Song Record Uniqueness），相同 title 在 GF/DM 可各自存在不同 row

## 3. CSV Import Format

- [x] 3.1 建立 `scripts/import-songs.ts`：依照 CSV Import Format 規格，讀取 UTF-8 CSV 檔案，解析 header row，驗證必要欄位（`konami_song_id`、`title`、`game_type`）是否存在，若缺少則 exit with error
- [x] 3.2 實作 CSV 欄位格式使用英文 header 的驗證：`game_type` 欄位為 GF 或 DM 其中一個，`instrument` 限 guitar/bass/drums，`category` 限 HOT/Other，空值轉換為 null
- [x] 3.3 建立 `scripts/songs-template.csv`：包含完整 header row 和一列範例資料，header 使用英文欄位名稱對應資料庫欄位

## 4. CSV Import Upsert Behavior

- [x] 4.1 實作使用 upsert（ON CONFLICT DO UPDATE）而非 INSERT 的邏輯：以 `konami_song_id` 為衝突鍵，on conflict 更新所有欄位（CSV Import Upsert Behavior）
- [x] 4.2 腳本使用 Supabase Admin Key（Service Role）：從環境變數 `SUPABASE_SERVICE_ROLE_KEY` 讀取 key 以繞過 RLS 執行寫入
- [x] 4.3 在 `package.json` 加入 script：`"import:songs": "npx tsx scripts/import-songs.ts"`

## 5. CSV Import Error Reporting

- [x] 5.1 實作 CSV Import Error Reporting：驗證失敗的列印出行號與原因後跳過該列，繼續處理剩餘列
- [x] 5.2 匯入結束後印出 summary：`Import complete: N inserted, M updated, K skipped`
