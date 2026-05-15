## Context

Dashboard 成績頁（`src/pages/Dashboard.tsx`）目前的篩選列包含等級篩選（minLevel）和使用電腦術語的排序標籤（「降冪」）。SongCard（`src/components/SongCard.tsx`）已有 `skillUpInfo` 選用 prop 用於 PianFen 頁的技術資訊顯示，但 Dashboard 未傳入任何賺分相關資訊。`calculateKasegiPotential` 已存在於 `src/hooks/useKasegi.ts`，Dashboard 也已 import 它用於排序邏輯。

## Goals / Non-Goals

**Goals:**
- 排序標籤改為口語化繁中，降低認知負擔
- 移除低頻使用的等級篩選
- 新增語意化 quick-filter chips，讓玩家快速找到「有加分空間」的歌
- SongCard 顯示賺分空間進度條，讓玩家無需切換頁面即可判斷哪首歌值得繼續衝

**Non-Goals:**
- 不顯示未遊玩（從未有成績）的歌曲——需要 catalogue 全量查詢，屬於獨立改動
- 不修改 PianFen 頁面
- 不更動 SongCard 的現有 ScoreRow 佈局

## Decisions

### Sort Dropdown Labels in Natural Chinese

將 Dashboard `ScoreList` 的 `<SelectItem>` 文字從「X 降冪」改為「X 由高到低」。直接改字串，不動資料結構或排序邏輯。

### Remove Minimum Level Filter

刪除 `minLevel` state、相關 `<Select>` 控制項、filter 邏輯中的 level 判斷，以及 `hasFilter` 計算中的 `minLevel !== null` 條件。`LEVEL_OPTIONS` 常數一併刪除。

### Quick-filter Chips for Score Status

新增 `quickFilter` state，型別為 `"all" | "improvable" | "underperforming"`，初始值為 `"all"`。

門檻定義（基於最佳達成率，arcade 與 konaste 取最高值）：

| Chip | 條件 | 說明 |
|------|------|------|
| 全部 | 無過濾 | 預設 |
| 可加分 | bestRate < 95% | 還有明顯加分空間 |
| 未達標 | bestRate < 80% | 分數偏低，賺分潛力大 |

chips 放在 Row 2 最前方，取代原本 minLevel dropdown 的位置。切換 chip 時 reset page 至 1。`hasFilter` 計算加入 `quickFilter !== "all"` 條件。

### Kasegi Bar on Dashboard SongCard

SongCard 新增選用 prop `kasegiBar?: { potential: number; maxSkill: number } | null`。

Dashboard 的 `ScoreList` 在 render 每張 SongCard 時，使用已 import 的 `calculateKasegiPotential` 計算並傳入：`bestRate = Math.max(arcadeRate, konsteRate)`，然後 `{ potential, maxSkill } = calculateKasegiPotential(song.難度數值, bestRate)`。

SongCard 在現有 ScoreRow 區塊下方顯示：
- 標籤「賺分空間」（`var(--font-display)`，`var(--neon-pink)`，10px）
- 進度條：寬度 = `(1 - potential / maxSkill) * 100%`，背景 neon-pink
- 右側文字：「還差 X.X pt」（potential 四捨五入到小數一位）
- 若 `kasegiBar` 為 null 或未傳入，整個區塊不顯示

`kasegiBar` 為 optional prop——PianFen 等其他使用 SongCard 的地方不受影響。

## Risks / Trade-offs

- [Risk] 95% / 80% 的門檻是設計假設，可能與玩家實際習慣不符 → Mitigation: 門檻以常數定義，易於後續調整
- [Risk] `kasegiBar` prop 增加 SongCard 與 Dashboard 的耦合 → Mitigation: prop 為 optional，不影響其他頁面
