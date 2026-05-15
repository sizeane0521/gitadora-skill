## Context

成績頁目前有兩個獨立資料源：Google Sheets（`fetchSongs`）載入全部歌曲，Supabase（`useScores`）載入使用者個人成績。兩個 Tab 是分開渲染的，互相獨立。`SongsBrowseView` 組件只用 Google Sheets 資料，`ScoreList` 只用 Supabase 資料。

## Goals / Non-Goals

**Goals:**
- 統一視圖：以 Google Sheets 全部歌曲為基礎，Supabase 成績 merge 進去
- HOT / OTHER Tab 切換（`song.新舊分類` 欄位，與賺分曲邏輯一致）
- Filter bar 改為兩列：上列控制分類，下列控制細節篩選

**Non-Goals:**
- 不新增後端；不修改 Google Sheets 或 Supabase schema
- 未遊玩歌曲的收藏/目標功能不在本 change 實作

## Decisions

### useUnifiedSongList hook：合併策略

以 `fetchSongs(mode)` 的全部歌曲為基底（包含已有的 Google Sheets 成績），再用 Supabase 的 `useScores({ source: "both" })` 將同一首歌的 arcade + konaste 成績 merge 覆蓋進去。

Merge key：`歌曲名稱 + 樂器類型.toUpperCase() + 譜面等級.toUpperCase()`

優先級：Supabase arcade record 覆蓋 `街機版` 欄位，Supabase konaste record 覆蓋 `家用版` 欄位。Google Sheets 的值作為 fallback。

```
useUnifiedSongList(mode: GameMode) {
  allSongs = fetchSongs(mode)           → SongData[]（含 GS 成績）
  arcadeScores = useScores(source: "arcade")
  konsteScores = useScores(source: "konaste")
  
  return allSongs.map(song => {
    arcadeMatch = arcadeScores.find by key
    konsteMatch = konsteScores.find by key
    merge: 如果有 Supabase 記錄就覆蓋對應欄位
  })
}
```

`staleTime: 5 * 60 * 1000`（Google Sheets 資料），Supabase 成績依 TanStack Query 預設。

### HOT / OTHER Tab 切換

沿用賺分曲的 skewed clip-path button 樣式。篩選邏輯：`song.新舊分類 === "HOT"` / `song.新舊分類 !== "HOT"`（Other）。切換 HOT/OTHER 時 reset page 為 1。

### Filter bar 兩列設計

```
列 1：[HOT] [OTHER]                    排序▼
列 2：[BSC] [ADV] [EXT] [MAS]   來源▼  等級▼
      (有篩選條件時出現「重設」按鈕)
```

列 1 sticky（跟隨 GF/DM tab bar 貼頂），列 2 非 sticky。排序下拉選項與現有 ScoreList 相同（Skill降冪、達成率降冪、難度降冪、歌名）。

### 移除 DashboardView toggle

`DashboardView` state、「目前成績」/「全部歌曲」按鈕、`SongsBrowseView` 渲染路徑全部移除。Dashboard 永遠渲染統一視圖。

## Risks / Trade-offs

- Google Sheets API 有延遲（~1-2 秒），初次載入時顯示 skeleton
- Merge key 若 Google Sheets 和 Supabase 的歌名/難度大小寫不一致可能 miss；`toUpperCase()` normalize 可降低風險
