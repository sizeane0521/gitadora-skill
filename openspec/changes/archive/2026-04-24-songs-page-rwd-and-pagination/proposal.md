## Why

歌曲列表頁（`/songs`）目前一次撈取全部歌曲，在 1200+ 首的規模下初次載入慢；且版面沒有 `max-width` 限制，在桌機寬螢幕上內容過度延伸，使用體驗差。

## What Changes

- `AppShell` 的 `<main>` 加上 `max-w-2xl mx-auto w-full`，限制所有頁面在桌機的最大寬度
- `useSongs` 改用 instrument filter（GF → `guitar`、DM → `drums`）取代 client-side dedup，確保每首歌只有一筆 DB row，pagination 結果乾淨
- `useSongs` 改為 `useInfiniteQuery`，每頁 50 筆，以 `range()` 做 cursor-based 分頁
- `Songs.tsx` 加入 Intersection Observer，捲到底部自動載入下一頁
- 搜尋維持 server-side `ilike`，搜尋時重置分頁，搜尋結果仍支援無限捲動

## Non-Goals

- 不做 URL query string 分頁（`?page=2`）
- 不做 full-text search（ilike 已足夠）
- 不改動其他頁面的 RWD 行為

## Capabilities

### New Capabilities

- `song-browse`: 公開歌曲列表瀏覽，支援無限捲動與 server-side 搜尋

### Modified Capabilities

- `app-shell`: `<main>` 加入最大寬度限制，影響所有頁面桌機排版
- `song-master`: 歌曲列表查詢改為 instrument-filtered + cursor pagination

## Impact

- Affected specs: `song-browse`（新）、`app-shell`（修改）、`song-master`（修改）
- Affected code:
  - New: `src/hooks/useSongs.ts`（已存在，將重寫為 infinite query）
  - Modified: `src/components/layout/AppShell.tsx`
  - Modified: `src/pages/Songs.tsx`
