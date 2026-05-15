## 1. 修復 GSV 重新匯入 source 不一致（Bug Fix）

- [x] 1.1 修正 GSV.fun Player Score Import 的 re-import deduplication bug：在 `src/pages/Import.tsx` 的 Step 4（查詢現有成績）將 `.eq("source", "gsv")` 改為 `.eq("source", "arcade")`，使重新匯入時能正確比對現有資料
- [x] 1.2 在 `src/pages/Import.tsx` 的 `useImportHistory` count query 將 `.select("id", { count: "exact", head: true })` 改為 `.select("*", { count: "exact", head: true })`，修正 GET 400 Bad Request

## 2. 移除 Konaste Import Tab

- [x] 2.1 在 `src/pages/Import.tsx` 移除 `useParams`、`currentSource`、`navigate` 用於 tab 切換的所有相關程式碼
- [x] 2.2 在 `src/pages/Import.tsx` 移除 `konasteHistory` query 及其 JSX 顯示
- [x] 2.3 在 `src/pages/Import.tsx` 移除 tab 導覽列（arcade/konaste 兩個按鈕），確保頁面只顯示 GSV import 區塊（符合 "no Konaste tab" 規格）
- [x] 2.4 在 `src/pages/Import.tsx` 移除 `{ cn }` import（tab 移除後不再使用）
- [x] 2.5 在 `src/App.tsx` 將原本的兩條路由（`/import` redirect 和 `/import/:source`）合併為單一路由 `/import`

## 3. 驗證

- [x] 3.1 啟動 dev server，確認 `/import` 頁面正確顯示：只有 GSV import 區塊、無 Konaste tab、歷史記錄正常顯示
- [x] 3.2 用相同 skill ID 重新匯入，確認無 409 Conflict，成績正確更新而非重複插入
