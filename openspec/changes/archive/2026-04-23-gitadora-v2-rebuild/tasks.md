## 1. 專案基礎建設

- [x] 1.1 安裝 `@supabase/supabase-js` 依賴套件
- [x] 1.2 建立 `.env.local.example`，包含 `VITE_SUPABASE_URL` 與 `VITE_SUPABASE_ANON_KEY` 範本說明
- [x] 1.3 建立 `src/lib/supabase.ts`：初始化並匯出單一 Supabase client 實例（Supabase Client 集中初始化）
- [x] 1.4 建立 `src/types/database.ts`：定義 Supabase DB 英文欄位型別（users、songs、scores、friendships）
- [x] 1.5 建立 `supabase/migrations/001_initial_schema.sql`：建立 users、songs、scores、friendships 資料表及所有欄位

## 2. Design System CSS Variables

- [x] 2.1 在 `src/index.css` 加入所有 DESIGN.md 色票為 CSS 自訂屬性（Design System CSS Variables）
- [x] 2.2 在 `src/index.css` 加入 `[data-instrument="gf"]` 選擇器，設定 GF 主色 variables（`--color-brand: #FF6B35` 等）
- [x] 2.3 在 `src/index.css` 加入 `[data-instrument="dm"]` 選擇器，設定 DM 主色 variables（`--color-brand: #00A8E8` 等）
- [x] 2.4 在 `src/index.css` 加入 `[data-theme="dark"]` 選擇器，設定深色模式 semantic token mapping
- [x] 2.5 驗證 CSS variables 在根元素套用後，所有子元件均可正常存取 `--color-brand`、`--color-bg-primary`、`--color-text-primary`

## 3. RLS 政策

- [x] 3.1 在 `supabase/migrations/001_initial_schema.sql` 加入 `users` 表 RLS 政策：依 Supabase RLS 政策設計，實作 Row Level Security for Users（使用者只能讀寫自己的 row）
- [x] 3.2 加入 `scores` 表 RLS 政策：使用者可讀自己的成績（RLS for Scores and Friendships）
- [x] 3.3 加入 `scores` 表 RLS 政策：使用者可讀已接受好友的成績（RLS for Scores and Friendships）
- [x] 3.4 加入 `scores` 表 RLS 政策：使用者只能寫入自己的成績
- [x] 3.5 加入 `friendships` 表 RLS 政策：使用者只能讀取自己參與的好友關係記錄（RLS for Scores and Friendships）

## 4. Adapter Layer

- [x] 4.1 建立 `src/lib/adapter.ts`：實作 `dbScoreToSongData()` 函式，將 Supabase scores 英文欄位對應至 `SongData` 中文型別（Adapter Layer 隔離 DB 型別與 UI 型別）
- [x] 4.2 在 `adapter.ts` 加入 `songDataToDbScore()` 反向對應函式
- [x] 4.3 撰寫 `src/test/adapter.test.ts`：驗證 MOCK_DATA_GF 每筆資料可正確通過 adapter 雙向轉換

## 5. 使用者認證（user-auth）

- [x] 5.1 建立 `src/hooks/useAuth.ts`：封裝 `supabase.auth.getSession()`、`signInWithOAuth({ provider: 'google' })`、`signOut()`
- [x] 5.2 實作 Google OAuth Login：`useAuth` hook 的 `signIn` 方法呼叫 Google OAuth，完成後檢查是否為首次登入
- [x] 5.3 實作首次登入自動建立使用者資料：偵測 `users` 表無對應 row 時，以 Google 帳號資訊建立 profile
- [x] 5.4 實作 Returning user restores session：頁面載入時呼叫 `getSession()`，若有效則跳過登入頁
- [x] 5.5 建立 `src/pages/Login.tsx`：顯示 Google 登入按鈕，完成後導向 `/dashboard`
- [x] 5.6 建立 `ProtectedRoute` 元件：未認證使用者訪問保護路由時，Unauthenticated access is blocked，重導向 `/login`
- [x] 5.7 實作 Logout clears session：呼叫 `signOut()`，清除 session，重導向 `/`
- [x] 5.8 建立 `src/pages/Profile.tsx` 與 `src/pages/Settings.tsx`：實作 User Profile Management（display_name、avatar_url、konami_id、main_game 更新）
- [x] 5.9 實作 Update display name：表單驗證 1–50 字元，Display name length validation，送出後更新 `users` 表並顯示 toast

