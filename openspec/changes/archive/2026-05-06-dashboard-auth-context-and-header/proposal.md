## Problem

Dashboard 成績頁（`/dashboard/gf`、`/dashboard/dm`）在使用者切換到其他頁面再切回來後，會短暫或持續顯示「尚無歌曲資料」。此外，Dashboard 缺少類似賺分曲（PianFen）頁面的頁面標題 header，視覺一致性不足。

## Root Cause

`useAuth()` 是獨立 hook，每個呼叫它的元件都建立各自的 `onAuthStateChange` 訂閱與獨立 state。當元件 unmount 再 remount（頁面切換），新的元件實例的 `user` 初始值為 null，導致 `useScores` 的 `enabled: !!userId` 為 false，scores query 被停用。等到 `onAuthStateChange` 觸發（需等待非同步的 `fetchProfile`）才恢復。這段空窗期讓畫面顯示「尚無歌曲資料」。

## Proposed Solution

**Bug fix**：將 `useAuth()` 改為 React Context 模式（`AuthProvider` + `useAuthContext`），在 `AppShell` 或根元件掛載一次，所有子元件共用同一份 auth state。如此 `user` 在頁面切換時不會重置為 null。

**Enhancement**：在 Dashboard GF/DM tab bar 上方加入頁面標題 header，樣式與賺分曲頁面一致（顯示「成績」標題、顯示當前總 Skill 點數或筆數摘要）。

## Non-Goals

- 不修改 Supabase Auth 登入流程
- 不更改 `signIn` / `signOut` API
- 不修改 PianFen、Friends、Import 等其他頁面的 header 設計
- Header 不顯示複雜的統計資訊（僅顯示標題與簡單摘要）

## Success Criteria

- 切換至其他頁面再切回 Dashboard，成績列表立即顯示，不出現「尚無歌曲資料」空白畫面
- Dashboard 頁面頂端顯示「成績」標題 header，與賺分曲風格一致
- `useAuth()` 在所有現有呼叫方（Dashboard、Import、ProtectedRoute 等）不需修改呼叫語法，向下相容

## Impact

- Affected code:
  - New: `src/hooks/useAuthContext.tsx`
  - Modified: `src/main.tsx`
  - Modified: `src/hooks/useAuth.ts`
  - Modified: `src/components/ProtectedRoute.tsx`
  - Modified: `src/pages/Dashboard.tsx`
