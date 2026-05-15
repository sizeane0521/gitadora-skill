## Why

成績頁目前有「目前成績」和「全部歌曲」兩個獨立 Tab，造成功能斷層：使用者無法在同一個畫面同時看到「有成績的歌」與「還沒打的歌」。未遊玩的歌曲無法被收藏或標記，也無法支援未來的擴充功能（目標曲、練習清單等）。此外，篩選列設計凌亂（flex-wrap 六個控制元件），且缺少與賺分曲頁面一致的 HOT/OTHER 分類切換。

## What Changes

- 移除「目前成績 / 全部歌曲」兩個分頁切換
- 改為統一視圖：從 Google Sheets 載入全部歌曲，再與 Supabase 的使用者成績合併
- 有成績的歌顯示完整 SongCard（含街/家進度條）
- 未遊玩的歌也顯示 SongCard，但街/家 ScoreRow 顯示「—」
- 新增 HOT / OTHER Tab 切換（與賺分曲頁一致的 skewed 按鈕樣式）
- Filter bar 重設計為兩列：上列為 HOT/OTHER + 排序，下列為難度 + 來源 + 等級

## Non-Goals

- 不修改 GF / DM tab 切換邏輯
- 不新增後端 API；全部資料從既有來源（Google Sheets + Supabase）取得
- 未遊玩歌曲的收藏/標記功能本 change 不實作（資料結構預留即可）

## Capabilities

### New Capabilities

- `dashboard-unified-view`: 統一視圖，合併全部歌曲與使用者成績，支援 HOT/OTHER 切換與重設計篩選列

### Modified Capabilities

- `score-list`: 篩選列重設計為兩列；新增 HOT/OTHER 分類篩選
- `dashboard-view-toggle`: 移除目前成績/全部歌曲切換，改由 HOT/OTHER 取代

## Impact

- Affected specs: `dashboard-unified-view`（新）、`score-list`（改）、`dashboard-view-toggle`（改）
- Affected code:
  - Modified: `src/pages/Dashboard.tsx`
  - Modified: `src/components/SongCard.tsx`
  - New: `src/hooks/useUnifiedSongList.ts`
