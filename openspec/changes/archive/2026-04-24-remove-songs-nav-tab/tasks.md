## 1. Bottom Navigation Items

- [x] 1.1 從 `src/components/layout/BottomNav.tsx` 的 `NAV_ITEMS` 陣列移除 `{ to: "/songs", icon: Music, label: "歌曲" }` 這一項，使 Bottom Nav 只剩 4 個項目（成績、賺分曲、好友、匯入），滿足 Bottom Navigation Items 規格
- [x] 1.2 確認移除後 `Music` icon 若無其他引用可一併從 import 中移除

## 2. Sidebar Navigation Items

- [x] 2.1 從 `src/components/layout/Sidebar.tsx` 的 `NAV_ITEMS` 陣列移除 `{ to: "/songs", icon: Music, label: "歌曲列表" }` 這一項，滿足 Sidebar Navigation Items 規格
- [x] 2.2 確認移除後 `Music` icon 若無其他引用可一併從 import 中移除

## 3. 驗證

- [x] 3.1 確認 `/songs` 及 `/songs/:id` 路由仍可透過直接輸入 URL 正常存取（Songs route remains accessible）
- [x] 3.2 在手機尺寸（375px）確認 Bottom Nav 顯示 4 個項目，無「歌曲」入口
- [x] 3.3 在桌面尺寸（1024px 以上）確認 Sidebar 無「歌曲列表」入口
