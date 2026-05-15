## 1. 更新 useGsvImport.ts — 換用 user query

- [x] 1.1 在 `src/hooks/useGsvImport.ts` 新增 `GSV_USER_QUERY`，使用 `user(playerId: Int, type: GameType, version: Version)` query，欄位包含 `guitarSkill { hot { data {...} } other { data {...} } }` 和 `drumSkill { hot { data {...} } other { data {...} } }`（SkillRecord 欄位與原本相同：`name part diff skill_value achive_value diff_value`）
- [x] 1.2 在 `src/hooks/useGsvImport.ts` 新增 `queryUserSkill(playerId: number, type: "g" | "d")` 函式，呼叫 `GSV_USER_QUERY`，type 為 `"g"` 時回傳 `guitarSkill.hot.data + guitarSkill.other.data`，type 為 `"d"` 時回傳 `drumSkill.hot.data + drumSkill.other.data`
- [x] 1.3 在 `src/hooks/useGsvImport.ts` 新增 `fetchGsvPlayerScores(playerId: number)` 函式，並行呼叫 `queryUserSkill(playerId, "g")` 和 `queryUserSkill(playerId, "d")`，合併去重後回傳，錯誤訊息改為「找不到此玩家 ID 的資料，請確認 gsv.fun 個人頁面 URL 中的數字是否正確」
- [x] 1.4 保留原本的 `fetchGsvSkillScores`（snapshot ID 版）及 `querySavedSkill` 不刪除，避免影響其他潛在使用者（此 change 只新增，不刪舊）

## 2. 更新 Import.tsx — 改用 player ID

- [x] 2.1 在 `src/pages/Import.tsx` 將 import 從 `fetchGsvSkillScores` 改為 `fetchGsvPlayerScores`
- [x] 2.2 將 `gsvSkillId` state 重新命名為 `gsvPlayerId`，localStorage key 從 `siz_gsv_skill_id` 改為 `siz_gsv_player_id`（符合 GSV.fun Player Score Import 持久化規格）
- [x] 2.3 更新 UI 說明文字：改為「輸入 gsv.fun 玩家 ID（固定不變，位於個人頁面 URL 中，例：gsv.fun/zh/galaxywave_delta/1935/p 中的 1935）」
- [x] 2.4 更新 input placeholder：改為「玩家 ID，例：1935」

## 3. DB Migration

- [x] 3.1 新增 `supabase/migrations/006_scores_add_game_type_to_unique.sql`，將 scores 的 unique constraint 從 `(user_id, song_id, difficulty, source)` 改為 `(user_id, song_id, game_type, difficulty, source)`，使同一首歌的 GF 和 DM 成績能各自獨立存在
- [x] 3.2 在 Supabase Dashboard SQL Editor 執行 migration，確認成功

## 4. 驗證

- [x] 4.1 確認 `/import` 頁面說明文字、input placeholder 顯示正確
- [x] 4.2 用 player ID 匯入，確認全部 83 首成績同步成功（無 409 失敗）
- [x] 4.3 再次點擊匯入，確認全部更新、無失敗
