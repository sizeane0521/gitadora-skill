## 1. 提取 SongsBrowseView 元件（全部歌曲內容直接 import Songs 的核心邏輯，不重複）

- [x] 1.1 新建 `src/components/SongsBrowseView.tsx`，將 `src/pages/Songs.tsx` 的核心邏輯（`useSongs` hook、GF/DM toggle、搜尋列、無限滾動列表、回到頂部按鈕）移入此元件，props 接受 `className?: string`
- [x] 1.2 修改 `src/pages/Songs.tsx`，將頁面內容改為直接 render `<SongsBrowseView />`，確保 Songs 頁功能不變

## 2. Dashboard 視圖切換 toggle（Toggle 狀態用 local state，不存 URL 也不存 localStorage）

- [x] 2.1 在 `src/pages/Dashboard.tsx` 頂部加入 `useState<"scores" | "songs">` 狀態，預設 `"scores"`，符合「Toggle 狀態用 local state」設計決策
- [x] 2.2 在 Dashboard sticky header 內（`<TabsList>` 上方）加入視圖 toggle：左側「目前成績」、右側「全部歌曲」，兩者皆為文字按鈕，active 套用 `font-display` 和 `var(--color-brand)` 顏色，inactive 套用 `var(--color-text-muted)` 顏色
- [x] 2.3 當 view 為 `"scores"` 時渲染 `<TabsList>` 和 `<TabsContent>`（現有成績邏輯），當 view 為 `"songs"` 時隱藏 Tabs 改渲染 `<SongsBrowseView />`，滿足 Dashboard View Toggle 和 Song Browse Inside Dashboard 規格
- [x] 2.4 在 GF / DM / 對照 的 `<TabsTrigger>` 加入 `className="font-display"`，使 Russo One 字型套用至 tab 標籤

## 3. BottomNav filled pill active 設計

- [x] 3.1 在 `src/components/layout/BottomNav.tsx` 的 `NavLink` 元素加入 `className="relative"`，修復 active 指示器定位問題，符合「Bottom Navigation Items」規格
- [x] 3.2 將 BottomNav active 狀態重設計（BottomNav filled pill active 設計）：active 時 icon 和 label 橫排顯示並包在 pill 容器內（`px-3 py-1 rounded-full`），背景 `var(--color-brand)` 15% opacity，文字 `var(--color-brand)`，加 `box-shadow: 0 0 8px color-mix(in srgb, var(--color-brand) 30%, transparent)`；移除原有 `absolute bottom-0` 的橫線元素，滿足「Bottom Navigation Active State」規格
- [x] 3.3 所有 nav item 的 `<span>` label 加入 `font-display` class，套用 Russo One，滿足「Font display applied to labels」規格

## 4. 驗證

- [x] 4.1 確認手機尺寸（375px）下 BottomNav active 項目顯示 filled pill，inactive 顯示 icon+label 垂直排列
- [x] 4.2 確認 Dashboard 頂部顯示「目前成績 / 全部歌曲」toggle，預設選中「目前成績」
- [x] 4.3 點擊「全部歌曲」確認歌曲列表出現、搜尋可用、點歌跳轉 `/songs/:id`
- [x] 4.4 確認 GF / DM / 對照 tab 文字使用 Russo One 字型
