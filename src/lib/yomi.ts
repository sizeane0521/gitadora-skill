// ── Constants ──────────────────────────────────────────────────────────

const OPEN_BRACKETS = new Set(["(", "[", "「", "【", "《", "（", "〔", "〈"]);

const SMALL_KANA: Record<number, number> = {
  0x30a1: 0x30a2, // ァ→ア
  0x30a3: 0x30a4, // ィ→イ
  0x30a5: 0x30a6, // ゥ→ウ
  0x30a7: 0x30a8, // ェ→エ
  0x30a9: 0x30aa, // ォ→オ
  0x30c3: 0x30c4, // ッ→ツ
  0x30e3: 0x30e4, // ャ→ヤ
  0x30e5: 0x30e6, // ュ→ユ
  0x30e7: 0x30e8, // ョ→ヨ
  0x30ee: 0x30ef, // ヮ→ワ
};

const KATAKANA_ROW: Record<string, string> = {
  ア: "あ行", イ: "あ行", ウ: "あ行", エ: "あ行", オ: "あ行",
  カ: "か行", キ: "か行", ク: "か行", ケ: "か行", コ: "か行",
  ガ: "か行", ギ: "か行", グ: "か行", ゲ: "か行", ゴ: "か行",
  サ: "さ行", シ: "さ行", ス: "さ行", セ: "さ行", ソ: "さ行",
  ザ: "さ行", ジ: "さ行", ズ: "さ行", ゼ: "さ行", ゾ: "さ行",
  タ: "た行", チ: "た行", ツ: "た行", テ: "た行", ト: "た行",
  ダ: "た行", ヂ: "た行", ヅ: "た行", デ: "た行", ド: "た行",
  ナ: "な行", ニ: "な行", ヌ: "な行", ネ: "な行", ノ: "な行",
  ハ: "は行", ヒ: "は行", フ: "は行", ヘ: "は行", ホ: "は行",
  バ: "は行", ビ: "は行", ブ: "は行", ベ: "は行", ボ: "は行",
  パ: "は行", ピ: "は行", プ: "は行", ペ: "は行", ポ: "は行",
  マ: "ま行", ミ: "ま行", ム: "ま行", メ: "ま行", モ: "ま行",
  ヤ: "や行", ユ: "や行", ヨ: "や行",
  ラ: "ら行", リ: "ら行", ル: "ら行", レ: "ら行", ロ: "ら行",
  ワ: "わ行", ヲ: "わ行", ン: "わ行", ヴ: "わ行",
};

// ── Internal helpers ───────────────────────────────────────────────────

function getEffectiveFirstChar(name: string): string {
  for (const ch of name.trim()) {
    if (!OPEN_BRACKETS.has(ch)) return ch;
  }
  return "";
}

function normalizeChar(ch: string): string {
  const cp = ch.codePointAt(0) ?? 0;
  // hiragana → katakana
  if (cp >= 0x3041 && cp <= 0x3096) return String.fromCodePoint(cp + 0x60);
  // small katakana → full-size
  if (SMALL_KANA[cp]) return String.fromCodePoint(SMALL_KANA[cp]);
  return ch;
}

function charToRow(ch: string): string | null {
  const normalized = normalizeChar(ch);
  if (KATAKANA_ROW[normalized]) return KATAKANA_ROW[normalized];
  const cp = normalized.codePointAt(0) ?? 0;
  if (cp >= 0x0041 && cp <= 0x005a) return normalized; // A-Z uppercase
  if (cp >= 0x0061 && cp <= 0x007a) return normalized.toUpperCase(); // a-z → uppercase
  if ((cp >= 0x0021 && cp <= 0x007e) || (cp >= 0xff01 && cp <= 0xff5e)) return "#"; // digits/symbols
  return null;
}

// ── Kuroshiro singleton ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _kuroshiro: any | null = null;
let _initPromise: Promise<void> | null = null;
const kanjiCache = new Map<string, string>();

async function getKuroshiro() {
  if (_kuroshiro) return _kuroshiro;
  if (!_initPromise) {
    _initPromise = (async () => {
      const [{ default: Kuroshiro }, { default: KuromojiAnalyzer }] = await Promise.all([
        import("kuroshiro"),
        import("kuroshiro-analyzer-kuromoji"),
      ]);
      const k = new Kuroshiro();
      await k.init(new KuromojiAnalyzer({ dictPath: `${import.meta.env.BASE_URL}dict/` }));
      _kuroshiro = k;
    })();
  }
  await _initPromise;
  return _kuroshiro;
}

// ── Public API ─────────────────────────────────────────────────────────

/** Sync: returns row label for kana/ASCII, null for kanji. */
export function getYomiRowSync(name: string): string | null {
  if (!name?.trim()) return "A-Z";
  const raw = getEffectiveFirstChar(name);
  if (!raw) return "A-Z";
  return charToRow(raw);
}

/** Async: handles kanji via kuroshiro. Always returns a row label. */
export async function getYomiRowAsync(name: string): Promise<string> {
  const sync = getYomiRowSync(name);
  if (sync !== null) return sync;

  if (kanjiCache.has(name)) return kanjiCache.get(name)!;

  try {
    const k = await getKuroshiro();
    const hiragana: string = await k.convert(name, { to: "hiragana", mode: "normal" });
    const firstChar = getEffectiveFirstChar(hiragana);
    const row = firstChar ? (charToRow(firstChar) ?? "A-Z") : "A-Z";
    kanjiCache.set(name, row);
    return row;
  } catch {
    return "A-Z";
  }
}

/** Trigger kuroshiro init in the background without blocking. */
export function warmupKuroshiro(): void {
  getKuroshiro().catch(() => {});
}
