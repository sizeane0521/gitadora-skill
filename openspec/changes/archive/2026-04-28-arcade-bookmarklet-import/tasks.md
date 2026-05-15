## 1. bookmarklet/arcade.js — Arcade Score DOM Scraping

- [x] 1.1 Arcade Score DOM Scraping（eagate DOM Selector（已從實際頁面驗證））：以 `div.maincont table.skill_table_tb tbody tr` 抓取所有成績行。對每行提取：`div.title a.text_link` textContent 為曲名；`div.seq_icon[class*="part_"]` className 判斷樂器（`part_GUITAR`→G/GF，`part_BASS`→B/GF，`part_DRUM`→D/DM）；`div.seq_icon[class*="diff_"]` className 判斷難度（`diff_MASTER`→MAS，`diff_EXTREME`→EXT，`diff_ADVANCED`→ADV，`diff_BASIC`→BSC）；`td.skill_cell` textContent 去 "pt" parseFloat；`td.achive_cell` textContent 去 "%" parseFloat；`td.diff_cell` textContent parseFloat。曲名為空則跳過該行。
- [x] 1.2 Arcade Score DOM Scraping — 空頁處理：若抓到 0 筆，alert 提示使用者先前往成績頁再執行，然後 return。

## 2. bookmarklet/arcade.js — Arcade Score Upsert to Supabase

- [x] 2.1 Arcade Score Upsert to Supabase（Supabase Upsert 策略）：`uploadScores()` 函式對每筆成績：用 `GET /rest/v1/songs?konami_song_id=eq.arcade_<title>&select=id` 查 song_id；找不到則 `POST /rest/v1/songs`（body: `{konami_song_id: "arcade_"+title, title, game_type}`，`Prefer: return=representation`）；取得 song_id 後 `POST /rest/v1/scores`（body: `{user_id, song_id, game_type, difficulty, achievement_rate, skill_point, diff_level, source:"arcade", imported_at}`，`Prefer: resolution=merge-duplicates`）。
- [x] 2.2 完成後 alert：成功數 > 0 且失敗數 = 0 → `[SIZ_GITADORA] Import complete: N songs updated`；有失敗 → `[SIZ_GITADORA] Import complete: N updated, M failed`。

## 3. src/vite-env.d.ts — ?raw import 型別宣告

- [x] 3.1 Bookmarklet 內容注入（?raw import）型別支援：在 `src/vite-env.d.ts` 加入 `declare module '*.js?raw' { const content: string; export default content; }` 以支援 TypeScript 識別 `?raw` import。

## 4. src/pages/Import.tsx — Bookmarklet Uses Real Implementation

- [x] 4.1 Bookmarklet Uses Real Implementation（Bookmarklet 內容注入：Runtime string replacement（`?raw` import））：在 `Import.tsx` 頂部加 `import arcadeRaw from '../../bookmarklet/arcade.js?raw'`（路徑視目錄結構調整）；修改 `makeBookmarkletHref(source)` 使其當 `source === "arcade"` 時：取 `arcadeRaw`，以 `String.prototype.replace()` 將 `%%VITE_SUPABASE_URL%%` 替換為 `import.meta.env.VITE_SUPABASE_URL`，將 `%%VITE_SUPABASE_ANON_KEY%%` 替換為 `import.meta.env.VITE_SUPABASE_ANON_KEY`，最後回傳 `"javascript:" + encodeURIComponent(replaced)`。

## 5. 驗證（第一階段）

- [x] 5.1 執行 `npx tsc --noEmit`，確認無 TypeScript 錯誤
- [x] 5.2 在瀏覽器開 Import 頁面，右鍵複製書籤連結的 href，確認包含真實 Supabase URL（不含 `%%VITE_SUPABASE_URL%%` 字樣）
- [x] 5.3 登入 eagate，前往技能對象曲成績頁，在 Console 貼上 arcade.js 內容（替換 placeholder 後），確認能抓到至少 1 筆成績並成功寫入 Supabase scores 表

## 6. src/hooks/useGsvImport.ts — gsv.fun API 封裝（新建）

