## Summary

將「成績」Tab 的 SongCard 元件重新設計，採用與賺分曲（PianFen）一致的精簡列樣式，並在卡片中以進度條排列呈現街機版與家用版成績對比。

## Motivation

現有 SongCard 採用較寬的兩欄 layout（左側封面+難度 badge 一欄，右側成績兩欄），視覺風格與賺分曲的精簡列不一致，資訊呈現也較分散。使用者希望：

1. 成績頁面的歌曲卡片外觀與賺分曲列表風格統一（小封面 + 歌名 + metadata + 右側成績）
2. 街機版（街）與家用版（家）的 Skill 分數對比能一目了然，採用進度條 + 數字 + FC/EXC badge 的緊湊橫列格式

## Proposed Solution

重構 `SongCard.tsx`，採用以下新佈局：

```
┌─────────────────────────────────────────────┐
│ [cover] [yomi] 歌曲名稱              [♡][✎] │
│         MAS Guitar 9.2                       │
│                                              │
│ 街 ████████████░░░  148.5  [FC]              │
│ 家 ██████████████░  149.2  [FC]              │
└─────────────────────────────────────────────┘
```

- 封面小圖（40px，難度色邊框）放左側
- yomi 五十音 badge + 歌名同行，收藏/編輯按鈕靠右
- 第二行：diff badge + 樂器 + 難度值
- 下方兩行：街 / 家 各一橫列（進度條依達成率 + skill 分 + FC/EXC/未遊玩 badge）
- 保留 wishlist 目標標籤、HOT/Other 標記、備註 modal

## Non-Goals

- 不修改 Dashboard.tsx 的篩選/排序邏輯
- 不調整 SongCardSkeleton 的動畫行為（只更新骨架結構）
- 不刪除任何現有功能（收藏、編輯、備註、wishlist 皆保留）

## Impact

- Affected specs: `score-list`
- Affected code:
  - Modified: `src/components/SongCard.tsx`
  - Modified: `src/components/SongCardSkeleton.tsx`
