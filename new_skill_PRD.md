# SIZ_GITADORA — 產品需求文件 (PRD)

> Gitadora GF/DM 雙環境玩家的 Skill 分析與好友共享工具

---

## 📋 文件資訊

| 項目 | 內容 |
|------|------|
| 產品名稱 | SIZ_GITADORA（暫定，可調整） |
| 產品類型 | RWD 網頁應用（Web App） |
| 目標平台 | 桌機瀏覽器 為主 / 手機瀏覽器 為輔 |
| 文件版本 | v1.0 |
| 建立日期 | 2026-04-22 |

---

## 🎯 一、產品願景

### 1.1 核心定位

**「給 Gitadora GF/DM 玩家的雙環境 Skill 分析工具」**

讓同時在家用機（Konaste）和街機遊玩的玩家，能夠整合兩邊的成績資料，清楚知道：
- 哪一邊的成績比較好
- 哪些歌可以再拼一下加分
- 朋友在這首歌的成績如何，作為練習參考

### 1.2 與現有產品的差異

| 面向 | gsv.fun | SIZ_GITADORA（本產品） |
|------|---------|----------------------|
| 定位 | 社群成績分享網站 | 個人化分析工具 |
| 家用 vs 街機 | ❌ 不分開 | ✅ 完整對照 |
| 好友系統 | ❌ 無 | ✅ 加朋友才能看成績 |
| UI/UX | 陽春傳統 | 日系可愛、現代化 RWD |
| 使用者規模 | 大量玩家 | 小圈圈好友 |
| 賺分曲 | 所有人排行 | 個人化計算 |

### 1.3 目標使用者

- **第一階段**：產品擁有者自用
- **第二階段**：邀請 GF/DM 好友圈使用
- **第三階段**：開放更多玩家註冊（未來）

---

## 🏗️ 二、技術架構

### 2.1 前端

| 項目 | 技術 |
|------|------|
| 框架 | React + TypeScript |
| 建構工具 | Vite |
| 樣式 | Tailwind CSS |
| UI 元件 | shadcn/ui |
| 路由 | React Router |
| 狀態管理 | React Query + Zustand（如有需要） |
| 圖表 | Recharts |
| 設計風格 | 日系可愛，參考 Gitadora 官方配色 |

### 2.2 後端

| 項目 | 技術 |
|------|------|
| BaaS | Supabase |
| 資料庫 | PostgreSQL（Supabase 內建） |
| 認證 | Supabase Auth（Google OAuth） |
| 檔案儲存 | Supabase Storage |
| 即時同步 | Supabase Realtime（如有需要） |
| 權限控管 | Row Level Security (RLS) |

### 2.3 部署

| 項目 | 技術 |
|------|------|
| 前端部署 | Vercel（免費方案） |
| 程式碼託管 | GitHub |
| CI/CD | Vercel 自動部署（push 到 main 自動更新） |

### 2.4 成績匯入

