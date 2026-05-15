## 1. 資料層 — Hook 與型別

- [x] 1.1 在 `src/hooks/usePianFen.ts` 定義 `PianFenRecord` 與 `PianFenData` 騙分資料型別（diffValue, averageSkill, count 等欄位）
- [x] 1.2 實作 `KASEGI_NEW_QUERY` GraphQL query 字串（kasegiNew query，含 hot/other 各欄位），版本參數固定為 fuzz-up
- [x] 1.3 實作 `usePianFen(gameType)` hook（決策：GraphQL 查詢使用 fetch + TanStack Query，不引入 Apollo Client）：POST 至 `https://gsv.fun/graphql`，staleTime 5 分鐘，滿足 Data Caching via TanStack Query 需求
- [x] 1.4 在 hook 中依 `gameType` 過濾 `part` 欄位：GF 只保留 guitar/bass，DM 只保留 drum，滿足 Fetch Community Pian-Fen Data from gsv.fun 的過濾需求

## 2. 頁面 — PianFen 顯示頁

- [x] 2.1 建立 `src/pages/PianFen.tsx`，支援路由 `/pian-fen/:instrument`（預設 gf），頁面頂部有 GF/DM 切換 tab（與 Kasegi 頁相同 UI 模式）
- [x] 2.2 實作 loading spinner（fetch 進行中）、error state（gsv.fun 無法連線）、empty state（無資料）三種狀態
- [x] 2.3 實作 HOT 區塊：顯示標題「HOT」，逐項列出 PianFenRecord，每列含排名編號、曲名、diff 標籤（BSC/ADV/EXT/MAS badge）、part 標籤（Guitar/Bass/Drums）、定數、社群平均 Skill，滿足 PianFen Page Displays Ranked Song List 需求
- [x] 2.4 實作 LONG AGO 區塊：與 HOT 相同列表結構，排名各自獨立從 1 開始，滿足 PianFen Page Displays Ranked Song List 的 hot/other 分段需求
- [x] 2.5 在 `src/App.tsx` 加入 lazy import `PianFen`，並在 ProtectedRoute 區塊內新增路由：`/pian-fen` redirect 至 `/pian-fen/gf`，`/pian-fen/:instrument` 渲染 `PianFen`

## 3. 導覽 — BottomNav 與 Sidebar 擴充

- [x] 3.1 在 `src/components/layout/BottomNav.tsx` 的 `NAV_ITEMS` 陣列中，於 賺分曲 與 好友 之間插入 `{ to: "/pian-fen", icon: Zap, label: "騙分" }`（決策：BottomNav 由 4 項擴充為 5 項），滿足 Bottom Navigation Items 需求
- [x] 3.2 在 `src/components/layout/Sidebar.tsx` 對應位置插入騙分導覽項目（Zap 圖示，label「騙分」，路由 `/pian-fen`），滿足 Sidebar Navigation Items 需求

## 4. 整合驗證

- [x] 4.1 啟動 dev server，在瀏覽器確認 `/pian-fen/gf` 能正常載入並顯示 gsv.fun 的資料（或顯示 CORS error state，以便決定是否需要 proxy）
- [x] 4.2 確認底部導覽列顯示 5 個項目，且「騙分」active pill 在 `/pian-fen` 路由下正確觸發
- [x] 4.3 確認 GF/DM tab 切換後頁面重新 fetch 並僅顯示對應樂器的曲目

## 5. API 修正 — gsv.fun 參數對齊（事後修復）

- [x] 5.1 將 `usePianFen.ts` 的 `GameType` 變數值從 `"GF"`/`"DM"` 修正為 API 實際接受的 `"g"`/`"d"`（`GAME_TYPE_MAP`），並更新 version 為 `"galaxywave_delta"`
- [x] 5.2 加入 `scope` 參數（預設 `7000`）解決 `kasegiNew` 回傳 null 問題；`scope` 代表玩家技能門檻，為必填參數
- [x] 5.3 將 `part` 過濾值從 `"guitar"`/`"bass"`/`"drum"` 修正為 API 實際回傳的 `"G"`/`"B"`/`"D"`（`ALLOWED_PARTS`）
- [x] 5.4 修正 `PART_LABEL` 的 key 為單字母碼（`G`/`B`/`D`），確保顯示正確
- [x] 5.5 強化錯誤處理：僅對 `GRAPHQL_VALIDATION_FAILED` 等 client-side 錯誤拋出；`INTERNAL_SERVER_ERROR`（server DB bug）視為空資料，避免顯示錯誤訊息
- [x] 5.6 處理 `kasegiNew` 回傳 `null` 的情況（`raw?.hot ?? []`），避免 TypeError 導致 `isError` 誤觸發

## 6. 技能段位選擇器（UX 擴充）

- [x] 6.1 在 `usePianFen.ts` 匯出 `SCOPE_TIERS`（6750～9500，間距 250）與 `ScopeTier` 型別，hook 簽名改為 `usePianFen(gameType, scope)`，queryKey 加入 scope 實現分段快取
- [x] 6.2 在 `PianFen.tsx` 新增段位選擇器 UI（水平捲動 pill 列表），預設 `7000`，點選後重新 fetch 對應段位資料

## 7. 導覽重構 — 移除獨立 /kasegi 路由（架構調整）

- [x] 7.1 刪除 `src/pages/Kasegi.tsx`，移除 `src/App.tsx` 中的 `/kasegi` 與 `/kasegi/:instrument` 路由及 lazy import
- [x] 7.2 BottomNav 由 5 項縮減為 4 項：移除「賺分曲」（`/kasegi`），將「騙分」改名「賺分曲」並保留路由 `/pian-fen`
- [x] 7.3 Sidebar 對應移除 `/kasegi` 項目，將「騙分」改名「賺分曲」
- [x] 7.4 在 `Dashboard.tsx` 的 `ScoreList` 排序選單加入「賺分潛力」選項（`SortKey: "kasegi"`），使用 `calculateKasegiPotential` 計算並排序；選擇此排序時 `ScoreRow` 右側改顯示 `+X.X` 潛力值

## 8. Supabase 權限修正

- [x] 8.1 新增 migration `005_grant_authenticated_permissions.sql`，對 `users`、`scores`、`friendships` 表補上 `GRANT` 給 `authenticated` role（原始 schema 只開 RLS 未授權，導致 403）
- [x] 8.2 修正 `useAuth.ts` race condition：移除 `getSession()` 立即呼叫 `fetchProfile` 的路徑，改為單一依賴 `onAuthStateChange`（`INITIAL_SESSION` 事件）作為資料載入觸發點，確保 JWT 完整就緒後才發出 Supabase 請求
