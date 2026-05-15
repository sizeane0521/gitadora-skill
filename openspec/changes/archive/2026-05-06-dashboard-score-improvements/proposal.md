## Why

「成績」頁的篩選控制項使用了電腦科學術語（「降冪」）且包含低頻使用的等級篩選，造成玩家認知負擔。更重要的是，玩家需要在「成績」和「賺分曲」頁之間來回切換，才能判斷哪些已玩過的歌還有加分空間——這個比較應該直接在成績頁完成。

## What Changes

- 將 Sort dropdown 的「降冪」改為口語化的「由高到低」（`Skill 降冪` → `Skill 由高到低`、`達成率降冪` → `達成率 由高到低`、`難度降冪` → `難度 由高到低`）
- 移除等級篩選（minLevel dropdown）
- 新增 quick-filter chips：「全部」、「可加分」（達成率 < 95%）、「未達標」（達成率 < 80%）
- 在每張 SongCard 的底部加入「賺分空間」進度條，顯示當前 Skill 佔最高可能 Skill 的比例，以及還差多少點

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `dashboard-unified-view`: 新增 quick-filter chips（可加分 / 未達標）、賺分空間進度條顯示在 SongCard 上
- `score-list`: sort label 改為口語化中文、移除 minLevel 篩選

## Impact

- Affected specs: `dashboard-unified-view`、`score-list`
- Affected code:
  - Modified: `src/pages/Dashboard.tsx`
  - Modified: `src/components/SongCard.tsx`
