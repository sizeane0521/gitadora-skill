export type GameMode = "GF" | "DM";

export interface WishlistItem {
  songName: string;
  instrument: string;
  difficulty: string;
  level: number;
  avgSkill: number;
  targetTier: string;
  yomiCategory?: string;
  hotCategory?: string;
  category?: string;
}

export interface SongData {
  歌曲封面: string;
  歌曲名稱: string;
  樂器類型: string;
  譜面等級: string;
  難度數值: number;
  收錄版本: string;
  "歌名發音/分類": string;
  "家用版最佳達成率 (%)": number;
  "家用版 Skill 點數": number;
  "街機版最佳達成率 (%)": number | string;
  "街機版 Skill 點數": number | string;
  標籤: string;
  備註: string;
  新舊分類: string;
  isFavorite?: string | boolean;
  // Internal fields populated by adapter (optional, not in original Lovable data)
  _scoreId?: number;
  _userId?: string;
  _songId?: number;
  _difficulty?: string;
  _source?: "arcade" | "konaste";
  _isExcellent?: boolean;
  _isFullCombo?: boolean;
  _bestGrade?: string;
  _playCount?: number;
  _importedAt?: string;
}

export const MOCK_DATA_GF: SongData[] = [
  {
    歌曲封面: "https://placehold.co/100x100/333/FFF?text=Cover",
    歌曲名稱: "Agnus Dei",
    樂器類型: "Guitar",
    譜面等級: "EXT",
    難度數值: 7.50,
    收錄版本: "FUZZ-UP",
    "歌名發音/分類": "あ",
    "家用版最佳達成率 (%)": 98.5,
    "家用版 Skill 點數": 135.2,
    "街機版最佳達成率 (%)": 95.0,
    "街機版 Skill 點數": 128.5,
    標籤: "體力曲, 網路推薦",
    備註: "推薦練習曲目，注意副歌切換",
    新舊分類: "HOT",
  },
  {
    歌曲封面: "https://placehold.co/100x100/333/FFF?text=Cover",
    歌曲名稱: "MODEL DD ULTIMATES",
    樂器類型: "Guitar",
    譜面等級: "MAS",
    難度數值: 9.70,
    收錄版本: "HIGH-VOLTAGE",
    "歌名發音/分類": "M",
    "家用版最佳達成率 (%)": 92.5,
    "家用版 Skill 點數": 178.5,
    "街機版最佳達成率 (%)": 88.3,
    "街機版 Skill 點數": 170.2,
    標籤: "高難度",
    備註: "",
    新舊分類: "Other",
  },
  {
    歌曲封面: "https://placehold.co/100x100/333/FFF?text=Cover",
    歌曲名稱: "繚乱ヒットチャート",
    樂器類型: "Bass",
    譜面等級: "ADV",
    難度數值: 7.50,
    收錄版本: "FUZZ-UP",
    "歌名發音/分類": "り",
    "家用版最佳達成率 (%)": 97.2,
    "家用版 Skill 點數": 145.8,
    "街機版最佳達成率 (%)": 0,
    "街機版 Skill 點數": 0,
    標籤: "練習曲",
    備註: "Bass 譜面很有趣",
    新舊分類: "HOT",
  },
];

export const MOCK_DATA_DM: SongData[] = [
  {
    歌曲封面: "https://placehold.co/100x100/333/FFF?text=Cover",
    歌曲名稱: "FIRE",
    樂器類型: "Drums",
    譜面等級: "EXT",
    難度數值: 9.20,
    收錄版本: "HIGH-VOLTAGE",
    "歌名發音/分類": "F",
    "家用版最佳達成率 (%)": 89.1,
    "家用版 Skill 點數": 163.9,
    "街機版最佳達成率 (%)": 85.6,
    "街機版 Skill 點數": 157.6,
    標籤: "體力曲",
    備註: "注意大鼓連踩段落",
    新舊分類: "HOT",
  },
  {
    歌曲封面: "https://placehold.co/100x100/333/FFF?text=Cover",
    歌曲名稱: "Three Worms",
    樂器類型: "Drums",
    譜面等級: "MAS",
    難度數值: 9.80,
    收錄版本: "FUZZ-UP",
    "歌名發音/分類": "T",
    "家用版最佳達成率 (%)": 78.4,
    "家用版 Skill 點數": 153.7,
    "街機版最佳達成率 (%)": 0,
    "街機版 Skill 點數": 0,
    標籤: "高難度, 連打",
    備註: "",
    新舊分類: "Other",
  },
  {
    歌曲封面: "https://placehold.co/100x100/333/FFF?text=Cover",
    歌曲名稱: "A Geisha's Dream",
    樂器類型: "Drums",
    譜面等級: "BSC",
    難度數值: 4.80,
    收錄版本: "HIGH-VOLTAGE",
    "歌名發音/分類": "A",
    "家用版最佳達成率 (%)": 99.1,
    "家用版 Skill 點數": 95.6,
    "街機版最佳達成率 (%)": 95.3,
    "街機版 Skill 點數": 91.7,
    標籤: "入門推薦",
    備註: "新手必練",
    新舊分類: "Other",
  },
];
