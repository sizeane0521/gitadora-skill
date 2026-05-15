## 1. 封面圖 — Zetaraku 資料 Hook

- [x] 1.1 建立 `src/hooks/useZetarakuSongs.ts`：以 TanStack Query 的 `useQuery` fetch `https://dp4p6x0xfi5o9.cloudfront.net/gitadora/data.json`，queryKey 為 `["zetaraku-songs"]`，staleTime 設為 `Infinity`；回傳 `Map<string, string>`（key=title, value=imageName）；fetch 失敗時回傳空 Map 不拋出錯誤
- [x] 1.2 在 hook 內定義 `ZetarakuSong` 型別：`{ songId: string; title: string; imageName: string | null }`，確保 JSON 解析正確

## 2. 五十音行 — yomi 工具函式

- [x] 2.1 建立 `src/lib/yomi.ts`，實作 `getYomiRowSync(name: string): string | null`：依序執行（a）skip leading brackets（括號字元集：`(`、`[`、`「`、`【`、`《`、`（`），（b）取第一個有效字，（c）平假名 U+3041–U+3096 加 0x60 轉片假名，（d）小假名正規化（ァィゥェォッャュョヮ → 大字），（e）查 `KATAKANA_ROW` 常數 Map 回傳行標籤，（f）ASCII U+0021–U+007E 或全形 ASCII U+FF01–U+FF5E 回傳 `"A-Z"`，（g）其餘（漢字）回傳 `null`
- [x] 2.2 在 `src/lib/yomi.ts` 內定義完整的 `KATAKANA_ROW` 常數 Map，涵蓋所有清音與濁音/半濁音：あ行（ア,イ,ウ,エ,オ）、か行（カ,キ,ク,ケ,コ,ガ,ギ,グ,ゲ,ゴ）、さ行（サ,シ,ス,セ,ソ,ザ,ジ,ズ,ゼ,ゾ）、た行（タ,チ,ツ,テ,ト,ダ,ヂ,ヅ,デ,ド）、な行（ナ,ニ,ヌ,ネ,ノ）、は行（ハ,ヒ,フ,ヘ,ホ,バ,ビ,ブ,ベ,ボ,パ,ピ,プ,ペ,ポ）、ま行（マ,ミ,ム,メ,モ）、や行（ヤ,ユ,ヨ）、ら行（ラ,リ,ル,レ,ロ）、わ行（ワ,ヲ,ン,ヴ）
- [x] 2.3 在 `src/lib/yomi.ts` 內實作 `getYomiRowAsync(name: string): Promise<string>`：先呼叫 `getYomiRowSync`，非 null 則直接回傳；null（漢字）則查 `kanjiCache: Map<string, string>`，有快取則回傳；否則呼叫 kuroshiro singleton 將歌名轉為平假名，取第一個有效字，再呼叫 `getYomiRowSync` 確定行；任何錯誤 silent fallback 回傳 `"A-Z"`；結果存入 `kanjiCache`
- [x] 2.4 在 `src/lib/yomi.ts` 內實作 kuroshiro singleton：模組層級 `let kuroshiro`、`let initPromise`；`getKuroshiro()` 函式以 `KuromojiAnalyzer` 初始化 kuroshiro，只初始化一次（initPromise singleton 模式）；匯出 `warmupKuroshiro(): void` 供外部提前觸發初始化

## 3. 頁面整合 — PianFen.tsx 更新

- [x] 3.1 在 `src/pages/PianFen.tsx` 加入 import：`import { getYomiRowSync, getYomiRowAsync, warmupKuroshiro } from "@/lib/yomi"`；`import { useZetarakuSongs } from "@/hooks/useZetarakuSongs"`；`import { useEffect, useState } from "react"`（確認已有 `useState`）
- [x] 3.2 在 `PianFen` 主元件中呼叫 `useZetarakuSongs()`，取得 `coverMap: Map<string, string>`；在 `useEffect`（依賴 `data`）中檢查歌單是否含漢字開頭歌名（`getYomiRowSync(r.name) === null`），若有則呼叫 `warmupKuroshiro()`
- [x] 3.3 將 `coverMap` 以 prop 傳入 `RecordRow`：更新 `RecordRow` 的 props 型別為 `{ record: PianFenRecord; rank: number; coverMap: Map<string, string> }`
- [x] 3.4 更新 `RecordRow`：（a）從 `coverMap` 查找 `record.name` 取得 `imageName`，（b）`imageName` 存在時渲染 `<img src={coverUrl} className="w-10 h-10 rounded object-cover shrink-0" />`，（c）不存在時渲染 `<div className="w-10 h-10 rounded shrink-0" style={{ background: 'var(--color-bg-secondary)' }} />`；封面佔位置在排名數字之後、文字資訊之前
- [x] 3.5 在 `RecordRow` 內實作五十音行 badge：以 `useState<string>` 儲存 `yomiRow`，初始值為 `getYomiRowSync(record.name) ?? ""`；在 `useEffect`（依賴 `record.name`）中，若 `getYomiRowSync` 回傳 `null` 則呼叫 `getYomiRowAsync(record.name).then(setYomiRow)`；badge 渲染：`yomiRow` 有值時在難易度/樂器/定數旁加上 `<span className="text-xs opacity-60 font-mono" style={{ color: 'var(--color-text-muted)' }}>{yomiRow}</span>`

## 5. 事後修正

- [x] 5.1 將 `src/lib/yomi.ts` 中的 `import Kuroshiro` 和 `import KuromojiAnalyzer` 靜態 import 改為 dynamic import（`import("kuroshiro")` / `import("kuroshiro-analyzer-kuromoji")`）：原靜態 import 導致 Vite 在 bundle PianFen chunk 時嘗試靜態解析 kuroshiro，造成頁面空白（chunk 載入失敗）；改為 dynamic import 後 kuroshiro 只在 `getKuroshiro()` 被呼叫時才動態載入，不影響初始 chunk
- [x] 5.2 更新 `src/lib/yomi.ts` 的 `charToRow` 函式：英文大寫（U+0041–U+005A）直接回傳該字母（如 `"G"`）；英文小寫（U+0061–U+007A）轉大寫後回傳（如 `"g"` → `"G"`）；數字/符號等其他 ASCII 字元回傳 `"#"`；使得 badge 從 `A-Z` 固定文字改為顯示實際首字母（GHOST → G，New Order → N，123 → #）

## 4. 驗證

- [x] 4.1 執行 `npx tsc --noEmit`，確認無 TypeScript 錯誤
- [x] 4.2 開啟 `localhost:8080/pian-fen/gf`，確認每首歌列表項目左側顯示封面縮圖或灰色佔位符
- [x] 4.3 確認英文/片假名歌曲（如 GHOST、ラビットホール）的五十音行 badge 立即顯示（A-Z、ら行）
- [x] 4.4 確認漢字歌曲（如 狂乱華夜 feat.shully、晴る）的 badge 在 1-2 秒內顯示正確的行
- [x] 4.5 切換段位選擇器，確認封面與 badge 在新資料載入後正確顯示