## 6. App Shell 與路由（app-shell）

- [x] 6.1 建立 `src/hooks/useInstrumentMode.ts`：儲存 GF/DM 模式至 localStorage，套用 `data-instrument` 屬性（GF/DM 模式以 data-instrument 屬性切換），實作 GF/DM Instrument Mode Switching
- [x] 6.2 建立 `src/components/layout/AppShell.tsx`：巢狀 React Router layout，包含 `<Outlet />`，實作 Multi-Page Routing 架構（Adapter Layer 集中路由）
- [x] 6.3 更新 `src/App.tsx`：依 React Router 多頁面路由結構，設定完整路由（`/`、`/login`、`/dashboard/*`、`/songs`、`/songs/:id`、`/kasegi/*`、`/friends/*`、`/import/*`、`/profile/*`）
- [x] 6.4 建立 `src/components/layout/BottomNav.tsx`（重構現有）：手機版底部導覽（5 個 tab），Active navigation item is highlighted，視窗寬度 < 768px 顯示
- [x] 6.5 建立 `src/components/layout/Sidebar.tsx`：桌面版左側 sidebar（240px），視窗寬度 ≥ 768px 顯示，Responsive Navigation
- [x] 6.6 實作 Root route redirects authenticated users to dashboard
- [x] 6.7 實作 Root route shows landing page for unauthenticated users（含 Login with Google 按鈕）
- [x] 6.8 實作 Light/Dark Theme Switching：點擊切換按鈕，設定 `data-theme`，寫入 localStorage `siz-gitadora-theme`，Theme persists across page reloads
- [x] 6.9 確認 Instrument mode persists across page reloads：頁面載入時從 localStorage 讀取並套用 `data-instrument`
- [x] 6.10 實作 Instrument mode defaults to user's main_game preference

## 7. 成績列表（score-list）

- [x] 7.1 建立 `src/hooks/useScores.ts`：封裝 Supabase scores query，以 `user_id` 與 `game_type` 篩選
- [x] 7.2 建立 `src/pages/Dashboard.tsx`：以 Tabs 切換 `/dashboard/gf`、`/dashboard/dm`、`/dashboard/compare`
- [x] 7.3 實作 Personal Score List Display for GF：`/dashboard/gf` 顯示 GF 成績，包含歌曲封面、難度、達成率、Skill 點數
- [x] 7.4 實作 Personal Score List Display for DM：`/dashboard/dm` 顯示 DM 成績
- [x] 7.5 實作 Empty state when no scores exist，含連結至 `/import`
- [x] 7.6 實作 Score Filtering：難度（BSC/ADV/EXT/MAS 多選）、Source filter（arcade/konaste/both）篩選面板
- [x] 7.7 實作 Reset filters 功能
- [x] 7.8 實作 Score Sorting：預設 skill_point 降冪（Default sort is skill point descending），支援其他排序選項
- [x] 7.9 實作 Score List Pagination：每頁 50 筆，Load more appends results
- [x] 7.10 實作 EXC and FC Badge Display：EXC badge 使用 exc-pink 色彩，FC badge 顯示邏輯
- [x] 7.11 實作 Arcade vs. Home Comparison View（`/dashboard/compare`）：並排顯示兩個來源的成績與 delta
- [x] 7.12 實作 Compare view Sort by delta 排序
- [x] 7.13 實作 Compare view Filter comparison by only one-sided scores

## 8. 賺分曲計算（kasegi）

- [x] 8.1 建立 `src/hooks/useKasegi.ts`：計算 Kasegi Skill Calculation（`Skill = level × (achievement_rate / 100) × 2`）並排序
- [x] 8.2 建立 `src/pages/Kasegi.tsx`：Kasegi List Display，含 GF/DM tab，實作 Kasegi GF/DM Tab Switching
- [x] 8.3 實作賺分曲列表顯示：song title、current skill、max skill、kasegi potential（skill-gold 顏色）
- [x] 8.4 實作 Empty state when no scores exist，含連結至 `/import`
- [x] 8.5 實作 Kasegi Filtering：Filter by difficulty range（min/max level 滑桿或輸入框）
- [x] 8.6 實作 Filter by source（arcade/konaste/both）
- [x] 8.7 實作 Exclude EXC scores 的 "Hide EXC" toggle
- [x] 8.8 驗證 Kasegi potential calculation is correct：level=7.5, achievement=90% → potential=1.5
- [x] 8.9 驗證 Scores at 100% have zero kasegi potential，排在列表最底部

