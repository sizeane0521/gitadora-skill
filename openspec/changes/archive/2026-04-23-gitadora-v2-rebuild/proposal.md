## Why

現有程式碼由 Lovable AI 產生，僅有單一頁面、無後端、資料來源為 Google Sheets，無法支援使用者認證、好友系統與雙環境（家用/街機）成績分析等核心需求。為了讓 SIZ_GITADORA 成為真正可用的 Gitadora GF/DM 技術力追蹤工具，需要以 Supabase 為後端重建整個架構，並完整實作多頁面路由與 MVP 功能。

## What Changes

- **新增** Supabase 後端整合（PostgreSQL、Google OAuth、RLS）
- **新增** Google OAuth 登入與使用者 Profile 管理
- **新增** Bookmarklet 成績匯入（街機 + 家用 Konaste 各一支）
- **新增** 多頁面路由架構（`/`, `/login`, `/dashboard`, `/songs`, `/kasegi`, `/friends`, `/import`, `/profile`）
- **新增** GF/DM 雙模式主色切換（CSS variables，data-instrument 屬性控制）
- **新增** 深色/淺色模式手動切換
- **新增** 個人成績列表頁，支援篩選（難度、來源、評級）
- **新增** 家用 vs 街機對照視圖
- **新增** 個人賺分曲計算頁（Skill 潛力排序）
- **新增** 好友系統（邀請、接受、拒絕、封鎖）+ RLS 政策
- **重構** `src/App.tsx`：從單路由擴展為完整路由結構
- **重構** `src/pages/Index.tsx`：拆分為獨立頁面元件 + hooks
- **重構** `src/lib/api.ts`：從 Google Sheets 改為 Supabase client
- **新增** Adapter layer：將 Supabase 英文欄位對應至現有 `SongData` 中文型別，減少 UI 元件改動
- **保留** `src/components/ui/*`（shadcn/ui）— 不改動
- **保留** `src/hooks/use-theme.tsx`、`use-mobile.tsx`、`use-pull-to-refresh.ts` — 可繼續使用

## Non-Goals

- 不實作多語系（日文）
- 不實作成就徽章系統（Phase 4，範圍外）
- 不實作成績歷史趨勢圖（Phase 3）
- 不切換框架（維持 Vite + React，不改為 Next.js）
- Supabase 帳號與 Google OAuth 設定需由使用者手動完成，不在本 change 範圍內

## Capabilities

### New Capabilities

- `user-auth`：Google OAuth 登入、Supabase session 管理、使用者 Profile CRUD（display_name、avatar、konami_id、main_game）
- `score-import`：Bookmarklet JavaScript 開發（街機版 + 家用版），抓取 Konami 官網成績並 POST 至 Supabase，匯入教學頁
- `score-list`：個人成績列表顯示，支援 GF/DM 切換、難度篩選、來源篩選（家用/街機）、家用 vs 街機對照視圖
- `kasegi`：個人賺分曲推薦計算（Skill = 定數 × 達成率/100 × 2），依難度區間篩選，依 Skill 潛力排序
- `friend-system`：好友邀請（搜尋 email/display_name、發送請求）、接受/拒絕/封鎖、好友成績瀏覽（RLS 控管）
- `app-shell`：React Router 多頁面路由、RWD 導覽（手機底部 nav / 桌面 sidebar）、GF/DM 模式切換、深色/淺色主題切換

### Modified Capabilities

（無，openspec/specs/ 目前為空）

## Impact

- **新增檔案**：
  - `src/lib/supabase.ts`（Supabase client 初始化）
  - `src/lib/adapter.ts`（Supabase 英文欄位 → SongData 中文型別對應）
  - `src/types/database.ts`（Supabase DB 型別定義）
  - `src/pages/Login.tsx`
  - `src/pages/Dashboard.tsx`（含 GF / DM / Compare 子頁）
  - `src/pages/Songs.tsx`、`src/pages/SongDetail.tsx`
  - `src/pages/Kasegi.tsx`
  - `src/pages/Friends.tsx`（含 List / Requests / FriendDetail 子頁）
  - `src/pages/Import.tsx`（含 Arcade / Konaste 子頁）
  - `src/pages/Profile.tsx`、`src/pages/Settings.tsx`
  - `src/components/layout/AppShell.tsx`（路由 layout，含 nav）
  - `src/components/layout/BottomNav.tsx`（重構現有 BottomNav.tsx）
  - `src/components/layout/Sidebar.tsx`
  - `src/hooks/useAuth.ts`、`useScores.ts`、`useKasegi.ts`、`useFriends.ts`
  - `bookmarklet/arcade.js`、`bookmarklet/konaste.js`
  - `supabase/migrations/001_initial_schema.sql`
  - `.env.local.example`
- **重構檔案**：
  - `src/App.tsx`（擴展路由）
  - `src/pages/Index.tsx`（拆分邏輯至 hooks + 子頁）
  - `src/lib/api.ts`（替換為 Supabase queries）
  - `src/types/song.ts`（新增英文 DB 型別，保留現有中文型別）
  - `src/index.css`（加入 DESIGN.md 的 CSS variables）
- **新增依賴**：`@supabase/supabase-js`、`zustand`（如需要）
