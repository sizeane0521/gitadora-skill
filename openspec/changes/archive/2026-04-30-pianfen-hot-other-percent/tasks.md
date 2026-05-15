## 1. 更新 usePianFen hook 資料模型

- [x] 1.1 在 `src/hooks/usePianFen.ts` 的 `PianFenRecord` interface 新增 `percent: number` 欄位（PianFen Player Percent Field）
- [x] 1.2 在 `src/hooks/usePianFen.ts` 的 `PianFenData` interface 新增 `totalCount: number` 欄位；在 usePianFen 計算 percent 並儲存於 PianFenRecord（totalCount > 0 guard）

## 2. 實作排序模式切換（hook 層）

- [x] 2.1 `usePianFen` 新增 `sortBy: "skill" | "percent"` 參數（預設 `"percent"`）；實作 PianFen List Sort Order：hook 層負責排序，sortBy 決定比較函式（skill 降冪 / percent 降冪）
- [x] 2.2 queryKey 包含 `sortBy` 以使不同排序模式各自快取；排序切換以 sortBy state 控制，hook 層負責排序

## 3. 更新 PianFen.tsx 狀態管理

- [x] 3.1 將 HOT / OTHER 分開維護各自的 page state：單一 `page` state 替換為 `hotPage` / `otherPage` 各自獨立的 `useState<number>(1)`
- [x] 3.2 新增 `sortBy` state（預設 `"percent"`）傳遞給 `usePianFen`（PianFen Sort Mode Toggle）
- [x] 3.3 instrument / scope 變更時同步 reset 所有 page state 為 1（PianFen List Sort Order - Page state resets）
- [x] 3.4 新增 `section` state（`"hot" | "other"`）用於 Tab 切換

## 4. 更新 PianFen.tsx UI

- [x] 4.1 HOT/OTHER Tab 切換 + PianFen Sort Mode Toggle（右側技能分/玩家%）+ 2px neon 漸層分隔線
- [x] 4.2 hotPageItems / otherPageItems 各自計算；PaginationControls 元件抽出（PianFen List Sort Order - HOT and OTHER sections have independent pagination）
- [x] 4.3 Content 依 section 顯示對應列表
- [x] 4.4 RecordRow 右側新增 percent 顯示（XX.XX%，11px mono）（PianFen Player Percent Field）

## 5. RecordRow 視覺重設計

- [x] 5.1 Guitar=#FFB100、Bass=#6EE7B7；封面 border 依難度色（DIFF_BORDER_COLOR）
- [x] 5.2 行間距 6px；移除左邊 accent border；加深色 card 底色 + 圓角
- [x] 5.3 yomi badge 移至歌名前方；固定 20×16px；pill 樣式；單字不含「行」

## 6. Kuromoji 瀏覽器相容性修復

- [x] 6.1 安裝 path-browserify；vite.config.ts alias path → path-browserify
- [x] 6.2 vite.config.ts alias kuromoji → kuromoji/build/kuromoji.js
- [x] 6.3 新增 Vite plugin serve-dict-raw：攔截 /dict/*.dat.gz 以 application/octet-stream 服務（防止 Content-Encoding: gzip 導致 invalid file signature）
- [x] 6.4 複製 12 個字典檔至 public/dict/；yomi.ts KuromojiAnalyzer 設 dictPath: "/dict/"

## 7. 收尾

- [x] 7.1 執行 `/spectra-archive` 歸檔此 change
