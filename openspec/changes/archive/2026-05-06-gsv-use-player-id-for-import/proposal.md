## Why

目前匯入頁面要求使用者每次都手動輸入 gsv.fun 的 **snapshot ID**（每次點「保存当前skill表」就會變動），造成每次打完街機都要去 gsv.fun 複製新數字再回來貼上。gsv.fun GraphQL API 提供 `user(playerId)` query，可用玩家的**持久 player ID**（URL 中固定的數字，如 `gsv.fun/zh/galaxywave_delta/1935/p` 的 `1935`）直接取得最新成績，不需要每次更新 ID。

## What Changes

- **移除** snapshot ID 輸入欄位，改為 **player ID 輸入欄位**（只需設定一次）
- **替換** `savedSkill(skillId)` query 為 `user(playerId)` query
- **更新** 資料路徑：`skill.hot/other.data` → `guitarSkill.hot/other.data`（GF）、`drumSkill.hot/other.data`（DM）
- **更新** localStorage key：`siz_gsv_skill_id` → `siz_gsv_player_id`
- **更新** UI 說明文字，指引使用者從 gsv.fun 個人頁面 URL 找到 player ID

## Non-Goals

- 不實作自動定時同步（使用者仍需手動點擊「匯入」按鈕）
- 不儲存或顯示歷史 snapshot 清單
- 不修改成績資料的後續處理邏輯（deduplication、source 欄位等維持現狀）

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `gsv-import`: 改用 `user(playerId)` query 取代 `savedSkill(skillId)`，player ID 持久化

## Impact

- Affected code:
  - Modified: `src/hooks/useGsvImport.ts`
  - Modified: `src/pages/Import.tsx`
