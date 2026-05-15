## 1. 建立 AuthContext

- [x] 1.1 依照 Auth Context 封裝方式的設計決策，新增 `src/hooks/useAuthContext.tsx`：建立 `AuthContext`（型別為 `ReturnType<typeof useAuth>`），export `AuthProvider` 元件（內部呼叫 `useAuth()` 並透過 context 提供結果），export `useAuthContext()` hook（讀取 context，若在 Provider 外呼叫則 throw error）
- [x] 1.2 在 `src/App.tsx` 的 `<BrowserRouter>` 內、`<Routes>` 外層包入 `<AuthProvider>`，使所有路由元件都能存取共享 auth state（符合 Shared Auth Context 規格的單一訂閱需求）

## 2. 更新元件使用 useAuthContext

- [x] 2.1 在 `src/components/ProtectedRoute.tsx` 將 `useAuth()` 改為 `useAuthContext()`，確認 `session`、`loading`、`user` 行為不變
- [x] 2.2 在 `src/pages/Dashboard.tsx` 的 `ScoreList` 和主元件將 `useAuth()` 改為 `useAuthContext()`
- [x] 2.3 在 `src/pages/Import.tsx` 將 `useAuth()` 改為 `useAuthContext()`
- [x] 2.4 在 `src/hooks/useUnifiedSongList.ts` 將 `useAuth()` 改為 `useAuthContext()`

## 3. Dashboard Header

- [x] 3.1 依照 Dashboard Header 設計，在 `src/pages/Dashboard.tsx` 的 GF/DM tab bar 上方加入 header section：顯示「成績」標題，使用 `var(--font-display)` 字型、`var(--neon-pink)` 顏色，padding 與 PianFen 頁面一致，非 sticky（符合 Dashboard Page Header 規格）

## 4. 驗證

- [x] 4.1 切換至賺分曲再切回成績，確認成績列表立即顯示、不出現「尚無歌曲資料」空白畫面
- [x] 4.2 確認 Dashboard 頁面頂端顯示「成績」header
- [x] 4.3 確認登入、登出流程正常（ProtectedRoute 導向正確）
