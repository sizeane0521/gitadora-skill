<!--
Each task description MUST state:
- the behavior or contract being delivered (what is observably true when the
  task is complete), and
- the verification target that proves completion (test, CLI invocation,
  analyzer check, manual assertion, or content review).

File paths are supporting context for locating the work, never the task
itself. "Edit file X" is not a valid task — it is missing both behavior and
verification.
-->

## 1. 資料庫 Migration

- [x] 1.1 建立 `supabase/migrations/007_kasegi_records.sql`：Kasegi Records Database Table（kasegi_records 表結構）須包含所有欄位（scope, game_type, category, song_title, diff, part, diff_value, average_skill, player_percent, player_count, average_player_skill, synced_at），並設置 UNIQUE constraint、RLS SELECT policy、GRANT SELECT TO anon/authenticated、GRANT ALL TO service_role。驗證：在本機執行 `supabase db reset` 或直接檢視 SQL 語法無誤。

## 2. 同步腳本與 npm script

- [x] 2.1 建立 `scripts/sync-kasegi.ts`：Admin Kasegi Sync Script（sync-kasegi.ts 腳本邏輯），讀取 `.env.local` 的 `VITE_SUPABASE_URL` 與 `SUPABASE_SERVICE_ROLE_KEY`，對 12 個 SCOPE_TIERS × GF/DM = 24 組合向 gsv.fun `kasegiNew` GraphQL API 批次（每批 6）並行 fetch，以頂層 `node.count` 計算 `player_percent`，將 HOT/OTHER 記錄 upsert 進 `kasegi_records`（`ON CONFLICT DO UPDATE`），錯誤時 log 並繼續，完成後輸出同步時間與總記錄數。驗證：`npm run sync:kasegi` 執行後無失敗組合且 DB 有資料。

- [x] 2.2 在 `package.json` 新增 `"sync:kasegi"` npm script（`node --env-file=.env.local --import=tsx scripts/sync-kasegi.ts`）。驗證：`npm run` 輸出中可見 `sync:kasegi`。

## 3. PianFen Hook 改用 DB

- [x] 3.1 在 `src/hooks/usePianFen.ts` 新增 `useKasegiFromDB(gameType, scope, sortBy)` hook：Fetch Community Pian-Fen Data 來源改為 `kasegi_records` Supabase 表，查詢條件 `WHERE game_type = ? AND scope = ?`，回傳型別與既有 `PianFenData`（`{ hot: PianFenRecord[], other: PianFenRecord[], totalCount }`）相同，欄位映射：category→hot/other 分組, song_title, diff, part, diff_value→level, average_skill, player_percent。驗證：TypeScript 型別相容且無編譯錯誤（`npx tsc --noEmit`）。

## 4. PianFen 頁面切換資料來源

- [x] 4.1 修改 `src/pages/PianFen.tsx`：Fetch Community Pian-Fen Data from gsv.fun 改為從 DB 讀取，將 `usePianFen` 替換為 `useKasegiFromDB`，PianFen 頁改用 DB，頁面不再直接 fetch gsv.fun；當 `kasegi_records` 無該 scope/game_type 資料時顯示「賺分曲資料尚未同步，請管理者執行同步」。驗證：瀏覽器開啟 PianFen 頁，Network tab 無 gsv.fun 請求；DB 無資料時顯示提示文字。

## 5. Import 頁面：同步日期顯示

- [x] 5.1 在 `src/pages/Import.tsx` 新增 Import Page Sync Date Display：所有已登入使用者可見「賺分曲資料：YYYY/MM/DD」（從 `kasegi_records` 查詢 `MAX(synced_at)` 格式化為 YYYY/MM/DD）；無資料時顯示「賺分曲：尚未同步」。驗證：Import 頁有資料時正確顯示日期，無資料時顯示佔位文字。

## 6. Import 頁面：管理者同步區塊

- [x] 6.1 在 `src/pages/Import.tsx` 新增 Admin Sync UI on Import Page（Admin 判斷、Import 頁結構）：以 `user?.email === import.meta.env.VITE_ADMIN_EMAIL` 判斷，管理者帳號可見包含「同步 Zetaraku 歌曲（npm run sync:songs）」與「同步賺分曲（npm run sync:kasegi）」指令提示的管理者區塊；非管理者帳號不顯示此區塊。驗證：以 `sizeane0521@gmail.com` 登入可見區塊；以其他帳號登入不可見。

## 7. Import 匯入時寫入 songs.level_*

- [x] 7.1 修改 `src/pages/Import.tsx` 成績匯入流程：Arcade Score DOM Scraping 擴充，diff_value → level_* 寫入（Import.tsx），Step 3b 後新增 Step 3b-2，對每筆 `diff_value > 0` 的記錄，依 diff 對應 `level_bsc/adv/ext/mas` 欄位，以 `Promise.all` 批次 UPDATE `songs` 表；`diff_value = 0` 或缺失時不更新。驗證：匯入含 `diff_value = 9.2` 的 MAS 難度成績後，對應 songs 記錄的 `level_mas` 為 9.2；`diff_value = 0` 的記錄不觸發 UPDATE。

## 8. Dashboard 成績頁改用 DB 資料來源

- [x] 8.1 修改 `src/pages/Dashboard.tsx`：將 `usePianFen` 替換為 `useKasegiFromDB`，確保成績頁「目標」數字與賺分曲頁來源一致（同為 `kasegi_records`）；不再對 gsv.fun 發請求。驗證：同段位同首歌，成績頁目標數字與賺分曲頁平均技能分相同。

- [x] 8.2 修正 `src/pages/Dashboard.tsx` 的 `kasegiMap` key：加入 `part`（`歌曲名稱|難度|part`），避免同首歌 Guitar 與 Bass 的目標分互蓋。對應查詢時 `overlayKey` 亦加入 `instrPart`（guitar→G、bass→B、drums→D）。驗證：GHOST MAS Guitar 顯示 Guitar 的 `average_skill`，不被 Bass 數值覆蓋。

## 9. SongCard 目標標籤

- [x] 9.1 修改 `src/components/SongCard.tsx` 的 `kasegiOverlay` 區塊：在技能分數值左側加入「目標」灰色小標籤，讓玩家明確知道該數字代表社群平均目標值。驗證：成績頁各卡片右上角顯示「目標 XXX.X」格式。
