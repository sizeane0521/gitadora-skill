## Context

Dashboard.tsx 目前只有成績視圖（GF/DM/對照 tabs）。Songs.tsx 是獨立頁面有自己的 infinite scroll 和搜尋邏輯。BottomNav 的 active 指示器因缺少 `position: relative` 而無法定位，active 狀態只有文字顏色變化，缺乏視覺衝擊。Russo One 字型因為 Dashboard/BottomNav 不使用 h1-h6 而完全未套用。

## Goals / Non-Goals

**Goals:**

- 修復 BottomNav active 定位 bug
- 重設計 BottomNav active 狀態為 filled pill，套用 font-display
- Dashboard 頁頂加入「目前成績 / 全部歌曲」切換 toggle
- GF/DM/對照 TabsTrigger 套用 font-display

**Non-Goals:**

- 不改 Songs.tsx 本身
- 不改 /songs 路由
- 不加 toggle 動畫（留後續）

## Decisions

### Toggle 狀態用 local state（不存 URL 也不存 localStorage）

切換「目前成績 / 全部歌曲」的狀態用 `useState<"scores" | "songs">` 存在 Dashboard 元件內。

不選 URL param 的理由：GF/DM/對照 已使用 `/dashboard/:tab` 路由，再加一層 query param 會讓 URL 複雜化且無對應的需求（使用者不需要分享「全部歌曲」頁的 URL）。

不選 localStorage 的理由：使用者每次進入成績頁應預設看到成績，不需要記憶上次的視圖。

### 全部歌曲內容直接 import Songs 的核心邏輯，不重複

不選「在 Dashboard 內重寫一份 Songs 邏輯」，而是把 Songs.tsx 的核心清單部分（useSongs hook + 列表渲染）提取為可複用元件，或直接 inline 使用 useSongs + 相同 UI pattern，保持 DRY。

實際做法：在「全部歌曲」視圖下，直接 lazy render `<SongsBrowseView />` — 把 Songs.tsx 的列表部分拆成可在 Dashboard 內使用的子元件，搜尋列保留。

### BottomNav filled pill active 設計

active 的 NavLink 內部改為「icon + label 橫排 → 包在一個有品牌色背景的 pill 容器內」，無需 absolute 定位的底線，移除原有 `absolute bottom-0` 元素。

```
inactive:
  [icon]
  [label]

active:
  [▓▓▓▓ icon  label ▓▓▓▓]   ← brand bg pill, rounded-full
```

pill 樣式：`px-3 py-1 rounded-full bg-[color-brand]/15 text-[color-brand]`，加 subtle glow `box-shadow: 0 0 8px var(--color-brand)/30`。

## Risks / Trade-offs

- **Songs 邏輯重用**：若直接把 Songs.tsx 的 JSX 搬進 Dashboard，兩份代碼可能漸漸分叉。Mitigation：建立 `SongsBrowseView` 子元件，讓 Songs.tsx 也 import 它。
- **Toggle 不存 URL**：深連結「全部歌曲視圖」不可行，但目前無此需求。