| 項目 | 技術 |
|------|------|
| 方式 | JavaScript Bookmarklet |
| 來源 | Konami 官網（p.eagate.573.jp / Konaste） |
| 原理 | 玩家登入官網後點擊書籤，抓取頁面資料上傳到 Supabase |
| 參考 | [gsv.fun 開源專案](https://github.com/matsumatsu233/gitadora-skill-viewer) |

---

## 🧩 三、核心功能

### 3.1 功能優先級

| 優先級 | 功能 | 階段 |
|--------|------|------|
| P0 | Google 登入註冊 | MVP |
| P0 | 成績匯入（Bookmarklet） | MVP |
| P0 | 個人成績列表 | MVP |
| P0 | 家用 vs 街機 對照 | MVP |
| P0 | 個人賺分曲計算 | MVP |
| P1 | 好友系統 | V1.1 |
| P1 | 朋友成績查看 | V1.1 |
| P2 | 成績歷史趨勢圖 | V1.2 |
| P2 | Skill 達成度分析 | V1.2 |
| P3 | 成就徽章系統 | V2 |

---

## 📐 四、功能詳細規格

### 4.1 使用者認證

#### 4.1.1 註冊 / 登入
- 僅支援 **Google OAuth** 登入（降低門檻）
- 首次登入自動建立使用者資料
- 不需要驗證 Email（Google 已驗證）

#### 4.1.2 使用者資料欄位
```
users
├── id (uuid, Supabase Auth 提供)
├── email (string, 從 Google 取得)
├── display_name (string, 預設使用 Google 名稱, 可修改)
├── avatar_url (string, 從 Google 取得, 可更換)
├── konami_id (string, 選填, 玩家的 Konami ID)
├── main_game (enum: 'GF' | 'DM' | 'BOTH', 主玩遊戲)
├── created_at (timestamp)
└── updated_at (timestamp)
```

---

### 4.2 成績匯入（Bookmarklet）

#### 4.2.1 匯入流程
```
1. 使用者登入 SIZ_GITADORA
2. 到「匯入成績」頁面
3. 拖拉書籤到瀏覽器書籤列
4. 前往 Konami 官網並登入
5. 點擊書籤
6. Bookmarklet 自動抓取成績並上傳
7. 跳轉回 SIZ_GITADORA 顯示成績
```

#### 4.2.2 需要區分兩個來源
- **街機版**：GALAXY WAVE DELTA（p.eagate.573.jp）
- **家用版**：Konaste

兩個 Bookmarklet 分別處理，資料都標記來源欄位。

#### 4.2.3 抓取欄位
```
每一筆成績：
├── 歌曲 ID
├── 歌曲名稱
├── 遊戲類型 (GF / DM)
├── 難度 (BSC / ADV / EXT / MAS)
├── 達成率 (%)
├── Skill 分數
├── 遊玩次數
├── 最佳評級 (S / A / B / C)
├── 滿連狀態 (EXC / FC)
└── 來源 (街機 / 家用)
```

---

### 4.3 資料庫結構設計

#### 4.3.1 歌曲資料表 (songs)
```sql
songs
├── id (bigint, PK)
├── konami_song_id (string, unique)
├── title (string)
├── artist (string)
├── cover_url (string, Supabase Storage 連結)
├── game_type (enum: 'GF' | 'DM')
├── level_bsc (decimal, 基礎難度定數)
├── level_adv (decimal, 進階難度定數)
├── level_ext (decimal, 極限難度定數)
├── level_mas (decimal, 大師難度定數)
├── version (string, 歌曲初登場版本)
├── created_at (timestamp)
└── updated_at (timestamp)
```

#### 4.3.2 成績資料表 (scores)
```sql
scores
├── id (bigint, PK)
├── user_id (uuid, FK → users.id)
├── song_id (bigint, FK → songs.id)
├── game_type (enum: 'GF' | 'DM')
├── difficulty (enum: 'BSC' | 'ADV' | 'EXT' | 'MAS')
├── achievement_rate (decimal, 達成率%)
├── skill_point (decimal, 計算得到的 Skill)
├── play_count (int)
├── best_grade (string, 最佳評級)
├── is_excellent (boolean, 滿連 EXC)
├── is_full_combo (boolean, 全連 FC)
├── source (enum: 'arcade' | 'konaste', 資料來源)
├── imported_at (timestamp)
└── updated_at (timestamp)
```

#### 4.3.3 好友關係表 (friendships)
```sql
friendships
├── id (bigint, PK)
├── requester_id (uuid, FK → users.id, 發送請求的人)
├── addressee_id (uuid, FK → users.id, 接收請求的人)
├── status (enum: 'pending' | 'accepted' | 'rejected' | 'blocked')
├── created_at (timestamp)
└── updated_at (timestamp)

注意：雙向關係，兩人中任一人都能發起
```

---

### 4.4 頁面架構

#### 4.4.1 網站結構
```
/                          首頁（未登入 → 介紹頁；已登入 → Dashboard）
/login                     登入頁
/dashboard                 主控台
├── /dashboard/gf          GF 成績總覽
├── /dashboard/dm          DM 成績總覽
└── /dashboard/compare     雙環境對照（家用 vs 街機）

/songs                     歌曲列表
└── /songs/:id             單曲詳細頁（顯示該曲所有成績）

/kasegi                    賺分曲推薦
├── /kasegi/gf             GF 賺分曲
└── /kasegi/dm             DM 賺分曲

/friends                   好友管理
├── /friends/list          好友列表
├── /friends/requests      好友邀請
└── /friends/:userId       好友成績頁

/profile                   個人資料
└── /profile/settings      設定頁

/import                    成績匯入教學
├── /import/arcade         街機版匯入
└── /import/konaste        家用版匯入
```

---

### 4.5 關鍵功能 A：家用 vs 街機對照

#### 4.5.1 使用情境
> 「我最近都在家打 Konaste，想知道同樣這首歌，我在街機的成績是多少，家用機打得比較好還是街機？」

#### 4.5.2 畫面設計概念
```
┌─────────────────────────────────────────────┐
│  歌曲封面  │  歌曲名稱 / 歌手                  │
├───────────┼─────────────────────────────────┤
│           │                                 │
│  🏠 家用  │  達成率 92.5%   Skill 115.2     │
│           │  最佳評級 S     EXC ✓           │
│           │                                 │
├───────────┼─────────────────────────────────┤
│           │                                 │
│  🕹️ 街機  │  達成率 89.8%   Skill 112.1     │
│           │  最佳評級 A     FC ✓            │
│           │                                 │
├───────────┴─────────────────────────────────┤
│  📊 差異：家用 +2.7% / +3.1 Skill             │
└─────────────────────────────────────────────┘
```

#### 4.5.3 篩選功能
- 只顯示兩邊都有的歌曲
- 只顯示家用有但街機沒有的歌
- 只顯示街機有但家用沒有的歌
- 依差異大小排序

---

### 4.6 關鍵功能 B：個人賺分曲

#### 4.6.1 計算邏輯
```
Gitadora Skill 公式：
Skill = 歌曲定數 × (達成率 / 100) × 2

每首歌「最高可得 Skill」＝ 歌曲定數 × 2
「賺分潛力」＝ 最高 Skill − 當前 Skill

排序：賺分潛力由大到小
```

#### 4.6.2 篩選條件
- 只顯示特定難度區間（如 7.50 ~ 7.99）
- 只顯示某個評級以下（還沒 EXC 的）
- 只顯示 GF 或 DM 或兩者
- 家用還是街機

#### 4.6.3 畫面範例
```
📊 你的賺分曲排行（GF, 7.50-7.99）

1. 歌曲A     當前 114.2 → 目標 117.0   +2.8 ⭐
2. 歌曲B     當前 112.8 → 目標 115.2   +2.4
3. 歌曲C     當前 111.5 → 目標 113.8   +2.3
...
```

---

### 4.7 關鍵功能 C：好友系統

#### 4.7.1 好友邀請流程
```
1. 發起人搜尋對方的 Email 或使用者名稱
2. 發送好友邀請（friendships.status = 'pending'）
3. 接收人收到通知
4. 接收人可以：
   - 接受 (status → 'accepted')
   - 拒絕 (status → 'rejected')
   - 封鎖 (status → 'blocked')
5. 接受後雙方互相顯示為好友
```

#### 4.7.2 好友成績權限
- 預設：好友可以看到彼此的所有成績
- 進階：可以設定「不公開某些難度 / 某些歌曲」（V1.2 再加）

#### 4.7.3 Row Level Security (RLS) 規則
```sql
-- 成績資料表 RLS
-- 使用者可以讀取自己的所有成績
CREATE POLICY "Users can read own scores" ON scores
  FOR SELECT USING (auth.uid() = user_id);

-- 使用者可以讀取好友的成績
CREATE POLICY "Users can read friends' scores" ON scores
  FOR SELECT USING (
    user_id IN (
      SELECT CASE
        WHEN requester_id = auth.uid() THEN addressee_id
        WHEN addressee_id = auth.uid() THEN requester_id
      END
      FROM friendships
      WHERE status = 'accepted'
        AND (requester_id = auth.uid() OR addressee_id = auth.uid())
    )
  );

-- 使用者只能寫入自己的成績
CREATE POLICY "Users can insert own scores" ON scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 🎨 五、設計規範

### 5.1 整體風格

**「日系可愛 × 遊戲感」** — 參考 Gitadora 官方配色與風格

### 5.2 色彩（建議，可調整）

```css
/* 主色調 */
--primary-gf: #FF6B35      /* GF 代表色：橘紅（吉他） */
--primary-dm: #00A8E8      /* DM 代表色：藍色（鼓） */

/* 輔助色 */
--accent-skill: #FFD700    /* 金色（Skill 數字） */
--accent-excellent: #FF4081 /* 粉紅（EXC 狀態） */

/* 中性色 */
--bg-primary: #FFFFFF / #1A1A2E  /* 亮色 / 深色模式 */
--bg-card: #F5F5F7 / #252538
--text-primary: #1A1A2E / #FFFFFF
--text-secondary: #6B6B7A / #A0A0B0
```

### 5.3 字體

- 中文：Noto Sans TC
- 英文：Inter / Plus Jakarta Sans
- 數字：JetBrains Mono / Space Grotesk（Skill 分數用等寬更好看）

### 5.4 關鍵 UI 元件

- **Skill 卡片**：大數字 + 漸變背景 + 微動畫
- **歌曲列表項**：封面縮圖 + 難度標籤 + 達成率橫條
- **圖表**：使用 Recharts，色彩柔和
- **深色模式**：必備

### 5.5 RWD 斷點

```
Mobile:   < 640px   (sm)
Tablet:   640-1024px (md-lg)
Desktop:  > 1024px  (xl)
```

手機版特別優化：
- 單欄顯示
- 大按鈕（容易點擊）
- 底部導航列（不是側邊欄）

---

## 🔐 六、安全與權限

### 6.1 資料保護
- 使用者資料透過 Supabase RLS 保護
- 未登入使用者無法查看任何成績
- 非好友關係無法互相查看成績

### 6.2 Bookmarklet 安全性
- 書籤只在玩家自己的瀏覽器執行
- 上傳資料前要先確認玩家已登入 SIZ_GITADORA
- 抓取的資料只會上傳到 Supabase，不會傳到其他地方

### 6.3 API Keys 管理
- Supabase anon key：前端可以用
- Supabase service key：**絕不能放在前端**
- 環境變數：統一用 `.env.local`，不進 git

---

## 🚀 七、開發路線圖

### Phase 1：MVP（目標 2-3 週）
- [x] 專案初始化（Vite + React + Tailwind + shadcn）
- [ ] Supabase 專案建立 + 資料表設計
- [ ] Google OAuth 登入
- [ ] 成績資料模型建立
- [ ] Bookmarklet 開發（參考 gsv.fun 開源碼）
- [ ] 個人成績列表頁
- [ ] 家用 vs 街機對照頁
- [ ] 個人賺分曲計算頁
- [ ] 基礎 RWD 版型

### Phase 2：好友功能（目標 1-2 週）
- [ ] 好友邀請系統
- [ ] 好友列表管理
- [ ] 好友成績查看頁
- [ ] RLS 政策設定
- [ ] 好友比較視圖

### Phase 3：體驗優化（目標 1 週）
- [ ] 成績歷史趨勢圖
- [ ] 深色模式
- [ ] 個人資料編輯
- [ ] 匯入教學頁優化
- [ ] 效能優化

### Phase 4：未來可選
- [ ] 成就徽章系統
- [ ] Skill 達成度分析
- [ ] 資料匯出（CSV）
- [ ] 多語系（日文）

---

## 📦 八、初始化檢查清單

給 Claude Code 開始前，需要先準備的東西：

### 8.1 需要手動建立的帳號
- [ ] Supabase 帳號（https://supabase.com）
- [ ] Vercel 帳號（https://vercel.com）
- [ ] Google Cloud Console OAuth 設定

### 8.2 Supabase 設定步驟
1. 建立新專案
2. 開啟 Google OAuth Provider
3. 建立 Storage Bucket：`song-covers`
4. 建立上述資料表
5. 設定 RLS 政策

### 8.3 環境變數（.env.local）
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 8.4 參考資源
- gsv.fun GitHub: https://github.com/matsumatsu233/gitadora-skill-viewer
- Supabase 官方文件: https://supabase.com/docs
- shadcn/ui 文件: https://ui.shadcn.com
- Gitadora 官網: https://p.eagate.573.jp/game/gitadora/

---

## 💬 九、給 Claude Code 的開發建議

### 9.1 開發順序建議
1. **先跑通基礎架構**：React + Supabase + 登入
2. **再做資料模型**：用 Supabase MCP 直接建立資料表
3. **接著做資料輸入**：手動新增假資料先測試畫面
4. **再做 Bookmarklet**：抓真實資料
5. **最後做好友功能**：確保 RLS 設定正確

### 9.2 開發時要注意的事
- 每個頁面都要 RWD 測試（手機 + 桌機）
- Supabase RLS 每次改動要測試
- Bookmarklet 在不同瀏覽器測試（Chrome / Safari）
- 資料量大時要做分頁處理

### 9.3 可以詢問擁有者的事
- UI 細節決策（色票、字體大小）
- 功能優先級調整
- 特殊需求（如某個頁面特定功能）

### 9.4 MCP 使用建議
利用 Supabase MCP Server，Claude Code 可以：
- 直接建立資料表
- 設定 RLS 政策
- 查詢測試資料
- 管理 Storage Bucket

設定指令：
```bash
claude mcp add --transport http supabase https://mcp.supabase.com/mcp
```

---

## 📝 十、產品擁有者資訊

| 項目 | 內容 |
|------|------|
| 擁有者身份 | UI/UX 設計師 |
| 玩家身份 | Gitadora GF/DM 玩家 |
| 有家用機嗎 | 是（Konaste） |
| 有街機經驗嗎 | 是 |
| 前一版本 | https://song-survey.lovable.app/ |
| 前一版 GitHub | https://github.com/sizeane0521/song-survey |

---

**文件結束**

這份 PRD 涵蓋了目前討論到的所有功能和細節，Claude Code 可以依此逐步實作。建議從 Phase 1 開始，每完成一個里程碑後再進入下一階段。
