## Why

gsv.fun 匯入功能在兩種情況下會失效：一是 `fetch` 呼叫缺乏 timeout 保護，當 gsv.fun 回應緩慢時按鈕會無限卡在「匯入中…」狀態；二是 `songs` 表在執行 `npm run sync:songs` 之前為空，導致所有成績因找不到對應歌曲而靜默失敗。

## What Changes

- `src/hooks/useGsvImport.ts`：新增 `fetchWithTimeout` 輔助函式（15 秒 AbortController），取代兩處裸 `fetch` 呼叫（`queryUserSkill`、`querySavedSkill`）
- `npm run sync:songs`：首次部署或 songs 表為空時須執行，屬操作面修正（文件確認），非程式碼修改

## Non-Goals

- 不修改 songs 表的 RLS 權限（INSERT/UPDATE 仍限 service role，由 sync 腳本管理）
- 不為 category 更新失敗加入使用者可見的錯誤回饋（靜默失敗為預期行為）
- 不修改 timeout 值以外的網路重試邏輯

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `gsv-import`：gsv.fun GraphQL fetch 須有 timeout 保護；當 timeout 觸發時，catch 區塊應呈現「連線失敗」toast 並解除 loading 狀態

## Impact

- Affected code:
  - Modified: `src/hooks/useGsvImport.ts`
