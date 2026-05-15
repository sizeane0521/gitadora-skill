## Why

賺分曲（PianFen）頁面原本將 HOT 與 OTHER 混合在同一個分頁列表中，造成 OTHER 區塊實際上不可見。API 已回傳玩家使用比例資料但未被使用。此外頁面的視覺設計（行間距、封面邊框、五十音分類標籤、卡片底色）也需要改善，以提升資訊密度與遊戲感。同時 Kuroshiro/Kuromoji 的日文轉換在瀏覽器環境中因 Node.js 模組不相容而完全無法運作，導致所有漢字歌名被誤分類為 A-Z。

## What Changes

- HOT 與 OTHER 改為 Tab 切換（各自獨立分頁，每頁 25 筆）
- 新增 `percent` 欄位（來自 API totalCount），顯示玩家使用比例
- 預設排序改為玩家%，並提供「技能分 / 玩家%」切換控制
- RecordRow 視覺全面重設計：Guitar/Bass 不同顏色、封面邊框依難度色、行間距 6px、移除左邊 border 線、song card 加深色底色
- yomi 五十音 badge 移至歌名前方（同一行）、固定尺寸 20×16px、單字顯示（不含「行」字）、改為 pill 樣式
- HOT/OTHER tab 列下方加漸層分隔線（neon pink/cyan → transparent）
- Kuromoji 瀏覽器相容性修復：安裝 `path-browserify`、別名 `kuromoji` → browser build、Vite middleware 防止 `.dat.gz` 被自動解壓

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `pian-fen`: HOT/OTHER tab 切換；percent 欄位；排序切換（預設玩家%）；RecordRow 視覺重設計；yomi badge 重設計與位置；Kuromoji 瀏覽器修復

## Impact

- Affected specs: `pian-fen`
- Affected code:
  - Modified: `src/hooks/usePianFen.ts`
  - Modified: `src/pages/PianFen.tsx`
  - Modified: `src/lib/yomi.ts`
  - Modified: `vite.config.ts`
  - New: `public/dict/*.dat.gz` (12 kuromoji 字典檔)
  - New: `node_modules/path-browserify` (devDependency)
