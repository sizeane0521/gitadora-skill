## 1. 更新「Quick-filter Chips for Score Status」UI

- [x] 1.1 實作「Quick-filter Chips for Score Status」UI 變更：在 `src/pages/Dashboard.tsx` 中，將 `quickFilter` 的型別從 `"all" | "improvable" | "underperforming"` 改為 `"all" | "underperforming"`，並從 chip 陣列移除 `"improvable"` 項目；驗證：Dashboard 頁面 Row 2 filter bar 只顯示「全部」和「未達標」兩個 chip，不出現「可加分」

## 2. 重新定義「未達標」篩選邏輯

- [x] 2.1 在 `src/pages/Dashboard.tsx` 的 `filtered` useMemo 中，將 `quickFilter === "underperforming"` 的條件從 `bestRate < 80` 改為 `Math.max(arcadeSkill, homeSkill) < kasegiMap.get(kasegiKey)`，且 key 不存在時排除該曲；驗證：切換至「未達標」後，列表只顯示 playerBestSkill 低於賺分曲平均 Skill 的歌曲，且賺分曲無資料的歌不出現

- [x] 2.2 在同一 useMemo 的排序邏輯中，加入當 `quickFilter === "underperforming"` 時強制以 `(kasegiAvgSkill − playerBestSkill)` 降冪排序，不受 `sortKey` 狀態控制；驗證：「未達標」模式下，差距最大的歌排在最上方，手動切換排序方式不改變順序
