## Context

賺分曲（PianFen）目前靠 `usePianFen` hook 即時 fetch gsv.fun `kasegiNew` GraphQL API。這個 API 需要 `scope`（技能段位）、`type`（GF/DM）、`version` 三個參數，有 12 個 scope × 2 種樂器 = 24 種組合。本次改動將管理者預先同步所有組合到 `kasegi_records` 表，前端改從 DB 讀取。

## Goals / Non-Goals

**Goals:**
- 新增 `kasegi_records` DB 表存儲賺分曲資料
- 新增 `scripts/sync-kasegi.ts` 腳本讓管理者手動同步
- Import 頁新增管理者同步按鈕（判斷 `user.email === VITE_ADMIN_EMAIL`）
- Import 頁所有玩家可見「賺分曲資料最後更新：YYYY/MM/DD」
- PianFen 頁改從 `kasegi_records` 讀資料
- 玩家匯入成績時同步寫入 `songs.level_*` 欄位

**Non-Goals:**
- 不自動排程同步
- 不顯示 `average_player_skill`（存入 DB 但前端不用）
- 不改動 PianFen 頁面的視覺設計

## Decisions

### kasegi_records 表結構

```sql
CREATE TABLE kasegi_records (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  scope          integer NOT NULL,           -- 6750 ~ 9500
  game_type      text NOT NULL,              -- 'GF' or 'DM'
  category       text NOT NULL,              -- 'HOT' or 'OTHER'
  song_title     text NOT NULL,
  diff           text NOT NULL,              -- 'BSC'/'ADV'/'EXT'/'MAS'
  part           text NOT NULL,              -- 'G'/'B'/'D'
  diff_value     numeric(4,2),
  average_skill  numeric(8,2),
  player_percent numeric(6,2),
  player_count   integer,
  average_player_skill numeric(10,2),        -- stored, not displayed
  synced_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scope, game_type, category, song_title, diff, part)
);
ALTER TABLE kasegi_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kasegi_select_all" ON kasegi_records FOR SELECT USING (true);
```

### sync-kasegi.ts 腳本邏輯

1. 讀取 `.env.local` 的 `VITE_SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY`
2. 對 12 個 `SCOPE_TIERS` × `["g","d"]` = 24 次向 gsv.fun `kasegiNew` 發請求（並行批次，每批 6 個）
3. 每筆記錄：`name`→`song_title`、`diff`→大寫、`part`→`G/B/D`、`diffValue`→`diff_value`、`averageSkill`→`average_skill`、`count/totalCount`→`player_percent`、`count`→`player_count`、`averagePlayerSKill`→`average_player_skill`
4. 每個 scope × game_type 組合同時 upsert HOT 和 OTHER（`ON CONFLICT (scope, game_type, category, song_title, diff, part) DO UPDATE`）
5. 完成後輸出：同步時間、總記錄數

新增 `package.json` script：`"sync:kasegi": "node --env-file=.env.local --import=tsx scripts/sync-kasegi.ts"`

### Admin 判斷

`VITE_ADMIN_EMAIL` 環境變數存在 `.env.local`，值為管理者 email。Import 頁以 `user?.email === import.meta.env.VITE_ADMIN_EMAIL` 判斷是否顯示管理者區塊。

### Import 頁結構

**管理者區塊**（僅管理者帳號可見）：
- 「同步 Zetaraku 歌曲」按鈕：呼叫 Supabase Edge Function 或提示管理者執行 `npm run sync:songs`
- 「同步賺分曲」按鈕：呼叫 Supabase Edge Function 或提示管理者執行 `npm run sync:kasegi`

> 注意：因為 service_role key 不能暴露在前端，管理者按鈕在 Phase 1 只顯示提示文字（指引管理者在 terminal 跑腳本），UI 按鈕作為視覺入口。Edge Function 整合列為未來改動。

**賺分曲資料最後更新**（所有玩家可見）：
從 `kasegi_records` 查詢 `MAX(synced_at)` 顯示為日期（`YYYY/MM/DD`）。若無資料則顯示「尚未同步」。

### PianFen 頁改用 DB

新增 hook `useKasegiFromDB(gameType, scope, sortBy)` 從 `kasegi_records` 查詢：
```
SELECT * FROM kasegi_records
WHERE game_type = ? AND scope = ? AND part IN (allowed_parts)
```
回傳格式與現有 `PianFenData` 相同（`{ hot: PianFenRecord[], other: PianFenRecord[], totalCount }`）。

`PianFen.tsx` 把 `usePianFen` 替換為 `useKasegiFromDB`。若查詢結果為空，顯示「賺分曲資料尚未同步，請管理者執行同步」提示。

### diff_value → level_* 寫入（Import.tsx）

在玩家成績匯入 Step 3b 之後加入 Step 3b-2：
- 對每筆有 `diff_value > 0` 的記錄，找到對應的 `songMap.get("name|part")` 取得 song_id
- 以 `mapDiff(r.diff)` 取得難度欄名（`level_bsc/adv/ext/mas`）
- 按 song_id 聚合所有難度欄位，以 `Promise.all` 批次 UPDATE songs 表

## Risks / Trade-offs

- [Risk] 管理者按鈕 Phase 1 只顯示提示，不能直接觸發同步 → Mitigation: 明確標示「請在 terminal 執行」，後續可改為 Edge Function
- [Risk] PianFen 若 kasegi_records 為空則無法顯示 → Mitigation: 顯示「尚未同步」提示，而非空白或 error
- [Risk] kasegi_records UNIQUE constraint 在大量 upsert 時需確保 diff 大寫一致 → Mitigation: sync 腳本統一做 `diff.toUpperCase()`
