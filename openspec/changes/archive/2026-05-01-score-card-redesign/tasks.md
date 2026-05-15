## 1. 重構 SongCard 主體佈局

- [x] 1.1 在 `src/components/SongCard.tsx` 將最外層 layout 從兩欄改為單欄精簡列：封面尺寸與 diff border 改為 40×40px（沿用 `DIFF_BORDER_COLORS`）+ 中間 info 區塊（flex-1） + 右側收藏/編輯按鈕（Personal Score List Display）
- [x] 1.2 第一行：yomi badge（`song["歌名發音/分類"]`，pill 樣式 20×16px）+ 歌曲名稱（truncate）+ 右側 ♡ / ✎ 按鈕
- [x] 1.3 第二行：diff badge + 樂器類型 badge + 難度數值；wishlist 目標標籤位置移至第二行右側（pill 樣式，`text-[10px]`）

## 2. 實作街/家成績對比橫列

- [x] 2.1 在 `src/components/SongCard.tsx` 新增 `ScoreRow` 子元件，接受 `label`（"街"/"家"）、`rate`（達成率%）、`skill`（技能分）、`isExcellent`、`isFullCombo` props（Personal Score List Display — Score card shows progress bar）
- [x] 2.2 `ScoreRow` 佈局：左側 label（"街"/"家"，12px mono，固定 18px 寬）→ 進度條填充比例與顏色：fill width = `rate%`，街=neon-pink，家=neon-cyan，`color-mix(in srgb, <neon> 70%, transparent)` → skill 數字 → 狀態 badge 規則：EXC/FC 依 `isExcellent`/`isFullCombo`
- [x] 2.3 進度條高度 6px，圓角 full，背景 `var(--color-bg-secondary)`；`rate=0 && skill=0` 時隱藏進度條改顯示"—"（Personal Score List Display — Unplayed source shows dash）
- [x] 2.4 移除舊的 `ScoreColumn` 元件（兩欄文字版），以兩個 `ScoreRow`（街在上、家在下）取代，顯示 `arcadeRate/arcadeSkill` 和 `homeRate/homeSkill`

## 3. 保留現有功能整合

- [x] 3.1 HOT/Other 標記：保留右側 `H`/`O` chip（絕對定位），調整 top/right 確保不遮蓋新 layout
- [x] 3.2 備註 modal：保留 `showNote` state 與 AnimatePresence modal，備註 icon 移至歌名行右側（收藏/編輯旁）
- [x] 3.3 EXC/FC badge 規則不變：`_isExcellent` → EXC、`_isFullCombo && !_isExcellent` → FC（EXC and FC Badge Display）

## 4. 更新 SongCardSkeleton

- [x] 4.1 在 `src/components/SongCardSkeleton.tsx` 對齊新 layout：左側 40px 方塊 skeleton + 右側三行 skeleton（標題行、metadata 行、兩個進度條行），高度與新 SongCard 一致以防止佈局跳動
