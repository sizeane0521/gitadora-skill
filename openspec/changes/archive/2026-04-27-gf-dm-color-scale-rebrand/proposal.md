## Summary

將 GF 與 DM 的品牌色系從舊橘色（`#FF6B35`）/ 藍色（`#00A8E8`）替換為霓虹粉（`#FF1B8D`）/ 霓虹青（`#00F0FF`），並為兩套主色建立完整的 50-950 色階，同時統一 `--neon-*` 物理色 token 與品牌色階的數值一致性。

## Motivation

原本 GF 品牌色是橘色系（`--gf-500: #FF6B35`），DM 是藍色系（`--dm-500: #00A8E8`），與深色模式下實際使用的霓虹粉（`--neon-pink: #FF1B8D`）和霓虹青（`--neon-cyan: #00F0FF`）不一致——等於有兩套平行的「主色」存在，造成設計系統的語義模糊。此外，舊色階沒有 950 最深值，且缺乏有系統的中間色階，無法支援 hover、overlay、accent line 等需要層次變化的使用場景。

## Proposed Solution

1. **GF 色階**：以 `#FF1B8D`（霓虹粉）為 500，向亮計算 50→400，向暗計算 600→950，共 11 個色票
2. **DM 色階**：以 `#00F0FF`（霓虹青）為 500，同樣規則計算 11 個色票
3. **Neon token 對齊**：`--neon-pink: #FF1B8D` 與 `--gf-500` 數值相同；`--neon-cyan: #00F0FF` 與 `--dm-500` 數值相同，兩者互為物理色參考點
4. **Dark mode brand override**：更新 fallback 值為新色階數值
5. **PianFen accent 線**：改用 700 暗版（`--gf-700: #991055` / `--dm-700: #009099`），滿足視覺降噪需求

## Non-Goals

- 不改動亮色模式的 diff badge 顏色（`--diff-bsc/adv/ext/mas`）
- 不更動 `--neon-lime`、`--neon-purple`、`--neon-amber` 等其他霓虹 token
- 不更動任何頁面的佈局或元件結構

## Impact

- Affected specs: `arcade-neon-design-system`（修改品牌色 token 規範）
- Affected code:
  - Modified: `src/index.css`
  - Modified: `src/pages/PianFen.tsx`
