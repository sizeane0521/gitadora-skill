## Why

專案目前沒有任何關於 `songs` 表（歌曲主資料）的規格文件。songs 表的欄位定義、欄位意義、以及新增的 `instrument`、`reading`、`category`、`tags` 欄位完全缺乏正式記錄，導致未來任何欄位變更都沒有規格可以依循。此外，歌曲數量龐大，需要一個可以批次匯入歌單的機制。

## What Changes

- 建立 `song-master` spec，正式定義 `songs` 表的所有欄位規格與用途
- 補充已在 Supabase 執行的欄位擴充（`instrument`、`reading`、`category`、`tags`）進入規格
- 定義 CSV 批次匯入歌單的格式規範與行為

## Non-Goals

- 不包含玩家成績匯入（由 `score-import` 負責）
- 不包含歌曲頁面的 UI 設計（由 `score-list` spec 中的 SongDetail 覆蓋）
- CSV 匯入工具為一次性本地腳本，不建置管理後台 UI

## Capabilities

### New Capabilities

- `song-master`: 定義 songs 表的完整欄位規格（含 instrument/reading/category/tags），以及 CSV 批次匯入歌單的格式與行為

### Modified Capabilities

（無）

## Impact

- Affected specs: `song-master`（新增）
- Affected code:
  - New: `supabase/migrations/002_songs_metadata_columns.sql`
  - New: `scripts/import-songs.ts`（CSV 匯入腳本）
  - Modified: `src/types/database.ts`（SongRow、SongUpdate 補充新欄位）
