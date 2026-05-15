## Context

現有 SIZ_GITADORA 由 Lovable AI 產生，是一個純前端 SPA（Vite + React + TypeScript + Tailwind + shadcn/ui），資料來源為 Google Sheets。整個 app 只有一個路由（`/`），所有邏輯集中在 `src/pages/Index.tsx`（519 行）。`src/types/song.ts` 使用中文欄位名稱（`家用版最佳達成率 (%)`、`街機版 Skill 點數` 等）。

目標是在不重寫 UI 元件的前提下，以 Supabase 取代 Google Sheets 後端，加入多頁面路由、認證、雙環境成績分析與好友系統。

**約束條件：**
- 保留現有 `src/components/ui/*`（shadcn/ui）不改動
- 保留現有 `SongData` 中文型別（避免同時重構 UI 與資料層造成衝突）
- 使用 Adapter layer 隔離 DB 型別與 UI 型別
- 不切換框架（維持 Vite）

## Goals / Non-Goals

**Goals:**

- 以 Supabase 取代 Google Sheets 作為唯一資料來源
- 實作 Google OAuth 登入，未登入者無法看到任何成績資料
- 實作 Bookmarklet 匯入（街機 + 家用各一）
- 建立多頁面路由（8 個主要路由，含子路由）
- 實作 GF/DM 雙模式主色切換與深色/淺色主題切換
- 實作賺分曲計算邏輯（Skill = 定數 × 達成率/100 × 2）
- 實作好友系統（含 Supabase RLS 政策）
- RWD：手機底部導覽、桌面側邊欄

**Non-Goals:**

- 不切換框架至 Next.js
- 不實作 SSR / SEO
- 不實作成就徽章系統
- 不實作成績歷史趨勢圖
- 不實作多語系（日文）
- Supabase 帳號建立與 Google OAuth Console 設定由使用者手動完成

## Decisions

### Adapter Layer 隔離 DB 型別與 UI 型別

**決定**：新增 `src/lib/adapter.ts`，在 Supabase query 回傳後立即將英文欄位對應至現有 `SongData` 中文型別。所有 UI 元件繼續使用 `SongData`，不需要修改。

**理由**：若同時修改 DB 型別與 UI 元件，風險極高（兩個方向的 breaking change）。Adapter layer 讓資料層與 UI 層可以獨立演進。未來當 UI 元件全面更新後，再移除 Adapter。

**替代方案**：直接改所有 UI 元件使用英文欄位 → 風險過高，一次改動範圍太大。

### Supabase Client 集中初始化

**決定**：建立 `src/lib/supabase.ts`，匯出單一 Supabase client 實例。所有 query 都從這裡匯入 client，不散落各元件。

**理由**：避免多個 client 實例造成 session 不一致，且方便測試替換。

### GF/DM 模式以 data-instrument 屬性切換

**決定**：在 `<html>` 或頁面最外層 div 上設置 `data-instrument="gf"` 或 `data-instrument="dm"`，CSS variables 對應切換主色。切換邏輯放在 `useInstrumentMode` hook 中，以 localStorage 持久化。

**理由**：純 CSS 切換，無需 JS 重新計算，效能最佳。所有元件自動跟著變色，不需要 prop drilling。

**替代方案**：用 Tailwind 的 `class` 切換 → 需要大量 `gf:bg-xxx dm:bg-xxx` 條件 class，維護困難。

### React Router 多頁面路由結構

**決定**：採用 React Router v6 的巢狀路由，`AppShell` 作為 layout component（含導覽列），內部 `<Outlet />` 渲染各子頁。未登入使用者訪問需要認證的路由時，自動導向 `/login`。

