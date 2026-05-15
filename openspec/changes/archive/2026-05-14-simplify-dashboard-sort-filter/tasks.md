## 1. 移除 Quick-filter Chips（Sort Options on Dashboard Score List / Quick-filter Chips for Score Status）

- [x] 1.1 實作「Quick-filter Chips for Score Status」移除：在 `src/pages/Dashboard.tsx` 中，移除 `quickFilter` state（`useState<"all" | "underperforming">("all")`）及 `filtered` useMemo 中兩個 `quickFilter === "underperforming"` 的 branch（篩選與排序覆蓋）；驗證：切換 HOT/OTHER 和 source 仍正常運作，不再有「未達標」行為

- [x] 1.2 實作「Quick-filter Chips for Score Status」UI 清除：在 `src/pages/Dashboard.tsx` Row 2 的 JSX 中，移除 `(["all", "underperforming"] as const).map(...)` 整個 chip 迴圈及其 button 元素；驗證：瀏覽器中 filter bar Row 2 只剩下來源選單（全部來源），不顯示「全部」或「未達標」chip

## 2. 更新排序選項（Sort Options on Dashboard Score List）

- [x] 2.1 實作「Sort Options on Dashboard Score List」型別變更：在 `src/pages/Dashboard.tsx` 中，將 `SortKey` type 從 `"skill_point" | "achievement" | "title" | "level" | "kasegi"` 改為 `"home_skill" | "arcade_skill"`，並將 `useState<SortKey>` 的初始值改為 `"home_skill"`；驗證：TypeScript 編譯無型別錯誤

- [x] 2.2 在同一檔案的 `filtered` useMemo 排序邏輯中，移除 `skill_point`、`achievement`、`kasegi`、`level`、`title` 分支，改為：`home_skill` → 按 `家用版 Skill 點數` 降冪（無分數的歌曲排最後）；`arcade_skill` → 按 `街機版 Skill 點數` 降冪（無分數的歌曲排最後）；驗證：選「家機 Skill ↓」後成績頁依家機 Skill 由高到低排列，選「街機 Skill ↓」後依街機 Skill 排列

- [x] 2.3 在 `src/pages/Dashboard.tsx` Sort dropdown 的 `SelectContent` 中，移除 `skill_point`、`achievement`、`kasegi`、`level`、`title` 的 `SelectItem`，改為只保留 `<SelectItem value="home_skill">家機 Skill ↓</SelectItem>` 和 `<SelectItem value="arcade_skill">街機 Skill ↓</SelectItem>`；驗證：點開排序下拉選單只出現兩個選項

## 3. 修正 Loading Skeleton 樣式（Loading Skeleton Style on Dashboard）

- [x] 3.1 實作「Loading Skeleton Style on Dashboard」顏色修正：在 `src/components/SongCardSkeleton.tsx` 中，將各 `<Skeleton>` 元件的底色改為與卡片背景（`#1E1530`）協調的深色（移除 `bg-muted` 依賴，改以 inline style 設定 `background: "rgba(255,255,255,0.06)"`），使 shimmer 在深色背景上不顯眼；驗證：在 Dashboard 和 賺分曲 頁面 loading 時，skeleton 卡片不出現明顯亮色塊

- [x] 3.2 在 `src/pages/Dashboard.tsx` 的 `isLoading` 回傳區塊中，將包裹 div 的 className 改為 `"space-y-2 px-4 py-3"`，與 Index.tsx 的 `<main className="px-4 py-3">` 對齊；並移除 `SongCardSkeleton` 的 `marginBottom: 6`，改用 `animate-pulse` 取代 inline `<style>` shimmer；驗證：Dashboard 和 賺分曲 頁 loading 時卡片樣式、動畫、間距視覺一致

## 4. 統一其他頁面 Loading 樣式（Loading Skeleton Style on Dashboard）

- [x] 4.1 在 `src/pages/PianFen.tsx` 中，將賺分曲資料載入的 spinner（`<div className="flex justify-center py-16">` + `animate-spin` 圈圈）替換為 `<div className="space-y-2 px-4 py-3">` 內含 6 個 `SongCardSkeleton`；驗證：賺分曲頁資料載入時顯示卡片 skeleton，與 Dashboard/Index 視覺一致