## 9. 成績匯入（score-import）

- [x] 9.1 建立 `bookmarklet/arcade.js`：依 Bookmarklet 架構設計，實作街機版 Bookmarklet Authentication Check（讀取 localStorage session token）
- [x] 9.2 實作 arcade bookmarklet 的 Score Scraping from Konami Website（arcade）：解析 p.eagate.573.jp DOM 並提取成績欄位
- [x] 9.3 建立 `bookmarklet/konaste.js`：家用版 bookmarklet，實作 Score Scraping from Konami Website（konaste）
- [x] 9.4 實作兩支 bookmarklet 的 Score Upload to Supabase：upsert scores 資料，顯示 Successful score upload alert
- [x] 9.5 實作 User is not authenticated 的錯誤處理：顯示 alert 並中止
- [x] 9.6 實作 Bookmarklet runs on wrong page 的錯誤處理
- [x] 9.7 實作 Partial upload failure 的錯誤回報
- [x] 9.8 建立 `src/pages/Import.tsx`：Bookmarklet Generation and Display（拖拉連結 + 步驟說明），含 `/import/arcade` 和 `/import/konaste` 子頁
- [x] 9.9 實作 Import History Display：顯示最近一次匯入時間與筆數

## 10. 好友系統（friend-system）

- [x] 10.1 建立 `src/hooks/useFriends.ts`：封裝好友關係的 Supabase query（list、send request、respond）
- [x] 10.2 建立 `src/pages/Friends.tsx`：Friend List Display，含 `/friends/list`、`/friends/requests`、`/friends/:userId` 子路由
- [x] 10.3 實作 Friend List 顯示：顯示 accepted 好友的 display_name、avatar_url、main_game
- [x] 10.4 實作 Empty state when no friends exist，含連結至 `/friends/requests`
- [x] 10.5 實作搜尋好友的 UI（by display_name or email）與 Send friend request 功能，包含 Cannot send duplicate request、Cannot send request to self 的錯誤提示
- [x] 10.6 實作 Search returns no results 的空狀態顯示
- [x] 10.7 實作 Friend Request Response — Accept friend request（更新 status → 'accepted'）
- [x] 10.8 實作 Friend Request Response — Reject friend request（更新 status → 'rejected'）
- [x] 10.9 實作 Friend Request Response — Block user（更新 status → 'blocked'）
- [x] 10.10 建立 `/friends/:userId` 好友成績頁：Friend Score Viewing，顯示好友成績（與個人成績列表相同排版）
- [x] 10.11 實作 User cannot view non-friend's scores 的錯誤提示

## 11. Index.tsx 拆分策略

- [x] 11.1 依 Index.tsx 拆分策略，提取 `src/hooks/useScoreFilter.ts`：將現有 `Index.tsx` 的篩選、排序邏輯移至此 hook
- [x] 11.2 提取 `src/hooks/useSkillUp.ts`：將技術力提升計算邏輯從 `Index.tsx` 移至此 hook
- [x] 11.3 精簡 `src/pages/Index.tsx`：移除 hook 提取後的重複邏輯，確認現有功能正常運作

## 13. 歌曲詳細頁

- [x] 13.1 建立 `src/pages/Songs.tsx`：歌曲列表頁，依 game_type 篩選
- [x] 13.2 建立 `src/pages/SongDetail.tsx`：`/songs/:id`，顯示該曲所有難度的使用者成績與對照

## 14. 最終驗證

- [x] 14.1 RWD 測試：手機（< 640px）顯示底部導覽、桌面（> 768px）顯示側邊欄
- [x] 14.2 深色/淺色模式切換視覺測試，確認無 flash 問題（Theme persists across page reloads）
- [x] 14.3 GF/DM 模式切換，確認主色在 300ms 內完成過渡（Switching instrument mode changes primary color）
- [x] 14.4 RLS 權限測試：以兩個不同 user session 驗證無法互看非好友成績
- [x] 14.5 Bookmarklet 在 Chrome 與 Safari 測試匯入流程
