## Context

`useAuth()` 目前是獨立 hook（每個元件各自訂閱 `onAuthStateChange`）。`ProtectedRoute`、`Dashboard`、`Import`、`useScores` 等都各自持有獨立的 auth state，導致頁面切換時出現短暫的 `user = null` 狀態。

## Goals / Non-Goals

**Goals:**
- 所有元件共用同一個 auth state，`user` 在頁面切換時不重置
- 向下相容：所有 `useAuth()` 呼叫語法不需要改

**Non-Goals:**
- 不更改 Supabase Auth 登入流程或 API
- 不影響其他頁面

## Decisions

### Auth Context 封裝方式

保留現有的 `useAuth.ts` 不動，新增 `src/hooks/useAuthContext.tsx`：
- 建立 `AuthContext` 並 export `AuthProvider` 元件
- `AuthProvider` 內部呼叫一次 `useAuth()`，把結果放進 context
- export `useAuthContext()` hook 讀取 context
- 在 `src/main.tsx` 把 `<AuthProvider>` 包在 `<App>` 外層（或包在 `AppShell` 內）
- `ProtectedRoute`、`Dashboard`、`Import`、`useUnifiedSongList` 等逐步改用 `useAuthContext()`

`useAuth.ts` 本身不刪除，`AuthProvider` 內部仍使用它，確保只訂閱一次。

### Dashboard Header 設計

在 `Dashboard.tsx` GF/DM tab bar 上方加入 header section：
- 顯示「成績」文字標題
- 樣式使用 `var(--neon-pink)` / `var(--neon-cyan)` 與現有 tab 風格一致
- 不加入複雜統計，僅顯示標題

## Risks / Trade-offs

- [Risk] `AuthProvider` 的掛載位置需謹慎：若放在 `<BrowserRouter>` 外層，`useNavigate` 等 hooks 無法在 provider 內使用 → Mitigation: 放在 `AppShell` 內或 `<BrowserRouter>` 內但在 `<Routes>` 外
