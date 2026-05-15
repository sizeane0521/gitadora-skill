## REMOVED Requirements

### Requirement: Dashboard View Toggle

**Reason**: 「目前成績」/「全部歌曲」兩個 Tab 造成功能斷層，由統一視圖（Unified Song and Score View）取代。HOT/OTHER Tab 切換提供等效的分類功能。
**Migration**: Dashboard 移除 `DashboardView` state 及相關按鈕。`SongsBrowseView` 組件不再在 Dashboard 渲染。
