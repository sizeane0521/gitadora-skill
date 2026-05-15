## Context

`songs` 表是整個系統的歌曲主資料表，所有成績（`scores`）和賺分曲計算（`kasegi`）都依賴它。目前表中已有基本欄位，並已於 Supabase 生產環境執行 ALTER TABLE 新增 `instrument`、`reading`、`category`、`tags` 四個欄位，但本地 migration 和規格文件都沒有同步更新。歌曲數量龐大（Gitadora GF/DM 歷代曲目），需要一個批次匯入機制。

## Goals / Non-Goals

**Goals:**
- 正式化 `songs` 表所有欄位的規格定義
- 補齊 `supabase/migrations/002_songs_metadata_columns.sql`（已建立）
- 定義 CSV 匯入格式，讓歌單可以批次 upsert 進資料庫
- 建立本地 TypeScript 腳本 `scripts/import-songs.ts` 執行匯入

**Non-Goals:**
- 不建置管理後台 UI（CSV 匯入為開發者工具）
- 不實作歌曲刪除（避免影響現有成績外鍵）
- 不處理封面圖片自動下載（`cover_url` 欄位手動填寫）

## Decisions

### CSV 欄位格式使用英文 header

CSV 欄位名稱直接對應資料庫欄位名稱（英文），避免中文 header 在不同試算表軟體的編碼問題。

必要欄位：`konami_song_id,title,artist,game_type,level_bsc,level_adv,level_ext,level_mas`
選填欄位：`cover_url,version,instrument,reading,category,tags`

選填欄位若為空白則寫入 NULL，不報錯。

**替代方案考慮**：使用中文 header（曲名、藝術家…）→ 拒絕，因為編碼風險和 schema mapping 不直觀。

### 使用 upsert（ON CONFLICT DO UPDATE）而非 INSERT

以 `konami_song_id` 為衝突鍵做 upsert，讓腳本可以安全重複執行，更新已存在的歌曲資料而不報錯。

**替代方案考慮**：每次先清空再全量 INSERT → 拒絕，因為會斷開現有 `scores` 外鍵關聯。

### 腳本使用 Supabase Admin Key（Service Role）

匯入腳本在本地執行，使用 `SUPABASE_SERVICE_ROLE_KEY` 繞過 RLS，讓開發者可以直接寫入 songs 表。這個 key 不進 repo，透過 `.env.local` 傳入。

**替代方案考慮**：使用 anon key + RLS 政策開放寫入 → 拒絕，songs 是主資料，不應開放一般使用者寫入。

### `game_type` 欄位為 GF 或 DM 其中一個

每首歌曲對應單一 game_type，GF 曲和 DM 曲分開儲存（即使曲名相同）。CSV 每行代表一首曲子在一個 game_type 下的難度資料。

## Risks / Trade-offs

- [Risk] 生產環境已執行 ALTER TABLE，但 migration 002 若再次套用會因 `IF NOT EXISTS` 安全跳過 → 無破壞性風險
- [Risk] CSV 格式錯誤（如 `game_type` 值不是 GF/DM）會導致 upsert 失敗 → 腳本在上傳前做欄位驗證，逐行報錯
- [Risk] `konami_song_id` 來源不統一（bookmarklet 抓取的 ID 需與 CSV 中的 ID 一致）→ 規格中明確定義 ID 格式為 Konami 官網的歌曲識別碼
