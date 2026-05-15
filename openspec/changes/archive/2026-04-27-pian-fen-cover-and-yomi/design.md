## Context

PianFen 頁面從 gsv.fun 取得社群賺分曲清單，回傳資料只有曲名、難易度等文字欄位，無封面或讀音資訊。Zetaraku CDN（已用於歌曲同步）提供完整的 GITADORA 歌曲資料含 imageName。kuroshiro + kuromoji 是日文假名轉換的業界標準 JS library。

## Goals / Non-Goals

**Goals:**
- 透過歌名對應 Zetaraku 資料取得封面 URL
- 支援所有歌名類型（英文、片假名、平假名、漢字）的五十音行判斷

**Non-Goals:**
- 不持久化快取 Zetaraku 資料到 Supabase 或 localStorage
- 不修改 PianFenRecord 型別（無法改動 gsv.fun API 回傳欄位）

## Decisions

### 封面：fetch Zetaraku data.json，建立 title→imageName Map

- Zetaraku CDN 端點：`https://dp4p6x0xfi5o9.cloudfront.net/gitadora/data.json`（2.4 MB）
- 以 TanStack Query 快取，staleTime: Infinity（頁面 session 內不重複 fetch）
- 對照 key 為歌名原始字串（大小寫敏感），找不到時顯示 40×40 灰色佔位 `<div>`
- 封面 URL 格式：`https://dp4p6x0xfi5o9.cloudfront.net/gitadora/img/cover/{imageName}`

### 五十音行：同步 + 非同步兩層

- **Tier 1（同步）**：Unicode range 判斷片假名（U+30A1–U+30F6）、平假名（U+3041–U+3096）、ASCII
  - 小假名正規化（ァ→ア 等）後查 KATAKANA_ROW 常數 Map
  - 涵蓋約 80% 歌曲，badge 立即顯示
- **Tier 2（非同步）**：漢字開頭的歌名透過 kuroshiro 轉換
  - kuroshiro singleton：lazy init（只在第一首漢字歌名出現時初始化）
  - kuromoji 字典從 npm bundle 載入（~7 MB，瀏覽器快取後不重載）
  - 結果快取於 module-level `kanjiCache: Map<string, string>`

### RecordRow 佈局調整

目前佈局：`排名 | 文字資訊 | 技能分`

調整後：`排名 | 封面圖(40×40) | 文字資訊 + yomi badge | 技能分`

- 封面圖 shrink-0，圓角 `rounded`
- yomi badge 接在 Lv.X 旁，`text-xs opacity-60 font-mono`

## Risks / Trade-offs

| 項目 | 風險 | 緩解 |
|---|---|---|
| 歌名不一致 | gsv.fun 歌名與 Zetaraku title 有時不同（括號、GITADORA ver.） | 找不到時顯示灰色佔位，不報錯 |
| kuroshiro 初始化時間 | 首次載入約 1-2 秒（字典解析） | PianFen 資料載入後才觸發 warmup，不阻塞 UI |
| Zetaraku CDN 不可用 | data.json fetch 失敗 | useZetarakuSongs 回傳空 Map，封面全顯示佔位符 |
