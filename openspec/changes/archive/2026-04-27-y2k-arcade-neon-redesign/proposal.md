## Summary

將 SIZ_GITADORA 的視覺設計系統重構為「Y2K Arcade Neon」風格——80s 街機霓虹 × CRT 掃描線 × 深空背景，在保留亮色模式與圓角元件的前提下，全面導入霓虹色彩 token、發光效果與更高密度的資訊排版。

## Motivation

現有設計系統色彩保守（灰階 + 橘品牌色），缺乏街機音 game 的視覺強度，玩家打開後無法立即感受到「這是音 game 工具」的氛圍。Style A 規範（style-a-spec.md）提供了完整的 Y2K 街機霓虹設計語言，需要整合進現有的 CSS Token 體系。

決策：
- CJK 字體：保留 Noto Sans TC（而非規範的 Noto Sans JP），因 app 主語系為繁中
- 亮色模式：保留，霓虹 glow 效果在亮色版關閉，改用彩色描邊
- 圓角元件：保留（--radius-sm/md/lg/xl 不動）；街機專屬元件（底部 nav 菱形指示器）依規範用幾何形
- Diff 顏色：對齊新規範（BSC=cyan, ADV=amber, EXT=pink, MAS=purple）

## Proposed Solution

1. **CSS Token 層（src/index.css）**：
   - 新增 `--neon-*` 色彩 token（cyan/pink/lime/purple/amber）
   - 深色模式背景從 `#0F0F23` 更新至 `#05030E`（void black）
   - 更新 `--diff-*` 對應新霓虹色
   - 新增 `--glow-sm/md` CSS 變數（box-shadow）
   - 新增 `--skill-neon` 取代 `--skill-gold`（深色模式下 skill 數字改為 lime）
   - 加入 JetBrains Mono 字體（Google Fonts）
   - 全局 CRT 掃描線、環境光暈、Vignette 暗角效果（深色模式限定）
   - 新增 `.glow-neon`, `.glow-neon-text` utility class

2. **底部導覽（src/components/layout/BottomNav.tsx）**：
   - Active 指示器從 pill 改為旋轉 45° 的菱形（lime 色）
   - Active 文字改為 lime

3. **賺分曲列表（src/pages/PianFen.tsx）**：
   - RecordRow 左側加入 2px neon-cyan 垂直線
   - Rank 數字：cyan，italic，補零（01/02）
   - Skill 數字：lime-green italic + glow，dark 模式限定
   - Row 底色：`rgba(255,255,255,0.025)`（dark 模式）

## Non-Goals

- 不重構頁面 HTML 結構（Kasegi / Dashboard / Friends / Import 等頁面的佈局不動）
- 不實作分頁 Pagination bar（HOT 1-25 / 26-50 等），留作後續 change
- 不移除亮色模式支援

## What Changes（第二輪修正）

- **GF/DM sticky tab 背景**：深色模式改為實色 `#0A051A`，避免 `--color-bg-elevated`（`rgba(255,255,255,0.03)`）讓捲動中的曲目卡片透出
- **左側 accent 線規則**：由 part-based（Guitar=cyan / Bass=pink）改為按排名奇偶交替（奇數名次 = `#FF1B8D` 粉色；偶數名次 = `#00F0FF` 青色）
- **「LONG AGO」→「OTHER」**：段落標題正名為「OTHER」，與 gsv.fun 資料源命名一致；HOT 與 OTHER 各自獨立排名（均從 01 開始）
- **BottomNav active 指示器重設計**：移除底部 4px 圓點，改為：頂部霓虹光條（70% 寬，2px 高，lime glow）+ 整體淡背景暈光（6% neon-lime overlay）+ label text-shadow glow

## Impact

- Affected specs: arcade-neon-design-system（新建）、bottom-navigation（修改）
- Affected code:
  - Modified: `src/index.css`
  - Modified: `src/components/layout/BottomNav.tsx`
  - Modified: `src/pages/PianFen.tsx`
