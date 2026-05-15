## Why

賺分曲（PianFen）頁面目前只顯示文字資訊（曲名、難易度、技能分），玩家在機台上找歌時需要額外記憶或搜索。加入兩項輔助資訊可大幅提升實用性：

1. **封面圖**：讓玩家快速視覺辨識歌曲，減少靠文字記憶的負擔
2. **五十音行標示**：顯示該歌曲在機台 TITLE 搜尋中屬於哪一行（あ行、か行、A-Z 等），讓玩家直接知道要去哪個資料夾找歌

## What Changes

- 每首歌的列表項目加入 40×40 封面縮圖（從 Zetaraku CDN 依歌名查找，找不到時顯示灰色佔位符）
- 每首歌的元資料列（難易度、樂器、定數旁）加入五十音行 badge（如 `ら行`、`か行`、`A-Z`）
- 新增 `useZetarakuSongs` hook：fetch Zetaraku data.json（2.4 MB，快取），建立歌名 → imageName 對照表
- 新增 `src/lib/yomi.ts`：純 JS 判斷片假名/平假名（同步），漢字透過 kuroshiro + kuromoji 轉換（非同步，lazy init），結果快取在 Map 中

## Non-Goals

- 不修改 gsv.fun API 呼叫邏輯
- 不對 Zetaraku 資料做版本控制或持久化快取（每次頁面載入重新 fetch，由瀏覽器 HTTP cache 處理）
- 不為無法找到封面的歌曲做個別 fallback API 查詢

## Capabilities

### New Capabilities

- `pian-fen-cover`: 在 PianFen 頁面每首歌旁顯示封面縮圖，資料來自 Zetaraku CDN（依歌名對應）
- `pian-fen-yomi`: 在 PianFen 頁面每首歌顯示五十音行標示（あ行/か行/…/A-Z），協助玩家在機台 TITLE 搜尋中定位歌曲

### Modified Capabilities

- `pian-fen`: RecordRow 佈局新增封面圖欄位與五十音行 badge

## Impact

- Affected specs: pian-fen-cover（新建）、pian-fen-yomi（新建）、pian-fen（修改 RecordRow 佈局）
- Affected code:
  - New: `src/lib/yomi.ts`
  - New: `src/hooks/useZetarakuSongs.ts`
  - Modified: `src/pages/PianFen.tsx`
- Dependencies added: `kuroshiro`, `kuroshiro-analyzer-kuromoji`, `kuromoji`（已安裝）
