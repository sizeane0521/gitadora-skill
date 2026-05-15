## 1. Personal Score List Display — SongCard Line 2 佈局重構

- [x] 1.1 依「兩端佈局取代 justify-between」設計決策，重構 `SongCardInner` 的 Line 2 div（`src/components/SongCard.tsx`）：將頂層 `justify-between` 改為兩子容器結構，左容器（`flex items-center gap-1 flex-1 min-w-0`）放樂器名稱與條件元素，右容器（`flex items-center gap-1 flex-shrink-0`）放 diff badge 和難度數值。驗證：渲染任意一張有 `kasegiOverlay` 的卡片和一張沒有的卡片，確認 diff badge 與難度數值的水平位置一致（右對齊）。

- [x] 1.2 依「條件元素置於左容器」設計決策，將 `wishlistItem` badge 和 `kasegiOverlay` 目標數字從頂層 flex 移入左容器（樂器名稱右側）。驗證：同時存在 `wishlistItem` 和 `kasegiOverlay` 的卡片不應造成右側 diff+level group 被擠出視窗或換行。

- [x] 1.3 確認右容器的 diff badge 保留所有現有樣式屬性（`padding`, `borderRadius`, `fontFamily`, `fontSize`, `fontWeight`，深色/淺色模式 inline style），難度數值保留 `color`, `fontFamily`, `fontSize`, `flexShrink: 0`。驗證：視覺上與修改前的顏色和尺寸一致（手動比對截圖）。

## 2. 驗收確認

- [x] 2.1 在瀏覽器中開啟 `/dashboard/gf`，確認所有卡片的 Line 2 均呈現為：左側樂器名稱、右側 `[diff badge][數值]` 群組，且群組位置不隨卡片是否有目標/wishlist 元素而移動。截圖對比 issue 中的截圖（乱腸の舞姫 卡片的標籤不再跑掉）。

- [x] 2.2 在 `/dashboard/dm` 確認 Drums 卡片的 Line 2 同樣呈現正確順序（Drums 左、diff+level 右），無條件元素差異造成的排版偏移。
