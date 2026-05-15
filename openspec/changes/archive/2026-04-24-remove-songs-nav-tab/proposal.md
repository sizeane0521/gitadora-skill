## Why

「歌曲」Tab 與「成績」Tab 視覺上相似（都顯示歌曲列表），導致使用者不清楚兩者的用途差異。「全部歌曲」功能未來將整合進「成績」頁作為子視圖，現階段先從導覽列移除，減少重疊感。

## What Changes

- 從 Bottom Nav 移除「歌曲」入口（`/songs`）
- 從 Desktop Sidebar 移除「歌曲列表」入口（`/songs`）
- `/songs` 及 `/songs/:id` 路由保留，供 SongDetail 連結使用

## Non-Goals

- 不修改 `/songs` 或 `/dashboard` 頁面本身的任何邏輯
- 不新增「全部歌曲」子視圖（此為未來功能）
- 不更動登入後的預設跳轉路由（仍為 `/dashboard`）

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `bottom-navigation`: Bottom Nav 顯示的項目清單從 5 個縮減為 4 個，移除「歌曲」入口

## Impact

- Affected specs: `bottom-navigation`
- Affected code:
  - Modified: `src/components/layout/BottomNav.tsx`
  - Modified: `src/components/layout/Sidebar.tsx`
