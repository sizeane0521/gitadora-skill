## 1. CSS Token 層 — src/index.css

- [x] 1.1 在 Google Fonts import URL 加入 `JetBrains+Mono:wght@400;700`，並在 `:root` 新增 `--font-mono: 'JetBrains Mono', monospace`
- [x] 1.2 在 `:root` 新增五個霓虹物理色彩 token：`--neon-cyan: #00F0FF`、`--neon-pink: #FF1B8D`、`--neon-lime: #C6FF1A`、`--neon-purple: #B026FF`、`--neon-amber: #FFB100`
- [x] 1.3 在 `:root` 新增 `--skill-neon: #C6FF1A`（用於深色模式 skill 數字）與 `--bg-void: #05030E`
- [x] 1.4 更新 `[data-theme="dark"]` 區塊的背景 token：`--color-bg-primary` 改為 `#05030E`、`--color-bg-secondary` 改為 `#0A051A`、`--color-bg-elevated` 改為 `rgba(255,255,255,0.03)`、`--color-border-default` 改為 `#1a1a2e`
- [x] 1.5 在 `[data-theme="dark"]` 區塊更新 diff token 對應霓虹色：`--diff-bsc` 改為 `185 100% 50%`（對應 #00F0FF cyan）、`--diff-adv` 改為 `42 100% 50%`（amber）、`--diff-ext` 改為 `326 100% 55%`（pink）、`--diff-mas` 改為 `284 100% 57%`（purple）
- [x] 1.6 在 `@layer utilities` 新增三個 glow utility class：`.glow-neon`（box-shadow: 0 0 6px var(--neon-cyan)，限 `[data-theme="dark"]` 下生效）、`.glow-neon-md`（0 0 10px + 0 0 24px color-mix 效果，限深色）、`.skill-neon-glow`（text-shadow lime glow，限深色）；亮色模式下這三個 class 的 shadow 值為 `none`
- [x] 1.7 在 `[data-theme="dark"] body` 加入環境光暈 background（radial-gradient purple/pink + linear-gradient void）
- [x] 1.8 新增 `[data-theme="dark"] body::before`（CRT 掃描線：`position: fixed; inset: 0; z-index: 0; pointer-events: none; background-image: linear-gradient(180deg, transparent 0px, transparent 2px, rgba(0,240,255,0.022) 2px, rgba(0,240,255,0.022) 3px); background-size: 100% 3px`）
- [x] 1.9 新增 `[data-theme="dark"] body::after`（Vignette：`position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%); mix-blend-mode: multiply`）

## 2. 底部導覽 — src/components/layout/BottomNav.tsx

- [x] 2.1 讀取 `src/components/layout/BottomNav.tsx` 的 active/inactive 渲染邏輯，將深色模式下 active 狀態的 icon 容器改為菱形：移除現有 pill 樣式，改為 `w-6 h-6 rotate-45` 正方形 + `background: var(--neon-lime)`，label 文字改為 `color: var(--neon-lime)`；非深色模式下維持現有樣式（判斷方式：讀取 `useTheme()` 或 `document.documentElement.dataset.theme === 'dark'`，或在 CSS 用 `[data-theme="dark"]` selector 控制）
- [x] 2.2 inactive icon：在深色模式下改為 `w-5 h-5` 圓形 outline（`border: 1.5px solid #444`），label `color: #555`

## 3. 賺分曲列表 — src/pages/PianFen.tsx

- [x] 3.1 在 `RecordRow` 的外層 `<div>` 加入 `border-left: 2px solid var(--neon-cyan)`（限深色模式：用 inline style + `useTheme` 判斷，或改為 className 配合 CSS `[data-theme="dark"]` 選擇器）
- [x] 3.2 Rank 數字：改為 `String(rank).padStart(2, '0')` 補零，加入 `font-style: italic`，color 改為 `var(--neon-cyan)`（深色模式），font 改為 `var(--font-mono)`
- [x] 3.3 Skill 數字（averageSkill）：加入 `font-style: italic`，深色模式下 color 改為 `var(--neon-lime)`，加入 `skill-neon-glow` class，font 改為 `var(--font-mono)`
- [x] 3.4 Row 底色（深色模式）：在外層 `<div>` 加入 `background: rgba(255,255,255,0.025)`
- [x] 3.5 Lv 數字：font 改為 `var(--font-mono)`

## 4. 驗證（第一階段）

- [x] 4.1 執行 `npx tsc --noEmit`，確認無 TypeScript 錯誤
- [x] 4.2 在深色模式下開啟 `localhost:8080/pian-fen/gf`，確認：背景為深空色、CRT 掃描線可見、Rank 為 cyan italic 補零、Skill 為 lime italic glow
- [x] 4.3 切換至亮色模式，確認：glow 效果消失、diff 顏色維持原值、頁面可讀
- [x] 4.4 確認底部導覽在深色模式下 active 項目顯示 lime 菱形，inactive 顯示圓形 outline

## 5. CSS Token 補完 — src/index.css（漏項）

