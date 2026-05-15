## 1. AppShell max-width 限制

- [x] 1.1 在 `src/components/layout/AppShell.tsx` 的 `<main>` 元素加上 `max-w-2xl mx-auto w-full`，實作 Responsive Layout Max-Width（AppShell max-width 限制）

## 2. useSongs 改為 Infinite Query

- [x] 2.1 將 `src/hooks/useSongs.ts` 的 `useQuery` 改為 `useInfiniteQuery + Intersection Observer` 模式，`pageSize = 50`，使用 Supabase `.range(from, to)`，`initialPageParam: 0`，`getNextPageParam` 根據回傳筆數是否等於 50 決定下一頁，實作 Cursor-Based Pagination Query
- [x] 2.2 將 `useSongs` 的 filter 改為 instrument filter 取代 client-side dedup：GF → `instrument = 'guitar'`，DM → `instrument = 'drums'`，移除 client-side dedup 邏輯，實作 Instrument-Filtered Query
- [x] 2.3 確保 `queryKey` 包含 `[gameType, search]`，使搜尋變更時 Server-Side Search with Pagination Reset 自動重置，符合無限捲動而非頁碼分頁設計
- [x] 2.4 確認 Cover Image Name Column：`useSongs` 的 select 包含 `image_name`，`coverUrl()` 優先用 `image_name` 組 zetaraku CDN URL，fallback 至 `cover_url`

## 3. Songs 頁面改為無限捲動

- [x] 3.1 在 `src/pages/Songs.tsx` 改用 `useInfiniteQuery` 的 `useSongs`，將所有頁面資料攤平（`data.pages.flatMap(p => p)`）渲染，實作 Infinite Scroll Pagination
- [x] 3.2 在列表底部加入 sentinel `<div ref={sentinelRef}/>`，用 `IntersectionObserver` 偵測進入 viewport 時呼叫 `fetchNextPage()`（需排除 `!hasNextPage` 和 `isFetchingNextPage`）
- [x] 3.3 在列表底部顯示載入中 spinner（`isFetchingNextPage` 為 true 時），End of list 時不顯示任何指示

## 4. 回到頂部按鈕

- [x] 4.1 在 `src/pages/Songs.tsx` 加入 scroll event listener，捲動超過 300px 時顯示浮動按鈕，實作 Scroll-to-Top Button
- [x] 4.2 點擊按鈕呼叫 `window.scrollTo({ top: 0, behavior: 'smooth' })`，捲回頂部後按鈕隱藏

## 5. 空狀態與邊界處理

- [x] 5.1 `Songs.tsx` 無搜尋結果時顯示「找不到歌曲」文字，實作 Empty search result 情境
- [x] 5.2 Public Song Browse List：確認未匯入成績的使用者進入 `/songs` 可正常看到歌曲（無需 userId）
