## 1. 實作 GSV.fun API Fetch Timeout（對應 spec: GSV.fun API Fetch Timeout）

- [x] 1.1 實作「GSV.fun API Fetch Timeout」：在 `src/hooks/useGsvImport.ts` 新增 `fetchWithTimeout(url, options, ms=15000)` 輔助函式，使用 AbortController 於 15 秒後取消請求；驗證：`queryUserSkill`、`querySavedSkill` 兩者皆改呼叫 `fetchWithTimeout` 而非裸 `fetch`（已完成）
- [x] 1.2 當 timeout 觸發時，`Import.tsx` 的 catch 區塊正確呼叫 `setGsvImporting(false)` 並顯示 destructive toast「匯入失敗 / gsv.fun 連線失敗，請稍後再試」；驗證：模擬 slow network 後按鈕恢復可點擊且 toast 出現（已完成）

## 2. 確認 songs 表初始化流程

- [x] 2.1 確認 `npm run sync:songs` 必須在首次匯入前執行；驗證：執行後 Supabase songs 表行數 > 0（本次已執行，新增 2,615 筆）
