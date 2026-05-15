## 1. 建立 SongListPagination 共用元件（shared-song-list-pagination）

- [x] 1.1 建立 `src/components/SongListPagination.tsx`，接收 `{ currentPage: number; totalPages: number; onPageChange: (page: number) => void }` props；當 `totalPages <= 1` 時不渲染任何內容；包含首頁（`ChevronFirst` 或 `«`）、前頁（`ChevronLeft`）、最多 5 個頁碼按鈕（超出顯示 `…`）、後頁（`ChevronRight`）、末頁（`ChevronLast` 或 `»`）；當前頁用 primary 背景色高亮；驗證：TypeScript 編譯無錯誤，totalPages=1 時元件回傳 null

## 2. 更新 Dashboard 為頁碼式 pagination（Page-based Pagination on Dashboard Score List）

- [x] 2.1 實作「Page-based Pagination on Dashboard Score List」資料層：在 `src/pages/Dashboard.tsx` 的 `ScoreList` 中，將 `PAGE_SIZE` 從 50 改為 25；移除 `hasMore` 計算；將 `paginated` 從累積切片（`filtered.slice(0, page * PAGE_SIZE)`）改為單頁切片（`filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)`）；新增 `totalPages = Math.ceil(filtered.length / PAGE_SIZE)`；驗證：TypeScript 編譯無錯誤

- [x] 2.2 實作「Page-based Pagination on Dashboard Score List」goToPage 與 filter reset：在 `src/pages/Dashboard.tsx` 中，新增 `goToPage` 函式（`setPage(n); window.scrollTo({ top: 0, behavior: "smooth" })`）；確認 `hotOther`、`sortKey`、`underperforming` 變動時呼叫 `setPage(1)`（已有）；驗證：切換 HOT/OTHER 後頁碼回到 1，換頁時視窗 scroll 到頂端

- [x] 2.3 實作「Page-based Pagination on Dashboard Score List」UI：在 `src/pages/Dashboard.tsx` 的 song list 區塊下方，移除「載入更多」按鈕 JSX；加入 `<SongListPagination currentPage={page} totalPages={totalPages} onPageChange={goToPage} />`；驗證：畫面底部出現頁碼控制，不再有「載入更多」按鈕

## 3. 更新 Index 使用 SongListPagination（shared-song-list-pagination）

- [x] 3.1 在 `src/pages/Index.tsx` 中，移除 inline pagination JSX（首頁/前頁/頁碼/後頁/末頁的整段 JSX），改為 `<SongListPagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />`；`goToPage` 保持原有 `containerRef.current?.scrollTo({ top: 0, behavior: "smooth" })` 行為；驗證：賺分曲頁 pagination 功能與外觀和改前一致，TypeScript 編譯無錯誤

## 4. 建立浮動回頂端按鈕（Scroll-to-Top Button）

- [x] 4.1 實作「Scroll-to-Top Button」元件：建立 `src/components/ScrollToTopButton.tsx`，使用 `useState` 追蹤 `visible`（初始 false）；`useEffect` 中監聽 `window` 的 `scroll` 事件，`scrollY > 300` 時設為 true，否則 false（記得在 cleanup 移除 listener）；點擊時呼叫 `window.scrollTo({ top: 0, behavior: "smooth" })`；樣式：`fixed bottom-20 right-4 z-30`，圓形按鈕（`rounded-full w-10 h-10`），`bg-card border`，`ChevronUp` icon（size 20）；顯示/隱藏用 `opacity-0 translate-y-2`/`opacity-100 translate-y-0` + `transition duration-150`；驗證：TypeScript 編譯無錯誤

- [x] 4.2 實作「Scroll-to-Top Button」掛載：在 `src/pages/Dashboard.tsx` 的頁面根元素內引入並渲染 `<ScrollToTopButton />`；驗證：Dashboard 成績頁捲動超過 300px 後右下角出現回頂端按鈕，點擊後頁面 smooth scroll 到頂端，捲回 300px 以內按鈕消失

## 5. Bug 修正與 PianFen 換頁 scroll（Page-based Pagination on Dashboard Score List / Scroll-to-Top Button）

- [x] 5.1 修正「Page-based Pagination on Dashboard Score List」rank 顯示錯誤：在 `src/pages/Dashboard.tsx` 渲染 `SongCard` 時，將 `rank={i + 1}` 改為 `rank={(page - 1) * PAGE_SIZE + i + 1}`，確保 page 2 第一首顯示全域排名 26 而非 1；驗證：切到第 2 頁後第一張卡片顯示 rank 26

- [x] 5.2 修正「Page-based Pagination on Dashboard Score List」換頁 scroll 失效：將 Dashboard 的 `goToPage` 中的 `window.scrollTo` 移至 `useEffect([page])`（render 後才執行），同時加入 `document.documentElement.scrollTop = 0` 作為 fallback；驗證：點擊任意頁碼後視窗自動捲回頂端，不需手動往上滑

- [x] 5.3 修正「Scroll-to-Top Button」位置遮擋問題：將 `ScrollToTopButton.tsx` 的 CSS class 從 `bottom-20` 改為 `bottom-24`（96px），避免與最後一張卡片內容重疊；驗證：按鈕出現時不與卡片 score row 內容重疊

- [x] 5.4 修正 Index.tsx 換頁 scroll 失效：將 `useEffect([currentPage])` 改為 `useLayoutEffect([currentPage])`，確保在瀏覽器繪製前同步設定 `containerRef.current.scrollTop = 0`，避免 scroll restoration 干擾；驗證：賺分曲（Index 頁面）換頁後自動捲回頂端

- [x] 5.5 補加 PianFen 換頁 scroll-to-top：在 `src/pages/PianFen.tsx` 新增 `useEffect` 監聽 `[hotPage, otherPage]`，換頁時執行 `window.scrollTo(0, 0)` + `document.documentElement.scrollTop = 0`；原本 PianFen 完全缺少此邏輯；驗證：賺分曲 Tab（PianFen 頁面）點擊下一頁後視窗自動捲回頂端
