## Why

目前賺分曲（PianFen）頁面每次打開都即時向 gsv.fun GraphQL API 發請求，架構上所有資料應從 DB 提供。玩家沒有辦法知道賺分曲資料的新鮮度，且 gsv.fun 若有異動會直接影響功能。此外，玩家匯入成績後部分歌曲難度仍顯示 0.00，因為 gsv.fun 匯入時沒有把 `diff_value` 寫進 songs 表的 `level_*` 欄位。

## What Changes

- 新增 `kasegi_records` DB 表，存儲管理者同步的賺分曲資料（scope × game_type × 歌曲 × 難度）
- 新增 DB migration SQL 檔（migration 007）
- 新增 `scripts/sync-kasegi.ts` 腳本：向 gsv.fun 抓全部 12 個 scope × GF/DM 賺分曲資料，upsert 進 `kasegi_records`
- `src/pages/Import.tsx` 管理者區塊：新增「同步歌曲」與「同步賺分曲」按鈕（只對管理者帳號顯示），以及賺分曲資料最後更新日期（所有玩家可見）
- `src/pages/PianFen.tsx` 改從 `kasegi_records` 讀資料，不再即時打 gsv.fun API
- `src/hooks/usePianFen.ts` 新增從 Supabase 讀取的版本（`useKasegiFromDB`），舊的 API fetch 版本保留備用
- `src/pages/Import.tsx` 玩家匯入成績時，順便把 `diff_value` 寫進 `songs.level_*` 欄位
- `src/pages/Dashboard.tsx` 改用 `useKasegiFromDB`，確保成績頁「目標」數字與賺分曲頁資料來源一致
- `src/pages/Dashboard.tsx` 修正 `kasegiMap` key 加入 `part`，避免 Guitar/Bass 同首歌互蓋目標數值
- `src/components/SongCard.tsx` 在目標技能分旁加上「目標」標籤文字

## Non-Goals

- 不自動排程同步（管理者手動觸發）
- 不同步 `averagePlayerSkill` 至前端顯示（存入 DB 但不顯示）
- 不改動成績匯入的主流程（只加 level 寫入）

## Capabilities

### New Capabilities

- `kasegi-db-sync`: 管理者同步賺分曲資料至 DB，PianFen 頁從 DB 讀取，Import 頁顯示最後更新日期

### Modified Capabilities

- `pian-fen`: 資料來源改為 DB（kasegi_records），不再即時 fetch gsv.fun
- `gsv-import`: 匯入成績時同步寫入 songs.level_* 欄位

## Impact

- Affected specs: `kasegi-db-sync`（新增）、`pian-fen`（修改）、`gsv-import`（修改）
- Affected code:
  - New: `supabase/migrations/007_kasegi_records.sql`
  - New: `scripts/sync-kasegi.ts`
  - Modified: `src/pages/PianFen.tsx`
  - Modified: `src/hooks/usePianFen.ts`
  - Modified: `src/pages/Import.tsx`
  - Modified: `src/pages/Dashboard.tsx`
  - Modified: `src/components/SongCard.tsx`
