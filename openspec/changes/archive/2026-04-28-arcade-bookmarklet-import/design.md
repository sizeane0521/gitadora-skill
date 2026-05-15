## Context

Import 頁面的書籤按鈕目前是假的（只彈 alert），`bookmarklet/arcade.js` 雖已有架構骨架但從未被 `Import.tsx` 使用，且 DOM selector 全為猜測值。本次設計針對如何正確注入 env var 至 bookmarklet、以及使用已驗證的 eagate selector 完整實作抓取邏輯。

## Goals / Non-Goals

**Goals:**

- Bookmarklet 在 eagate 頁面可以真正抓取成績並寫入 Supabase
- Import.tsx 使用真正的 arcade.js 內容（不再用 hardcode stub）
- 無需 vite.config.ts 修改（使用 `?raw` import）

**Non-Goals:**

- 手機瀏覽器支援（bookmarklet 在 iOS/Android 限制）
- 自動排程匯入
- 使用 eagate 封面圖（需 session，無法跨域存取）

## Decisions

### Bookmarklet 內容注入：Runtime string replacement（`?raw` import）

在 Import.tsx 中以 `import arcadeRaw from '../../bookmarklet/arcade.js?raw'` 取得原始碼字串，在 `makeBookmarkletHref()` 內做 placeholder 替換後 URI encode。無需 Vite plugin。

### eagate DOM Selector（已從實際頁面驗證）

| 資料 | Selector |
|------|---------|
| 成績行 | `div.maincont table.skill_table_tb tbody tr` |
| 曲名 | `div.title a.text_link` |
| 樂器 | `div.seq_icon[class*="part_"]` → `part_GUITAR` / `part_BASS` / `part_DRUM` |
| 難度 | `div.seq_icon[class*="diff_"]` → `diff_MASTER` / `diff_EXTREME` / `diff_ADVANCED` / `diff_BASIC` |
| Skill pt | `td.skill_cell` （去 "pt"，parseFloat）|
| 達成率 | `td.achive_cell` （去 "%"，parseFloat）|
| 難度值 | `td.diff_cell` （parseFloat）|

Part → game_type/instrument：`part_DRUM` → DM/D，`part_BASS` → GF/B，`part_GUITAR` → GF/G

### Supabase Upsert 策略

1. 查 songs 表：`konami_song_id = "arcade_" + title`
2. 找不到則 INSERT 新 song
3. Upsert score：`Prefer: resolution=merge-duplicates`

## Risks / Trade-offs

- **Konami 改版風險**：selector 依賴 eagate HTML 結構，Konami 改版即失效
- **bookmarklet URL 長度**：arcade.js 若過大，部分瀏覽器有 bookmarklet 長度限制（通常 ~2KB）；需保持簡潔
- **`?raw` import TypeScript 型別**：需在 `src/vite-env.d.ts` 加 `declare module '*.js?raw'` 型別宣告
