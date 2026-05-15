## Why

目前介面有三個視覺問題導致「很醜」的感受：(1) Russo One 字型只套用在 h1–h6，但 Dashboard 和底部導覽列沒有任何 heading tag，字型完全沒有作用；(2) BottomNav 的 NavLink 缺少 `position: relative`，active 指示器（`absolute bottom-0`）無法正確定位；(3) active state 只有顏色變化，缺乏遊戲感的視覺衝擊。此外，使用者預期在成績頁可以切換「目前成績」和「全部歌曲」，但目前缺少此功能。

## What Changes

- GF / DM / 對照 TabsTrigger 明確套用 `font-display`（Russo One）
- BottomNav NavLink 加入 `position: relative`，修復 active 指示器定位
- BottomNav active 狀態重設計為填色膠囊（filled pill）樣式，含品牌色背景和微發光陰影
- BottomNav label 套用 `font-display`
- Dashboard 頂部加入「目前成績 / 全部歌曲」文字切換 toggle，預設顯示「目前成績」，切換後顯示歌曲目錄內容

## Non-Goals

- 不修改 Songs.tsx 頁面本身的邏輯
- 不更動 `/songs` 路由（仍保留，供直接存取）
- 不修改 Sidebar 的 nav 項目樣式
- 不新增動畫效果（留待後續 change）

## Capabilities

### New Capabilities

- `dashboard-view-toggle`: Dashboard 頁面支援在「目前成績」和「全部歌曲」兩個視圖之間切換

### Modified Capabilities

- `bottom-navigation`: BottomNav active 狀態視覺改為 filled pill 設計，修復 active 指示器定位問題

## Impact

- Affected specs: `dashboard-view-toggle`（新增）、`bottom-navigation`（修改）
- Affected code:
  - Modified: `src/pages/Dashboard.tsx`
  - Modified: `src/components/layout/BottomNav.tsx`
