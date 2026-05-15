## Context

目前 Gitadora Skill Tracker 的賺分曲（Kasegi）功能僅計算用戶**自己**的技能缺口（個人化）。社群資料源 gsv.fun 由 ssdh233 維護，透過 GraphQL API 提供玩家上傳的技能記錄，並衍生出「哪些曲目最多人拿來刷分」的統計資料（`kasegiNew` query）。

現有技術棧：React + Vite + TanStack Query + Supabase + Tailwind CSS + shadcn/ui。

外部 API 端點：`https://gsv.fun/graphql`（POST，Content-Type: application/json）。

## Goals / Non-Goals

**Goals:**

- 新增 `usePianFen` hook，以 TanStack Query 包裝對 gsv.fun 的 GraphQL 請求
- 新增 `PianFen.tsx` 頁面，展示 hot/other 兩分類的社群刷分曲清單（GF/DM 切換）
- 將「騙分」加入底部導覽列（擴充為 5 項）與 Sidebar
- 清單項目顯示：排名、曲名、難度標籤（EXT/MAS 等）、定數、社群平均 Skill 值

**Non-Goals:**

- 不做個人化（無需登入）
- 不快取到 Supabase，直接從 gsv.fun 撈取
- 不做篩選 / 搜尋功能（第一版純列表）
- 不修改 gsv.fun 服務端

## Decisions

### GraphQL 查詢使用 fetch + TanStack Query，不引入 Apollo Client

gsv.fun 使用 Apollo，但我們的專案尚未引入任何 GraphQL client。引入 Apollo Client 會帶來額外 bundle 大小（~25KB gzip）且只為一個查詢使用過度。改用原生 `fetch` POST JSON，配合 TanStack Query 的 `useQuery`：

```ts
fetch('https://gsv.fun/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: KASEGI_NEW_QUERY, variables: { type, version: 'gitadora-fuzz-up' } })
})
```

替代方案考慮：引入 `graphql-request`（輕量）→ 排除，純 fetch 已足夠。

### 騙分資料型別

從 `kasegiNew` query 回傳的 `KasegiRecord`：

```ts
interface PianFenRecord {
  name: string;       // 曲名
  diff: string;       // 難度名稱（BSC/ADV/EXT/MAS）
  part: string;       // 樂器（guitar/bass/drum）
  diffValue: number;  // 定數
  averageSkill: number; // 社群平均 Skill
  count: number;      // 使用此曲刷分的玩家數
}

interface PianFenData {
  hot: PianFenRecord[];   // HOT 版本收錄的曲目
  other: PianFenRecord[]; // LONG AGO 版本收錄的曲目
}
```

### BottomNav 由 4 項擴充為 5 項

底部導覽列 spec 目前規定「exactly 4 items」，本次變更修改為 5 項，加入「騙分」（路由 `/pian-fen`）。圖示使用 `Zap` (lucide-react)。

替代方案：在 Kasegi 頁面內部做 tab 切換 → 排除，因 騙分 是獨立功能，從 nav 直接進入體驗更佳。

### 版本參數固定為 fuzz-up

gsv.fun API 支援多個 version，但我們先固定為 `gitadora-fuzz-up`（目前最新版），不在 UI 中暴露版本選擇。

## Risks / Trade-offs

- **gsv.fun CORS 限制** → 若 gsv.fun 不允許跨域，需透過我們自己的 Supabase Edge Function 做代理。可先直接請求測試，若 CORS 報錯再加 proxy。
- **API 可用性** → gsv.fun 是社群服務，若下線則頁面顯示 error state；用 TanStack Query 的 retry 邏輯處理。
- **底部導覽 5 項在窄螢幕的空間壓縮** → 圖示縮小為 `w-4 h-4`，active pill 僅顯示圖示+短標籤（4 字以內）。

## Open Questions

- gsv.fun 是否有公開 rate limit 說明？目前未知，先以 staleTime: 5 分鐘避免頻繁請求。
- `part` 欄位過濾：GF 模式應只顯示 guitar/bass，DM 只顯示 drum，需在 hook 層過濾（API 的 `type` 參數可能不夠精確）。
