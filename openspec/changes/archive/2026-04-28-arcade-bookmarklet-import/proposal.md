## Why

匯入功能目前是假的——`Import.tsx` 裡的 `makeBookmarkletHref()` 只產生一個彈出 alert 的佔位 stub，從未使用真正的 `bookmarklet/arcade.js`。使用者點書籤後不會有任何成績被匯入，導致整個產品的核心使用流程無法驗證。

## What Changes

1. **重寫 `bookmarklet/arcade.js`**：使用從 p.eagate.573.jp 成績頁實際確認的 DOM selector，完整實作「DOM 抓取 → Supabase upsert」邏輯。
2. **修正 `Import.tsx`**：`makeBookmarkletHref()` 改為讀取真正的 `bookmarklet/arcade.js` 原始碼（import as string），在 runtime 將 `%%VITE_SUPABASE_URL%%` 和 `%%VITE_SUPABASE_ANON_KEY%%` 替換成真實值，minify 後產生可用的 `javascript:` URL。
3. **Konaste bookmarklet** 同步修正（selector 待驗證，先保留現有結構但串接 `bookmarklet/konaste.js`）。

## Non-Goals

- 不支援手機瀏覽器（iOS/Android bookmarklet 限制，留作後續）
- 不自動排程匯入（使用者手動觸發）
- 不處理 eagate 登入狀態驗證（使用者須自行確認已登入）
- 不使用 `img.jacket` 封面 URL（eagate 圖片需 session 才能存取）

## 第三階段：修正與最終實作（逐步除錯紀錄）

在實作過程中發現並解決多個問題：

1. **savedSkillId vs playerId**：gsv.fun URL 中的數字（如 44355）是 `savedSkillId`（每次上傳產生的 snapshot ID），不是 `playerId`（永久玩家帳號 ID）。查詢改為 `savedSkill(skillId: Int)` 而非 `user(playerId: Int)`。
2. **part/diff 大小寫**：實際資料中 `part` 為大寫單字母（"G"/"B"/"D"），`diff` 為大寫縮寫（"MAS"/"EXT" 等），`achive_value` 帶 "%" 符號，mapping 函式全部修正。
3. **Supabase RLS 缺少**：`songs` 表缺少 INSERT 政策；`scores` 表缺少 SELECT / INSERT 政策，逐一在 Supabase SQL Editor 補加。
4. **source enum 型別**：`score_source` 是 PostgreSQL ENUM，只有 "arcade" / "konaste"，"gsv" 無效，改為 `source: "arcade"` 避免修改 DB schema。
5. **批次操作取代序列請求**：原本每首歌 3-4 個序列 HTTP 請求（50 首 = ~200 次），導致匯入假死。改為 5 個批次請求：bulk SELECT songs → bulk INSERT missing songs → bulk SELECT existing scores → bulk INSERT new scores → sequential UPDATE existing scores。

## Supabase 後台設定（需手動執行）

```sql
-- songs INSERT
CREATE POLICY "users can insert songs" ON public.songs FOR INSERT TO authenticated WITH CHECK (true);
GRANT INSERT ON public.songs TO authenticated;

-- scores SELECT / INSERT
CREATE POLICY "users can select own scores" ON public.scores FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users can insert own scores" ON public.scores FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "users can update own scores" ON public.scores FOR UPDATE TO authenticated USING (user_id = auth.uid());
```

## 第二階段：改用 gsv.fun API（不需書籤，不需離開 app）

第一階段的 bookmarklet 方案實際測試後發現根本問題：bookmarklet 在 eagate 域執行時，試圖從 eagate 域的 localStorage 讀取 Supabase session token，但 token 存在 app 域（不同 origin，localStorage 完全隔離），導致 auth check 永遠失敗，匯入無法完成。

調查發現 gsv.fun GraphQL API（`https://gsv.fun/graphql`）提供 `user(playerId, type, version)` query，可回傳個人完整成績資料，包含 `guitarSkill` 和 `drumSkill` 兩個 `SkillTable`，每筆成績（`SkillRecord`）包含曲名（`name`）、樂器（`part`）、難度（`diff`）、skill point（`skill_value`）、達成率（`achive_value`）、難度值（`diff_value`）。

使用者原本就需要先用舊書籤更新 gsv.fun，之後 app 直接從 gsv.fun 讀資料匯入 Supabase，完全不需要新書籤，也不需要離開 app。

**第二階段新增項目：**

1. **新建 `src/hooks/useGsvImport.ts`**：封裝 gsv.fun `user` query，提供 `fetchGsvUserScores(playerId)` 函式，並提供 `mapDiff` / `mapPart` 轉換函式。
2. **修改 `src/pages/Import.tsx`**：新增 gsv.fun 匯入區塊，包含 Player ID input（值存 localStorage `siz_gsv_player_id`）、匯入按鈕、進度狀態、完成 toast，並在元件內處理 Supabase upsert。

## Capabilities

### New Capabilities

- `arcade-score-import`: 在 p.eagate.573.jp 成績頁執行的 bookmarklet，抓取技能對象曲成績並寫入 Supabase

### Modified Capabilities

- `score-import`: Import 頁面改為使用真正的 bookmarklet 程式碼（非 stub）

## Impact

- Affected specs: `score-import`（修改），`arcade-score-import`（新建），`gsv-import`（新建）
- Affected code:
  - Modified: `bookmarklet/arcade.js`
  - Modified: `src/pages/Import.tsx`
  - Modified: `vite.config.ts`
  - New: `src/hooks/useGsvImport.ts`
