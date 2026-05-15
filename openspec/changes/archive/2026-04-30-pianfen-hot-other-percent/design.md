## Context

`usePianFen.ts` 透過 gsv.fun GraphQL 取得 `hot` 與 `other` 兩個陣列，以及頂層 `count`（該段位玩家總數）。目前 `PianFen.tsx` 將兩個陣列合併後進行單一分頁（25 筆/頁），導致 HOT 曲目多時（GF scope 7000 約 225 首），OTHER 要翻到第 10 頁才出現，等同不可見。API 已有每首歌的 `count` 欄位，但既未計算百分比也未顯示。

## Goals / Non-Goals

**Goals:**

- HOT / OTHER 各自獨立分頁，兩個區塊同時呈現在頁面上
- 從 API 頂層 `count` 計算每首歌的 `percent`（玩家使用比例）並顯示
- 新增排序切換（技能分 / 玩家%），兩區塊同步套用

**Non-Goals:**

- 不加 HOT / OTHER tab 切換（兩區塊保持同時可見，符合 gsv.fun 的對照體驗）
- 不修改 API 查詢（graphQL query 不變）
- 不調整 scope 選擇器或 GF/DM tab 的現有邏輯

## Decisions

### 將 HOT / OTHER 分開維護各自的 page state

**方案比較：**

| 方案 | 描述 | 問題 |
|------|------|------|
| A（採用）| `hotPage` / `otherPage` 各自獨立 state，各自顯示 ◄► | 實作最單純，符合 gsv.fun 雙表格設計 |
| B | Tab 切換 HOT / OTHER | 使用者無法同時看到兩個區塊做比較 |
| C | 虛擬滾動合併列表 | 複雜度高，無額外好處 |

`PianFen.tsx` 中新增 `hotPage` 與 `otherPage` 兩個 `useState<number>`，`scope` 或 `instrument` 變更時兩者同步 reset 為 1。現有的 `page` state 移除。

### 在 usePianFen 計算 percent 並儲存於 PianFenRecord

API 頂層的 `kasegiNew.count` = 該段位總玩家數。`record.count` = 靠這首賺分的玩家數。

```
percent = Math.round((record.count / totalCount) * 10000) / 100
```

`PianFenRecord` 新增 `percent: number` 欄位（計算後直接存入，UI 直接使用）。`PianFenData` 新增 `totalCount: number` 以便 debug，但主要邏輯在 hook 層完成。

### 排序切換以 sortBy state 控制，hook 層負責排序

`usePianFen` 接受 `sortBy: "skill" | "percent"` 參數（預設 `"skill"`）。hook 依 `sortBy` 選擇比較函式並重新排序 hot / other 陣列。`PianFen.tsx` 維護 `sortBy` state 並傳給 hook，當 `sortBy` 改變時不 reset page（讓使用者在同一頁看到重排結果）。

切換按鈕放在 scope 選擇器列的右側，使用兩個 pill 按鈕（技能分 / 玩家%），樣式對齊現有 scope 按鈕。

## Risks / Trade-offs

- `totalCount` 為 0 時 `percent` 會是 `NaN` → 在計算時加 guard（`totalCount > 0` 才計算，否則 `percent = 0`）
- HOT 與 OTHER 分頁各自獨立，分頁狀態稍微複雜，但 scope/instrument 變更時統一 reset 即可
