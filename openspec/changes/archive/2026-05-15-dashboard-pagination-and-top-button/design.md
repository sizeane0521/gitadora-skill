## Context

本次變更新增兩個共用元件，並更新 Dashboard 與 Index 的分頁行為。不引入新的資料源或後端 API。

## In Scope

- `SongListPagination.tsx`：共用分頁 UI 元件
- `ScrollToTopButton.tsx`：浮動回頂端按鈕
- `Dashboard.tsx`：改為頁碼式 pagination，換頁 window.scrollTo
- `Index.tsx`：改用 `SongListPagination` 元件

## Out of Scope

- Index.tsx 的 PAGE_SIZE、排序、篩選行為
- PianFen 頁

## SongListPagination 元件介面

```typescript
interface SongListPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

UI 規格（比照現有 Index.tsx inline 實作）：
- 最多顯示 5 個連續頁碼，超出顯示 `…`
- 包含「首頁 ← … 1 2 3 … → 末頁」
- 當前頁碼用 primary 樣式高亮
- totalPages <= 1 時不渲染

## ScrollToTopButton 元件規格

- 監聽 `window.scroll` 事件，`scrollY > 300` 時顯示
- 點擊後 `window.scrollTo({ top: 0, behavior: "smooth" })`
- 位置：`fixed bottom-20 right-4 z-30`（bottom-20 = 80px，避開底部 BottomNav 高度 64px）
- 樣式：圓形按鈕，`bg-card border`，`ChevronUp` icon
- 出現/消失使用 opacity + translate transition（150ms）

## Dashboard Pagination 設計

- `PAGE_SIZE = 25`，移除原有 `paginated = filtered.slice(0, page * PAGE_SIZE)` 的累積邏輯
- 改為 `const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)`
- `totalPages = Math.ceil(filtered.length / PAGE_SIZE)`
- `goToPage(n)` = `setPage(n); window.scrollTo({ top: 0, behavior: "smooth" })`
- 換頁時不需要 containerRef（Dashboard 滾動容器是 window）
- 當 `filtered` 變動（HOT/OTHER 切換、sortKey 變、underperforming toggle）→ reset page to 1

## Index Pagination 設計

- 保留現有 `containerRef.current?.scrollTo()` 的捲動行為（Index 有自己的 scroll container）
- 將 inline pagination JSX 替換為 `<SongListPagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />`
- `goToPage` 繼續使用 containerRef 捲動
