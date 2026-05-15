## Why

Dashboard 成績頁目前使用「載入更多」的無限捲動模式（每次追加 50 首），無法直接跳頁；賺分曲頁已有頁碼式 pagination，但實作是 inline 在 `Index.tsx` 中，無法共用。每頁 25 首卡片約 4–5 個螢幕高，沒有快速回頂端的方式。

## What Changes

- 新建 `SongListPagination` 共用元件（`src/components/SongListPagination.tsx`）：接收 `currentPage / totalPages / onPageChange` props，包含首頁、末頁、前後頁、頁碼按鈕（最多顯示 5 個，超出顯示省略號）
- Dashboard 成績頁改為每頁 25 首的頁碼式 pagination；換頁透過 `useEffect([page])` 執行 `window.scrollTo(0,0)` + `document.documentElement.scrollTop=0`；rank 計算改為 `(page-1)*PAGE_SIZE + i + 1` 顯示全域排名
- Index 賺分曲頁的 inline pagination 改為使用 `SongListPagination` 元件；換頁透過 `useLayoutEffect([currentPage])` 設定 `containerRef.current.scrollTop = 0`（在 DOM 繪製前同步執行，避免 scroll restoration 干擾）
- PianFen 賺分曲頁（`src/pages/PianFen.tsx`）補加 `useEffect([hotPage, otherPage])` 換頁 scroll-to-top，原本缺少此邏輯
- 新增浮動「回頂端」按鈕（`src/components/ScrollToTopButton.tsx`）：捲動超過 300px 才出現，點擊後 `window.scrollTo({ top: 0 })`，固定在右下角（bottom-nav 上方）

## Non-Goals

- 不改變 Dashboard 的排序、篩選邏輯
- 不改變 Index 的 PAGE_SIZE（維持 15）
- 不在 PianFen 頁加入 Top 按鈕或新的 pagination UI（PianFen 保留原有的 `◄ n/total ►` 樣式）

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `dashboard-unified-view`：移除「載入更多」機制，新增頁碼式 pagination（Page-based Pagination on Dashboard Score List）和浮動回頂端按鈕（Scroll-to-Top Button）需求；`SongListPagination` 為純程式碼共用元件，不需獨立 spec

## Impact

- Affected specs: `dashboard-unified-view`
- Affected code:
  - New: `src/components/SongListPagination.tsx`
  - New: `src/components/ScrollToTopButton.tsx`
  - Modified: `src/pages/Dashboard.tsx`
  - Modified: `src/pages/Index.tsx`
  - Modified: `src/pages/PianFen.tsx`