**路由結構：**
```
/ → 首頁（未登入顯示 Landing，已登入導向 /dashboard）
/login → 登入頁
/dashboard → Dashboard（AppShell 內）
/dashboard/gf → GF 成績總覽
/dashboard/dm → DM 成績總覽
/dashboard/compare → 家用 vs 街機對照
/songs → 歌曲列表
/songs/:id → 單曲詳細
/kasegi → 賺分曲（預設 GF）
/kasegi/gf → GF 賺分曲
/kasegi/dm → DM 賺分曲
/friends → 好友管理
/friends/list → 好友列表
/friends/requests → 好友邀請
/friends/:userId → 好友成績
/import → 匯入教學
/import/arcade → 街機版
/import/konaste → 家用版
/profile → 個人資料
/profile/settings → 設定
```

### Bookmarklet 架構

**決定**：Bookmarklet 為壓縮後的 JavaScript，執行時：
1. 檢查 localStorage 是否有 Supabase session token
2. 抓取 Konami 官網當前頁面的成績資料（DOM parsing）
3. 將資料 POST 到 Supabase REST API（scores table）
4. 顯示成功/失敗訊息

街機版（`bookmarklet/arcade.js`）與家用版（`bookmarklet/konaste.js`）分開，因為 DOM 結構不同。

**替代方案**：browser extension → 安裝門檻高，Bookmarklet 更符合 Gitadora 玩家的使用習慣（參考 gsv.fun）。

### Supabase RLS 政策設計

**決定**：三張核心表都啟用 RLS：
- `users`：只能讀寫自己的資料
- `scores`：可讀自己的成績 + 好友的成績（friendships.status = 'accepted'）
- `friendships`：只能看到自己參與的好友關係

**理由**：RLS 在 DB 層強制執行，即使前端有 bug 也不會洩漏其他使用者資料。

### Index.tsx 拆分策略

**決定**：將現有 `src/pages/Index.tsx` 的邏輯拆分為：
- `useScoreFilter` hook：篩選、排序邏輯
- `useSkillUp` hook：技術力提升計算
- 各頁面元件只做 UI 渲染，不含業務邏輯

**理由**：Index.tsx 目前 519 行，混合了 UI、篩選邏輯、pull-to-refresh，難以維護。拆分後每個 hook/元件職責單一。

## Risks / Trade-offs

- **[風險] Adapter Layer 增加複雜度** → 每個新功能需要同時維護 DB 型別和 UI 型別的對應。緩解：在 `adapter.ts` 集中管理所有對應邏輯，未來統一升級。
- **[風險] Bookmarklet 因 Konami 官網改版而失效** → 緩解：模組化 DOM parser，改版時只需更新 parser，不影響上傳邏輯。
- **[風險] Supabase RLS 設定錯誤導致資料洩漏** → 緩解：每個 RLS 政策都要有對應的測試（用不同 user session 驗證）。
- **[風險] Index.tsx 拆分中斷現有功能** → 緩解：採用漸進式拆分，先提取 hook 再刪除舊邏輯，確保每一步都能運行。
- **[Trade-off] 維持 Vite 而非 Next.js** → 未來如需 SSR 或 API routes 需要額外工作量。但此時機不換框架風險較低。

## Migration Plan

1. 安裝 `@supabase/supabase-js`，建立 `src/lib/supabase.ts`
2. 建立 Supabase migration SQL（`supabase/migrations/001_initial_schema.sql`）
3. 實作 Adapter layer，驗證現有 mock data 能正確對應
4. 建立 `useAuth` hook，實作 Google OAuth 登入流程
5. 建立 `AppShell` + 路由結構，確保導覽正常運作
6. 逐一實作各頁面，以 mock data 開發，再接 Supabase
7. 實作 Bookmarklet，以真實資料測試匯入
8. 實作好友系統 + RLS，最後驗證權限隔離

## Open Questions

- Bookmarklet 的具體 DOM selector 需要分析 Konami 官網的實際 HTML 結構（需要玩家登入後確認）
- Konaste 與街機官網的 DOM 結構差異有多大？是否可以共用部分 parser 邏輯？
- 使用者是否需要手動輸入 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 至 `.env.local` 後才能開始開發？