- [x] 6.1 GSV.fun Player Score Import — 新建 `src/hooks/useGsvImport.ts`，定義 `SkillRecord` interface（`name: string`, `part: string`, `diff: string`, `skill_value: number`, `achive_value: string`, `diff_value: number`）及 `HalfSkillTable`（`data: SkillRecord[]`）、`SkillTable`（`hot: HalfSkillTable`, `other: HalfSkillTable`）型別。
- [x] 6.2 實作 `mapDiff(diff: string): "BSC"|"ADV"|"EXT"|"MAS"`：將 diff 字串（不論大小寫）以 includes 判斷映射：含 "master"→MAS，含 "extreme"→EXT，含 "advanced"→ADV，其餘→BSC。
- [x] 6.3 實作 `mapPart(part: string): {game_type: "GF"|"DM", instrument: string}`：part 含 "drum"→DM/D，含 "bass"→GF/B，其餘→GF/G（不論大小寫）。
- [x] 6.4 實作 `fetchGsvUserScores(playerId: number): Promise<SkillRecord[]>`：向 `https://gsv.fun/graphql` POST `user(playerId, type: "g", version: galaxywave_delta)` query，取 `guitarSkill.hot.data`、`guitarSkill.other.data`、`drumSkill.hot.data`、`drumSkill.other.data` 四個陣列合併回傳；錯誤時 throw。

## 7. src/pages/Import.tsx — gsv.fun 匯入 UI 與 Upsert 邏輯

- [x] 7.1 在 `Import.tsx` import `fetchGsvUserScores`、`mapDiff`、`mapPart`（來自 `@/hooks/useGsvImport`），並 import `supabase`（來自 `@/lib/supabase`）、`useQueryClient`（`@tanstack/react-query`）。
- [x] 7.2 新增 state：`gsvPlayerId`（string，預設從 `localStorage.getItem("siz_gsv_player_id") ?? ""`）、`gsvImporting`（boolean）、`gsvResult`（`{success: number; failed: number} | null`）。
- [x] 7.3 實作 `handleGsvImport()` async 函式：設 gsvImporting=true；呼叫 `fetchGsvUserScores(parseInt(gsvPlayerId))`；對每筆 record 執行「find-or-create song + upsert score」：先 `supabase.from("songs").select("id").eq("konami_song_id", "gsv_"+name).maybeSingle()`，找不到則 `supabase.from("songs").insert({konami_song_id:"gsv_"+name, title:name, game_type, artist:""}).select("id").single()`；取得 songId 後 `supabase.from("scores").upsert({user_id, song_id, game_type, difficulty, achievement_rate: parseFloat(achive_value), skill_point:skill_value, play_count:0, best_grade:null, is_excellent:false, is_full_combo:false, source:"gsv", imported_at:new Date().toISOString()}, {onConflict:"user_id,song_id,game_type,difficulty"})`；統計 success/failed；設 gsvImporting=false；設 gsvResult；呼叫 `queryClient.invalidateQueries({queryKey:["scores"]})`；顯示 toast（成功：「N 首成績已同步」；失敗：「N 首更新，M 首失敗」）。
- [x] 7.4 Player ID 持久化：`gsvPlayerId` 變更時 `localStorage.setItem("siz_gsv_player_id", value)`。
- [x] 7.5 在 Import 頁面 UI 新增「gsv.fun 匯入」區塊：說明文字「輸入你的 gsv.fun 玩家 ID（網址列的數字，例：gsv.fun/zh/.../40575/p 中的 40575）」；text input（value=gsvPlayerId）；「從 gsv.fun 匯入」按鈕（disabled 條件：gsvPlayerId 空白或 gsvImporting）；gsvImporting 時顯示 spinner；gsvResult 顯示結果摘要。

## 8. 驗證（第二階段）

- [x] 8.1 執行 `npx tsc --noEmit`，確認無 TypeScript 錯誤
- [x] 8.2 Import 頁面輸入真實 gsv.fun player ID，點「從 gsv.fun 匯入」，確認 Network tab 有向 `gsv.fun/graphql` 發送 POST 且有成功回應
- [x] 8.3 Supabase dashboard → scores 表確認有 source="gsv" 的新資料
- [x] 8.4 Dashboard 成績頁面正確顯示匯入後的成績