- [x] 5.1 在 `:root` 新增輔助背景 token：`--bg-deep: #0A051A`、`--bg-card: rgba(255,255,255,0.025)`、`--bg-grid: #1a1a2e`、`--bg-mute: #222`；新增文字 dim token：`--text-dim: #555`
- [x] 5.2 在 `:root` 新增間距 token：`--space-1: 2px`（行內 icon 與文字）、`--space-2: 4px`（標籤之間）、`--space-3: 6px`（row 內欄位之間）、`--space-4: 8px`（row 之間、邊距）、`--space-5: 12px`（section 之間）、`--space-6: 16px`（容器水平內距）、`--space-7: 22px`（status bar 水平內距）
- [x] 5.3 在 `:root` 新增 CSS 變數形式的 glow：`--glow-sm: 0 0 6px var(--neon-cyan)`、`--glow-md: 0 0 10px var(--neon-cyan), 0 0 24px color-mix(in srgb, var(--neon-cyan) 50%, transparent)`；這些作為 token 供元件 inline style 使用

## 6. Diff Badge 修正 — src/pages/PianFen.tsx

- [x] 6.1 將 `DIFF_COLORS` 常數改為規範的霓虹實底黑字樣式（深色模式限定）：深色模式下 BSC=`background: var(--neon-cyan); color: #000`、ADV=`background: var(--neon-amber); color: #000`、EXT=`background: var(--neon-pink); color: #000`、MAS=`background: var(--neon-purple); color: #fff`；亮色模式維持現有 Tailwind 透明底色。做法：在 `RecordRow` 內依 `isDark` 分別套用 inline style 或 Tailwind class

## 7. GF/DM Tab 樣式更新 — src/pages/PianFen.tsx

- [x] 7.1 在 `PianFen` 主元件的 GF/DM tab 中，深色模式下 active tab 的底線與文字顏色改為：GF active = `var(--neon-pink)`（品紅），DM active = `var(--neon-cyan)`（青色）；letter-spacing 加入 `0.1em`；inactive tab 文字改為 `var(--text-dim)`（#555）

## 8. BottomNav 細節修正 — src/components/layout/BottomNav.tsx

- [x] 8.1 將 `<nav>` 的 `height` 從 60 改為 52（px），對應規範「高 52px」
- [x] 8.2 深色模式下，active 與 inactive 的 label 字型改為 `fontFamily: var(--font-display), letterSpacing: '0.1em'`，字級改為 `9px`，全大寫（`textTransform: 'uppercase'`）

## 9. 驗證（第二階段）

- [x] 9.1 執行 `npx tsc --noEmit`，確認無 TypeScript 錯誤
- [x] 9.2 深色模式下確認：diff badge 顯示霓虹實底（MAS 為紫底白字，EXT 為粉底黑字）
- [x] 9.3 深色模式下確認：GF tab active 顯示 pink 底線與文字，DM tab active 顯示 cyan 底線與文字
- [x] 9.4 確認底部導覽高度縮短至 52px，label 為 9px 全大寫

## 10. 視覺細節修正（第二輪）— src/pages/PianFen.tsx & BottomNav.tsx

- [x] 10.1 `PianFen.tsx` — GF/DM sticky tab wrapper 的 `background`：深色模式由 `var(--color-bg-elevated)`（= `rgba(255,255,255,0.03)`，幾乎透明）改為實色 `#0A051A`，確保捲動時下方曲目列表不透出 sticky tab 區域
- [x] 10.2 `PianFen.tsx` — `RecordRow` 左側 accent 線顏色規則：移除 `PART_ACCENT` 常數，改為 `rank % 2 === 1 ? "#FF1B8D" : "#00F0FF"`（奇數名次粉色、偶數名次青色），HOT 與 OTHER 段落均套用此規則
- [x] 10.3 `PianFen.tsx` — 第二段 `SectionHeader` 標題由 `"LONG AGO"` 改為 `"OTHER"`；確認 HOT 與 OTHER 列表均使用 `rank={i + 1}` 獨立起算，不連續編號
- [x] 10.4 `BottomNav.tsx` — Bottom Navigation Active State Indicator 重設計：移除底部 4px 圓點，改為 (a) 頂部霓虹光條（`position: absolute; top: 0; left: 15%; right: 15%; height: 2px; border-radius: 0 0 3px 3px; background: var(--neon-lime); box-shadow: lime triple glow`）；(b) 背景暈光 overlay（`position: absolute; inset: 0; background: color-mix(in srgb, var(--neon-lime) 6%, transparent)`）；(c) label 加入 `text-shadow: 0 0 8px var(--neon-lime)`；亮色模式使用 `var(--color-brand)` 對應值但不加 glow

## 11. 驗證（第三階段）

- [x] 11.1 深色模式捲動賺分曲列表，確認 GF/DM sticky tab 背景不透明，曲目卡片不透出
- [x] 11.2 確認 HOT 段落排名：奇數名次（01、03、05…）左側線為粉色 `#FF1B8D`，偶數（02、04、06…）為青色 `#00F0FF`
- [x] 11.3 確認 OTHER 段落標題顯示「OTHER」，排名從 01 獨立起算，顏色規則同 HOT
- [x] 11.4 確認底部導覽 active 項目頂部顯示 lime 光條（有 glow 暈光），不再有底部小點