- [x] 4.2 在 `src/App.tsx` 的 `PageLoader` 和 `src/components/ProtectedRoute.tsx` 的 `loading` 狀態中，加入說明文字（PageLoader 顯示「載入中…」、ProtectedRoute 顯示「驗證中…」），外層容器加 `flex-col gap-3`；驗證：全頁載入畫面顯示圈圈下方有對應文字

- [x] 4.3 修正 `src/App.tsx` 和 `src/components/ProtectedRoute.tsx` 中 spinner 的 CSS bug：將 `className` 的 `border-t-transparent` 移至 `style` 中以 `borderTopColor: "transparent"` 設定，避免被 `style={{ borderColor }}` 覆蓋；驗證：spinner 顯示為圓弧缺口環形而非完整實色環，旋轉動畫視覺可見

## 5. 合併來源選單與排序、恢復未達標 Toggle（Sort Options on Dashboard Score List）

- [x] 5.1 在 `src/pages/Dashboard.tsx` 中，將 `SortKey` type 擴充為 `"all" | "home_skill" | "arcade_skill"`，預設改為 `"all"`；移除獨立的 `source` state；新增 `underperforming` boolean state；在 `filtered` useMemo 中將來源篩選邏輯從 `source` state 改為從 `sortKey` 推導（`home_skill` → 只顯示有家機分數；`arcade_skill` → 只顯示有街機分數；`all` → 不 filter 來源）；驗證：選「全部」顯示全部歌曲，選「家機 Skill ↓」只顯示有家機分數的歌

- [x] 5.2 在 `src/pages/Dashboard.tsx` 的 `filtered` useMemo 中，加入 `underperforming` filter：依 `sortKey` 取對應的 playerSkill（家機/街機/max），篩選 `playerSkill < kasegiMap.get(key)` 且 key 存在的歌曲；active 時強制以 `(kasegiAvg - playerSkill)` 降冪排序；驗證：開啟「未達標」後僅顯示落後 kasegi 目標的歌曲，且差距最大的排最前

- [x] 5.3 在 `src/pages/Dashboard.tsx` Row 1 JSX 中，將 HOT/OTHER 包裹 div 改為 `w-1/2`，右側新增 `w-1/2 flex items-center gap-2` 區塊包含：（1）「未達標」toggle button（active 時 neon-pink 邊光，`whitespace-nowrap shrink-0`）、（2）sort dropdown（`flex-1`，三選項：全部 / 家機 Skill ↓ / 街機 Skill ↓）；整個 Row 2（來源 dropdown + 重設按鈕）移除；`hasFilter` 改為只看 `sortKey !== "all"`，不包含 `underperforming`；驗證：Row 1 左右各占約 50%，未達標按鈕不換行，點擊為 toggle 行為而非觸發重設按鈕

- [x] 5.4 在 `src/components/SongCard.tsx` 中，新增 `hideSource?: "arcade" | "home"` prop；在 `SongCardInner` 的 Score rows 區塊，以 `{hideSource !== "arcade" && <ScoreRow label="街" ... />}` 和 `{hideSource !== "home" && <ScoreRow label="家" ... />}` 條件渲染；在 `src/pages/Dashboard.tsx` 渲染 SongCard 時，依 `sortKey` 計算 `hideSource`（home_skill → "arcade"；arcade_skill → "home"；all → undefined）並傳入；驗證：選家機時卡片只顯示家行，選街機時只顯示街行，全部時兩行都顯示

- [x] 5.5 修正 `src/pages/Dashboard.tsx` 的「還差」計算：當 `overlayAvg`（kasegi 目標）存在時，`kasegiBarData` 改用 `{ potential: Math.max(0, overlayAvg - playerSkill), maxSkill: overlayAvg }` 取代原本的 `calculateKasegiPotential` 結果；`playerSkill` 依 `sortKey` 取對應的家機/街機/max Skill；驗證：卡片上「還差 X pt」顯示的是「目標 Skill − 玩家 Skill」（例：目標 150.3、玩家 144.6 → 還差 5.7 pt）
