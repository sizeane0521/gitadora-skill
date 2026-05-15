## 1. src/index.css — GF Brand Color Scale

- [x] 1.1 GF Brand Color Scale 亮版：將 `--gf-50` 至 `--gf-500` 改為以 `#FF1B8D` 為基底的粉色系：50=#FFE8F4, 100=#FFD1E8, 200=#FFAFD7, 300=#FF82C0, 400=#FF54AA, 500=#FF1B8D
- [x] 1.2 GF Brand Color Scale 暗版：將 `--gf-600` 至 `--gf-900` 改為暗版：600=#CC1671, 700=#991055, 800=#660B38, 900=#33051C
- [x] 1.3 GF Brand Color Scale 最深值：新增 `--gf-950: #1A030E`

## 2. src/index.css — DM Brand Color Scale

- [x] 2.1 DM Brand Color Scale 亮版：將 `--dm-50` 至 `--dm-500` 改為以 `#00F0FF` 為基底的青色系：50=#E6FEFF, 100=#CCFCFF, 200=#A6FAFF, 300=#73F7FF, 400=#40F4FF, 500=#00F0FF
- [x] 2.2 DM Brand Color Scale 暗版：將 `--dm-600` 至 `--dm-900` 改為暗版：600=#00C0CC, 700=#009099, 800=#006066, 900=#003033
- [x] 2.3 DM Brand Color Scale 最深值：新增 `--dm-950: #00181A`

## 3. src/index.css — Dark mode brand override 更新

- [x] 3.1 更新 `[data-theme="dark"]` 下 GF brand fallback 值：`--color-brand` fallback 改為 `#FF54AA`（gf-400），`--color-brand-hover` 改為 `#FF82C0`（gf-300），`--color-brand-subtle` 改為 `#33051C`（gf-900）
- [x] 3.2 確認 `--neon-pink: #FF1B8D` 與 `--neon-cyan: #00F0FF` 維持硬碼物理色，與 gf-500/dm-500 數值一致

## 4. src/pages/PianFen.tsx — PianFen Rank Accent Line Uses 700 Variant

- [x] 4.1 PianFen Rank Accent Line Uses 700 Variant：將 `RecordRow` 的 `accentColor` 由 500 改為 700 暗版（奇數名次 `#991055`，偶數名次 `#009099`）

## 5. 驗證

- [x] 5.1 執行 `npx tsc --noEmit`，確認無 TypeScript 錯誤
- [x] 5.2 深色模式下開啟賺分曲頁面，確認 accent 線顏色明顯比霓虹色飽和度低（視覺降噪效果）
- [x] 5.3 確認 GF tab（粉色）與 DM tab（青色）的 active 顏色正確對應新色階的 400 值
