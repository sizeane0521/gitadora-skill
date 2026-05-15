## Context

現有設計系統以 `src/index.css` 為單一真相來源，透過 CSS 自訂屬性（`--color-*`、`--diff-*`、`--radius-*` 等）驅動全局樣式。深色模式由 `[data-theme="dark"]` 選擇器覆蓋，樂器模式由 `[data-instrument="gf/dm"]` 覆蓋。此次重構在現有 token 架構之上**疊加**新的 neon token 層，不替換語意 token（`--color-brand` 等繼續保留）。

## Goals / Non-Goals

**Goals:**
- 在深色模式下呈現 Y2K 街機霓虹視覺：深空底色、霓虹強調色、CRT 特效
- 在亮色模式下維持可用性：保留原色彩邏輯，關閉 glow 特效

**Non-Goals:**
- 不重構現有語意 token（`--color-brand`、`--color-bg-*` 等命名保持不變）
- 不引入新 JS 套件
- 不更動 Tailwind config

## Decisions

### Token 策略：疊加而非替換

在 `:root` 新增 `--neon-*` 物理色彩 token，與現有 `--gf-*`、`--neutral-*` 並列。語意 token（`--color-brand` 等）在深色模式下繼續指向既有的 GF/DM scale，`--diff-*` 改為指向 neon token。

```
新增 token（物理層）：
--neon-cyan:   #00F0FF
--neon-pink:   #FF1B8D
--neon-lime:   #C6FF1A
--neon-purple: #B026FF
--neon-amber:  #FFB100

更新 token（語意層，dark mode）：
--diff-bsc → --neon-cyan  (187 100% 50% → 統一為 hex)
--diff-adv → --neon-amber
--diff-ext → --neon-pink
--diff-mas → --neon-purple
--skill-neon: #C6FF1A  （新增，深色模式 skill 數字專用）
--bg-void: #05030E     （新增，深色底色）
```

### CRT 效果：CSS-only，不加 JS

掃描線、環境光暈、Vignette 全部用純 CSS background / radial-gradient 實作，套在 `body::before` / `body::after` pseudo-element，`pointer-events: none`。深色模式限定（`[data-theme="dark"] body::before`）。不加 `will-change` 除非實測有 scroll jank。

### 亮色模式的 glow 策略

所有 `.glow-neon` / `glow-neon-text` class 在亮色模式下 `text-shadow: none; box-shadow: none`。若需維持視覺層次，改用 1px colored border 代替 glow。

### BottomNav 菱形指示器：純 CSS transform

Active 狀態用 `transform: rotate(45deg)` + `background: var(--neon-lime)` 在原本的圓形/pill 容器上做菱形，不引入新 SVG 圖示。

### PianFen Row 更新：inline style vs class

Rank 補零邏輯在 TSX 用 `String(rank).padStart(2, '0')` 處理。Left accent line 用 `border-left: 2px solid var(--neon-cyan)` 加在 row div 上（深色模式下生效，亮色模式繼承原 border）。Skill glow 用 CSS class `skill-neon-glow` 搭配 `[data-theme="dark"]` 選擇器控制顯示。

## Risks / Trade-offs

| 項目 | 風險 | 緩解 |
|---|---|---|
| CRT 掃描線 GPU 消耗 | 低端手機 scroll 可能卡頓 | 先上線觀察，若有問題加 `will-change: transform` |
| neon-cyan 與現有 GF brand 色接近 | 語意混淆 | neon token 只用在 arcade 特定元件（diff badge、rank、accent line） |
| 亮色模式視覺落差 | 使用者在亮色下感受不到街機感 | 可接受；亮色為輔助模式 |
