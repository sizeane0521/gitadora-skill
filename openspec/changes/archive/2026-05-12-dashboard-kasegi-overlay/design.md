## Context

成績頁（`src/pages/Dashboard.tsx`）目前顯示玩家個人成績，但無法對照賺分曲清單。賺分曲資料來自 gsv.fun，已有 `usePianFen(gameType, scope)` hook 可直接呼叫，`PianFenRecord` 有 `name`（歌名）、`diff`（難度）、`averageSkill`（該分段社群平均 Skill）三個關鍵欄位。

目前 SongCard 已有 `kasegiBar` 選用 prop（本次不動），需新增另一個獨立 prop 傳遞賺分曲比對結果。

## Goals / Non-Goals

**Goals:**
- 成績頁 header 加入分段選擇器，預設 7000，選項為 `SCOPE_TIERS`
- fetch 選定分段的賺分曲清單（HOT + OTHER 合併），建立 `Map<name|diff, averageSkill>`
- 成績卡命中賺分曲時顯示「賺」badge 與 `averageSkill`
- 移除篩選列的 BSC/ADV/EXT/MAS chips

**Non-Goals:**
- 不顯示賺分曲清單中玩家未玩過的歌（需 catalogue 全量，屬獨立改動）
- 不修改賺分曲頁面
- 不改動 `kasegiBar` 已實作的功能

## Decisions

### Remove Difficulty Chips from Filter Bar

刪除 `ScoreList` 元件中 `difficulties` state、`toggleDiff` 函式、DIFFICULTIES 常數、難度 chip 按鈕群組、`filtered` useMemo 中的難度篩選邏輯，以及 `hasFilter`／`resetFilters` 中的難度相關條件。

### Scope Selector in Dashboard Header

在 Dashboard 元件（非 ScoreList）的 header section 加入分段選擇器：
- `scope` state 型別為 `ScopeTier`，初始值 `7000`，以 `localStorage.getItem("dashboard_scope")` 作為 fallback（讓玩家重開頁面後維持上次選擇）
- 寫入時同步 `localStorage.setItem("dashboard_scope", String(scope))`
- 選擇器按鈕樣式與 PianFen 頁相同（`SCOPE_TIERS` 橫列，active 用 `var(--neon-pink)` 邊框）
- `scope` 透過 props 傳入 `ScoreList`

### Fetch PianFen Data in ScoreList

`ScoreList` 接收 `scope: ScopeTier` prop，並在內部呼叫：
```
const { data: pianFenData } = usePianFen(gameType === "DM" ? "DM" : "GF", scope)
```

建立 lookup map（useMemo）：
```
key = `${record.name}|${record.diff}`
value = record.averageSkill
```
HOT 與 OTHER 陣列合併，key 重複時 HOT 優先。

### KasegiOverlay Prop on SongCard

`SongCard` 新增選用 prop：
```
kasegiOverlay?: { averageSkill: number } | null
```

命中賺分曲（`kasegiOverlay` 有值）時，在歌名右側顯示：
- 「賺」badge（`var(--neon-pink)` 邊框、字型 `var(--font-display)`、8px）
- `avg {averageSkill.toFixed(1)}` 文字（`var(--color-text-muted)`，10px）

比對 key 為 `song.歌曲名稱 + "|" + song.譜面等級`（e.g., `"GHOST|MAS"`）。

## Risks / Trade-offs

- [Risk] gsv.fun API 在成績頁額外呼叫一次，增加 network request → Mitigation: `usePianFen` 已有 5 分鐘 `staleTime`，切換 HOT/OTHER tab 不會重複 fetch；scope 未改變時 React Query 從 cache 取用
- [Risk] 歌名比對依賴 `song.歌曲名稱` 與 `PianFenRecord.name` 完全一致 → Mitigation: 兩者都來自 gsv.fun 資料，名稱格式應相同；不一致時 badge 只是不顯示，不會 crash
