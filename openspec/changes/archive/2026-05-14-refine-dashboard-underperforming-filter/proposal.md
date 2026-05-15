## Summary

移除 Dashboard 的「可加分」快速篩選，並將「未達標」重新定義為「你的 Skill 低於賺分曲平均 Skill」，同時在該篩選啟用時自動以差距（平均 Skill − 你的 Skill）由大到小排序。

## Motivation

現行兩個 quick-filter chip（「可加分」= 達成率 < 95%、「未達標」= 達成率 < 80%）皆以固定達成率門檻判斷，與已有的賺分曲 `average_skill` 資料完全無關，且「可加分」幾乎對所有歌都成立，篩選無意義。`kasegiMap`（keyed by `name|diff|part`）已在 Dashboard 組件中建立，可直接比對。

## Proposed Solution

1. 從 `["all", "improvable", "underperforming"]` 中移除 `improvable`，UI chip 改為 `["all", "underperforming"]`，標籤分別為「全部」、「未達標」
2. 將 `underperforming` 的篩選條件改為：`yourSkill < kasegiMap.get(key)`，其中 `yourSkill = Math.max(街機 Skill, 家機 Skill)`，`key = "${name}|${diff}|${part}"`
3. 若賺分曲資料中無對應 key，該曲不列入「未達標」（即視為達標）
4. 當 `quickFilter === "underperforming"` 時，排序自動切換為 `(kasegiMap.get(key) ?? yourSkill) - yourSkill` 降冪（差距最大排最前），不受 sortKey 的「排序方式」控制

## Non-Goals

- 不修改「可加分」在 Index 頁面（賺分曲 overlay 相關）的 `skillUpMode` 邏輯
- 不更動 `kasegiMap` 的建構方式或資料來源
- 不新增任何 UI 元件，只改 chip 數量與 filter 邏輯

## Impact

- Affected specs: `dashboard-unified-view`
- Affected code:
  - Modified: `src/pages/Dashboard.tsx`
