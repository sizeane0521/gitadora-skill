## Context

歌曲列表頁（`/songs`）現況：
- `useSongs` 一次撈取所有歌曲（GF 約 800 筆 row、DM 約 400 筆），client-side dedup by title
- `AppShell` 的 `<main>` 無寬度限制，桌機螢幕上內容無限延伸
- 搜尋已是 server-side `ilike`，但沒有分頁

## Goals / Non-Goals

**Goals:**
- 桌機寬螢幕限制內容最大寬度（`max-w-2xl`）
- 歌曲列表改為無限捲動，每頁 50 筆
- DB query 改用 instrument filter 消除 client-side dedup
- 搜尋維持 server-side，支援分頁
- 列表底部加「回到頂部」浮動按鈕

**Non-Goals:**
- 不改 URL 為分頁式（`?page=N`）
- 不導入 full-text search
- 不調整其他頁面的 RWD
- 不做虛擬列表（搜尋是主要找歌方式，結果量少，無需額外依賴）

## Decisions

### AppShell max-width 限制

在 `AppShell.tsx` 的 `<main>` 加 `max-w-2xl mx-auto w-full`。

選擇在 `AppShell` 層統一處理，而非各頁面自行控制，理由是所有已驗證頁面（Dashboard、Songs、Kasegi 等）都適合同一寬度上限，統一維護較簡單。

### Instrument filter 取代 client-side dedup

目前 GF 歌曲在 DB 有 `guitar` 和 `bass` 兩筆 row，query 全撈再 client-side dedup 會導致分頁不穩定（每頁 50 筆 DB row 可能只有 25 首歌）。

改為 query 時直接 filter：
- GF → `instrument = 'guitar'`
- DM → `instrument = 'drums'`

風險：若有歌只有 bass 沒有 guitar，在 GF 列表會看不到。目前資料確認 GF 歌曲均有 guitar row，可接受。

### useInfiniteQuery + Intersection Observer

使用 `@tanstack/react-query` 的 `useInfiniteQuery` 搭配 Supabase `.range(from, to)` 做分頁。

在列表底部放一個 sentinel `<div>`，透過 `IntersectionObserver` 偵測進入 viewport 時呼叫 `fetchNextPage()`。

選擇 Intersection Observer 而非 scroll event 的理由：效能較好（不需每次 scroll 計算），瀏覽器原生支援無 polyfill 需求。

### 無限捲動而非頁碼分頁

手機 UX 上頁碼分頁體驗差（要點按鈕、記頁碼）。搜尋是主要找歌方式，搜尋結果通常 < 50 首，幾乎不會觸發第二頁；純手動瀏覽全部 1200 首的情境不現實。

補充「回到頂部」浮動按鈕解決偶發的往回滑需求，捲動超過 300px 時顯示。

## Risks / Trade-offs

- [搜尋 + 無限捲動] 使用者輸入關鍵字時需重置 pageParam，否則會接在舊結果後面 → 用 `queryKey` 包含 `search`，React Query 會自動 reset
- [instrument filter] 若 zetaraku 資料異常（某首歌缺 guitar row），GF 列表會漏歌 → 目前可接受，日後可改為 `DISTINCT ON (title)`
