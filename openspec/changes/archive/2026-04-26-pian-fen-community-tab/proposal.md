## Why

目前賺分曲（Kasegi）頁面只顯示玩家**自己**的成績缺口，無法得知社群中哪些曲目最常被用來刷技能分。gsv.fun 的社群資料（透過 GraphQL API）累積了大量玩家實際用來騙分的曲目，這份資料可作為新手或想快速衝分的玩家的參考清單。

## What Changes

- 新增「騙分」頁面（`/pian-fen/:instrument`），從 gsv.fun GraphQL API 撈取社群騙分曲清單
- 騙分頁面顯示 hot（HOT 版本）與 other（LONG AGO 版本）兩分類，各含曲名、譜面難度、定數、社群平均 Skill
- 在 Kasegi 頁面內的 GF/DM tab 旁新增「騙分」切換入口，或透過 Sidebar/BottomNav 整合
- 新增 `usePianFen` hook 負責呼叫 gsv.fun GraphQL endpoint，回傳解析後的曲目陣列
- 騙分頁面無需登入即可瀏覽（公開資料）

## Non-Goals

- 不修改 gsv.fun 的資料來源或後端
- 不整合用戶自身成績到騙分清單（騙分頁純顯示社群資料，不做個人化計算）
- 不新增搜尋或篩選功能（第一版先做基本列表顯示）

## Capabilities

### New Capabilities

- `pian-fen`: 從 gsv.fun GraphQL API 取得社群騙分曲清單，依 hot/other 分類、依 GF/DM 切換，並顯示曲名、譜面、定數、平均 Skill

### Modified Capabilities

- `bottom-navigation`: 底部導覽列由 4 項擴充為 5 項，新增「騙分」入口（`/pian-fen`）

## Impact

- Affected specs: pian-fen（新建）、bottom-navigation（修改）
- Affected code:
  - New: `src/pages/PianFen.tsx`
  - New: `src/hooks/usePianFen.ts`
  - New: `supabase/migrations/005_grant_authenticated_permissions.sql`
  - Modified: `src/components/layout/BottomNav.tsx`（5 項縮為 4 項，騙分→賺分曲）
  - Modified: `src/components/layout/Sidebar.tsx`（同上）
  - Modified: `src/App.tsx`（移除 /kasegi 路由）
  - Modified: `src/pages/Dashboard.tsx`（加入賺分潛力排序）
  - Modified: `src/hooks/useAuth.ts`（移除 getSession race condition）
  - Deleted: `src/pages/Kasegi.tsx`
  - Modified: `openspec/specs/bottom-navigation/spec.md`
