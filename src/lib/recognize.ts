const API_URL = "https://script.google.com/macros/s/AKfycbwzK_d6AO1dtrtLmFHxL1OBP0xSf6ySvOHEag6Qagoh2r5LJmb0PUxhWERf15da5AUE/exec";

export const aiPrompt = "你是一個精準的街機音樂遊戲 (Gitadora) 成績辨識系統。請從這張圖片中萃取出以下數值，並嚴格以 JSON 格式回傳，不要加上任何其他文字：\n\n- songName: 歌曲名稱 (字串，請只抓取畫面中最大的主標題，絕對忽略下方的副標題或 BEMANI Sound Team 等歌手/作者名稱)\n\n- instrument: 樂器 (字串，請全部轉換為大寫，僅輸出 'GUITAR' 或 'BASS')\n\n- difficulty: 難度等級 (字串，請將圖片上的難度轉換為標準縮寫：BASIC轉換為BSC、ADVANCED轉換為ADV、EXTREME轉換為EXT、MASTER轉換為MAS，格式為'縮寫 數字'，例如 'MAS 7.10')\n\n- arcadeScore: 達成率數字，去除百分比符號 (浮點數，如 99.01)\n\n- arcadeSkill: 畫面上大字的 Skill 數值 (浮點數，如 140.59)\n\n- yomiCategory: 請分析圖片中『歌名』的日文發音（讀音），並將其歸類到 Gitadora 的官方排序分類中。分類選項僅限於以下其中之一：『あ, か, さ, た, な, は, ま, や, ら, わ, A-Z, 數字/符號』。漢字請轉換為平假名發音後再分類，英文開頭歸入 A-Z。";

export interface RecognitionResult {
  songName: string;
  instrument: string;
  difficulty: string;
  arcadeScore: number;
  arcadeSkill: number;
  homeScore?: number;
  homeSkill?: number;
  yomiCategory: string;
  tag?: string;
}

function compressImage(file: File, maxSize = 1024, quality = 0.75): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      // Scale down if exceeds maxSize
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round(height * (maxSize / width));
          width = maxSize;
        } else {
          width = Math.round(width * (maxSize / height));
          height = maxSize;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      const base64 = dataUrl.replace(/^data:[^;]+;base64,/, "");
      resolve({ base64, mimeType: "image/jpeg" });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function recognizeImage(file: File): Promise<RecognitionResult> {
  const { base64, mimeType } = await compressImage(file);

  const payload = {
    action: "recognizeImage",
    imageBase64: base64,
    mimeType,
    prompt: aiPrompt,
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });

  if (!res.ok) throw new Error("API error");

  const data = await res.json();
  console.log("【API 回傳原始資料】:", data);

  // 1. 攔截後端錯誤
  if (data && data.status === "error") {
    throw new Error(data.message || "後端回傳錯誤");
  }

  // 2. 如果回傳的是字串（AI 可能用 markdown 包裹），清洗後解析
  let parsed: Record<string, unknown> = data;
  if (typeof data === "string") {
    const cleaned = data.replace(/```json\n?|```/g, "").trim();
    try {
      parsed = JSON.parse(cleaned);
      console.log("【清洗後解析結果】:", parsed);
    } catch {
      throw new Error("無法解析 AI 回傳的 JSON：" + cleaned.slice(0, 200));
    }
  }

  // 3. 驗證必要欄位
  const arcadeScore = Number(parsed.arcadeScore);
  const arcadeSkill = Number(parsed.arcadeSkill);
  const homeScore = Number(parsed.homeScore);
  const homeSkill = Number(parsed.homeSkill);

  const result: RecognitionResult = {
    songName: String(parsed.songName || ""),
    instrument: String(parsed.instrument || ""),
    difficulty: String(parsed.difficulty || ""),
    arcadeScore: Number.isFinite(arcadeScore) ? arcadeScore : 0,
    arcadeSkill: Number.isFinite(arcadeSkill) ? arcadeSkill : 0,
    homeScore: Number.isFinite(homeScore) ? homeScore : undefined,
    homeSkill: Number.isFinite(homeSkill) ? homeSkill : undefined,
    yomiCategory: String(parsed.yomiCategory || ""),
    tag: parsed.tag ? String(parsed.tag) : undefined,
  };

  if (!result.songName) {
    throw new Error("辨識結果缺少歌曲名稱");
  }

  return result;
}
