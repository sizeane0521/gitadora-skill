## Context

SongCard 是 Dashboard 和 PianFen 共用的元件。本次改動只影響 Dashboard 的使用方式；PianFen 不傳 `kasegiBar`/`kasegiOverlay`，不受影響。

## In Scope

- `SongCard.tsx`：重構 card 內部 layout，移除 `kasegiBar` prop，新增未達標行內顯示邏輯
- `Dashboard.tsx`：移除 `kasegiBar` 相關計算與傳遞，保留 `kasegiOverlay` 資料邏輯

## Out of Scope

- PianFen 頁任何改動
- Dashboard 排序、篩選、pagination
- `kasegiOverlay` 資料來源（`kasegiMap`、`useKasegiFromDB`）

## Prop Interface Changes

移除 `kasegiBar?: { potential: number; maxSkill: number } | null`。

`kasegiOverlay?: { averageSkill: number } | null` 和 `hideSource?: "arcade" | "home"` 保持不變，繼續用於行內 badge 顯示與 score row 隱藏。

## New SongCard Layout

```
[rank]  [cover 40×40]    [instrIcon] SongTitle
        [DIFF  ]          Instrument     [未達標 badge ―X.X]  目標 XXX.X
        [level ]          ── neon-pink gradient separator ──
                          街  ████████████████  XXX.X   (hidden if hideSource="arcade")
                          家  ████████████████  XXX.X   (hidden if hideSource="home")
```

## 未達標 Badge 顯示邏輯

`kasegiOverlay` 傳入時：
- `gap = kasegiOverlay.averageSkill − playerSkill`（playerSkill 由 Dashboard 傳入 `song` data 計算得出）
- 若 `gap > 0`：顯示 `[未達標]  ―{gap.toFixed(1)}`  + `目標 {averageSkill.toFixed(1)}`
- 若 `gap <= 0`（已達標）：只顯示 `目標 {averageSkill.toFixed(1)}`，不顯示 badge

`kasegiOverlay` 為 null：
- 整個「未達標/目標」群組不顯示

## playerSkill 計算（SongCard 內部）

SongCard 需要從 `song` data 計算 playerSkill 來判斷是否未達標：
```typescript
const playerSkill = Math.max(
  Number(song["街機版 Skill 點數"]) || 0,
  Number(song["家用版 Skill 點數"]) || 0
);
```

注意：此處用 max（兩者取最大），不依賴 sortKey。badge 只表示「你的最高分落後目標」。

## Difficulty Badge 樣式

垂直疊放在封面正下方，寬度同封面（40px）：
- 上行：譜面等級標籤（BSC/ADV/EXT/MAS），保持現有顏色（MAS=紫、EXT=紅、ADV=黃、BSC=綠）
- 下行：難度數值（9.2）

## 分隔線

```tsx
<div style={{
  height: "2px",
  background: "linear-gradient(to right, rgba(255,27,141,0.6) 0%, transparent 80%)"
}} />
```

## Dashboard.tsx 變更

移除以下計算（不再需要 kasegiBar）：
- `kasegiBarData` 計算邏輯（`calculateKasegiPotential` + fallback）
- `bestRate` 計算（用於 kasegiBar）
- `kasegiBar={kasegiBarData}` prop 傳遞

保留：
- `overlayAvg` 計算與 `kasegiOverlay` prop 傳遞
- `getPlayerSkill(item)` 仍用於 underperforming filter 邏輯

## React.memo 更新

移除 `kasegiBar` 的相等判斷：
```typescript
// 移除:
prev.kasegiBar === next.kasegiBar &&
```
