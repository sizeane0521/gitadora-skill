## Context

`SongCard` 是成績列表的核心卡片元件，位於 `src/components/SongCard.tsx`。
卡片內容分三個邏輯區塊：Line 1（歌名列）、Line 2（難度/樂器/數值列）、Score Rows（街/家分數）。

Line 2 目前結構：
```
flex justify-between
├── <span> diff badge (MAS / EXT / ADV / BSC)
├── <span> 樂器 (Guitar / Bass / Drums)
├── <span> 難度數值 (7.10)
├── [conditional] wishlist badge
└── [conditional] kasegiOverlay 目標數字
```

問題：`justify-between` 讓所有 item 均分水平空間。條件元素的有無直接影響固定元素的水平位置，導致跨卡片排版不一致（標籤「跑掉」）。

## Goals / Non-Goals

**Goals:**
- 樂器名稱固定左對齊
- diff badge + 難度數值視覺群組化（不可分割）
- 無論條件元素是否存在，樂器和 diff+level group 的相對位置一致
- 顯示順序改為：`[樂器] ... [diff badge + 難度數值]`

**Non-Goals:**
- 不修改 Line 1（歌名列）
- 不修改 ScoreRow、kasegi bar
- 不改變任何顏色、字型、尺寸 token

## Decisions

### 兩端佈局取代 justify-between

用 `flex justify-between` 的兩個子容器取代多個 sibling flex item：

```
flex (justify-between)
├── 左容器 (flex items-center gap-1)
│   ├── 樂器名稱
│   └── [optional] wishlist badge / kasegiOverlay 目標
└── 右容器 (flex items-center gap-1, flex-shrink-0)
    ├── diff badge
    └── 難度數值
```

Alternatives considered:
- **保留 justify-between，把 diff+level 包 group**：左右對稱差，中間空白不可預測。
- **改用 CSS Grid**：overkill，只是兩端對齊不需要 grid。
- **fixed width 給每個 item**：難以適應不同數值寬度（BSC vs MAS、1.00 vs 10.00）。

### 條件元素置於左容器

`wishlistItem` badge 和 `kasegiOverlay` 目標數字放進左容器（樂器右側），這樣右側的 diff+level group 永遠固定在最右端，不受條件元素影響。

## Implementation Contract

**Observable behavior:**

每張 SongCard 的 Line 2 從左到右顯示為：

```
[樂器]  ([wishlist/目標])      [diff badge][難度數值]
```

- 樂器名稱：左對齊，無論卡片是否有 wishlist 或 kasegiOverlay，位置不變
- diff badge + 難度數值：始終右對齊，兩者相鄰（gap-1），視覺上成一組
- wishlist badge 和 kasegiOverlay 在樂器右側、diff group 左側（`flex-1 min-w-0` 吸收剩餘空間）

**Interface:**

`SongCard` props 不變。只修改 `SongCardInner` 的 JSX 結構（Line 2 div 內部）。

**Acceptance criteria:**

1. 在有 `kasegiOverlay`（目標）的卡片和沒有的卡片中，diff badge 和難度數值出現在相同的水平位置（右端對齊）
2. diff badge 和難度數值相鄰，中間只有 `gap-1` 間距，不被其他元素插入
3. 樂器名稱（Guitar/Bass/Drums）出現在 Line 2 最左側
4. 現有的顏色、字體大小、`flexShrink: 0` 等視覺屬性保持不變

**Scope boundaries:**

In scope: `SongCardInner` JSX 中 Line 2 的 div 內部結構重排。
Out of scope: Line 1、ScoreRow、kasegi bar、props interface、任何視覺 token。

## Risks / Trade-offs

- [Risk] 移動條件元素到左容器後，若左側內容過長（長樂器名 + 長 wishlist badge），右側 diff+level group 可能被擠壓 → Mitigation: 右容器加 `flex-shrink-0`，左容器加 `flex-1 min-w-0 overflow-hidden`，確保右側永不被擠。