## 9. src/hooks/useGsvImport.ts — 修正查詢與 mapping（第三階段）

- [x] 9.1 GSV.fun Player Score Import — 將 query 從 `user(playerId)` 改為 `savedSkill(skillId)`，對應 gsv.fun URL 中實際的 savedSkillId（每次上傳遞增，非玩家帳號 ID）。
- [x] 9.2 修正 `mapDiff`：實際 diff 為大寫縮寫（"MAS"/"EXT"/"ADV"/"BSC"），改用 `toUpperCase()` + 精確比對。
- [x] 9.3 修正 `mapPart`：實際 part 為大寫單字母（"G"/"B"/"D"），改用 `toUpperCase()` 比對。
- [x] 9.4 修正 `achive_value` 解析：實際帶 "%" 符號（如 "79.50%"），parseFloat 前先 `.replace("%", "")`。
- [x] 9.5 同時查詢 `type: "g"` 和 `type: "d"` 兩個（以支援 GF/DM 混合玩家），合併去重後回傳。

## 10. src/pages/Import.tsx — 批次操作 + 修正 source（第三階段）

- [x] 10.1 將序列逐筆操作（50 首 × 3-4 請求 = ~200 次）改為批次（~5 次總請求）：bulk SELECT songs → bulk INSERT missing songs → bulk SELECT existing scores → bulk INSERT new scores → sequential UPDATE existing scores。
- [x] 10.2 將 `source: "gsv"` 改為 `source: "arcade"`，避免修改 PostgreSQL ENUM `score_source`（僅含 "arcade" / "konaste"）。
- [x] 10.3 更新 input 說明文字：「gsv.fun 成績 ID（每次上傳後網址中的數字，例：gsv.fun/zh/.../44355/p 中的 44355，下次上傳後此數字會改變）」。
- [x] 10.4 localStorage key 從 `siz_gsv_player_id` 改為 `siz_gsv_skill_id`。

## 11. 驗證（第三階段）

- [x] 11.1 匯入完成顯示「N 首成績已同步」toast
- [x] 11.2 Dashboard 成績頁面正確顯示匯入的曲目與 skill point

## 12. src/pages/Dashboard.tsx — auth loading 保護

- [x] 12.1 `ScoreList` 元件從 `useAuth()` 取出 `loading` 並傳入 `useScores({ enabled: !authLoading })`，防止 auth 初始化期間（user: null）觸發空結果快取，導致進出頁面後成績消失。

## 13. src/pages/Login.tsx — 登入 loading 防呆

- [x] 13.1 新增 `signingIn` state；`handleSignIn()` 設 signingIn=true 後呼叫 `signIn()`，catch 時 reset；按鈕 disabled 條件改為 `loading || signingIn`，防止重複點擊。
- [x] 13.2 登入中按鈕顯示 spinner + 「登入中…」文字，取代靜態「使用 Google 登入」；下方顯示「正在開啟 Google 登入視窗…」說明文字。

## 14. src/pages/Import.tsx — UX 防呆與清理

- [x] 14.1 移除書籤拖拉區塊（STEP 1）、5 步驟說明（STEP 2）、「開新分頁前往 eagate」按鈕，以及相關的 `arcadeRaw`、`konasteRaw`、`makeBookmarkletHref`、`EAGATE_SCORE_URL`、`bookmarkLabel`，精簡頁面。
- [x] 14.2 匯入按鈕加 spinner 動畫（匯入中時顯示旋轉圓圈）。
- [x] 14.3 匯入結果由純文字改為帶色彩的 Card：成功顯示綠色 + 「查看成績 →」跳轉按鈕；部分失敗顯示黃色警告 + 「重試」按鈕。

## 15. 驗證（第四階段）

- [x] 15.1 進出 Dashboard 頁面，確認成績不因 auth 初始化延遲而消失
- [x] 15.2 Login 頁點登入後按鈕顯示 spinner，不能重複點擊
- [x] 15.3 Import 頁匯入成功後顯示綠色 Card + 「查看成績 →」按鈕，點擊後跳轉 Dashboard
