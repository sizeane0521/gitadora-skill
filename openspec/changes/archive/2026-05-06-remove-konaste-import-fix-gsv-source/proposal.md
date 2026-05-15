## Why

GSV 成績重新匯入時，查詢現有成績的 `source` 篩選條件用 `"gsv"`，但實際插入時 `source` 欄位寫成 `"arcade"`，導致每次重新匯入都因資料已存在而觸發 409 Conflict。另外，家用版 (Konaste) 未來將改用 AI 辨識匯入，現有手動匯入 tab 無作用，應予移除。

## What Changes

- **移除** `/import` 頁面的「家用 (Konaste)」tab 及相關 UI
- **移除** `konasteHistory` 查詢與歷史顯示
- **移除** `:source` 動態路由參數，路由統一改為 `/import`
- **修復** GSV 重新匯入時的 source 不一致：查詢現有成績改為 `.eq("source", "arcade")`
- **修復** `useImportHistory` 的 count query：`.select("id", ...)` 改為 `.select("*", ...)`

## Non-Goals

- 不修改 Dashboard、SongDetail 等頁面對 konaste 資料的顯示邏輯（DB 中的舊資料仍需正確顯示）
- 不刪除資料庫中 source = "konaste" 的既有成績資料
- 不修改 `score-import` spec 中與 bookmarklet 相關的 konaste 能力定義

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `gsv-import`: 修正重新匯入時 source 欄位不一致的行為，並移除 Konaste tab

## Impact

- Affected code:
  - Modified: `src/pages/Import.tsx`
  - Modified: `src/App.tsx`
