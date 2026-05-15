import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, AlertCircle, RefreshCw } from "lucide-react";
import { GameMode, SongData } from "@/types/song";
import { RecognitionResult } from "@/lib/recognize";
import { updateScore, verifySave } from "@/lib/api";
import { toast } from "sonner";
import ToggleGroup from "@/components/ToggleGroup";
import TagSelect from "@/components/TagSelect";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SourceType = "arcade" | "console";

interface Props {
  result: RecognitionResult | null;
  mode: GameMode;
  songs: SongData[];
  availableTags: string[];
  lockedSource: SourceType;
  onClose: () => void;
  onSaved: () => void;
}

export default function RecognitionEditSheet({ result, mode, songs, availableTags, lockedSource, onClose, onSaved }: Props) {
  const [source, setSource] = useState<SourceType>(lockedSource);
  const [songName, setSongName] = useState("");
  const [diffLevel, setDiffLevel] = useState("EXT");
  const [diffValue, setDiffValue] = useState("");
  const [instrument, setInstrument] = useState("GUITAR");
  const [category, setCategory] = useState("Other");
  const [tag, setTag] = useState("");
  const [yomiCategory, setYomiCategory] = useState("");
  const [score, setScore] = useState("");
  const [skill, setSkill] = useState("");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Sync lockedSource when it changes (new recognition)
  useEffect(() => {
    setSource(lockedSource);
  }, [lockedSource]);

  // Persist source change to localStorage for next recognition
  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as SourceType;
    setSource(val);
    localStorage.setItem("fab-camera-source", val);
  };

  const matchedSong = useMemo(() => {
    if (!songName) return null;
    const diffNumeric = parseFloat(diffValue);
    return songs.find(
      (s) => {
        const nameMatch = s.歌曲名稱 === songName || s.歌曲名稱.trim().toLowerCase() === songName.trim().toLowerCase();
        const instMatch = String(s.樂器類型 || "").toUpperCase() === instrument.toUpperCase();
        const levelMatch = String(s.譜面等級 || "").toUpperCase() === diffLevel.toUpperCase();
        const valMatch = parseFloat(String(s.難度數值)) === diffNumeric;
        return nameMatch && instMatch && levelMatch && valMatch;
      }
    ) || null;
  }, [songName, instrument, diffLevel, diffValue, songs]);

  const isUpdate = !!matchedSong;

  // Pre-fill from recognition result
  useEffect(() => {
    if (!result) return;

    const recognizedScore = source === "arcade"
      ? (result.arcadeScore || result.homeScore || 0)
      : (result.homeScore || result.arcadeScore || 0);

    const recognizedSkill = source === "arcade"
      ? (result.arcadeSkill || result.homeSkill || 0)
      : (result.homeSkill || result.arcadeSkill || 0);

    const scoreStr = recognizedScore > 0 ? String(recognizedScore) : "";
    const skillStr = recognizedSkill > 0 ? String(recognizedSkill) : "";

    console.log("【RecognitionEditSheet 自動填入】:", {
      songName: result.songName,
      source,
      scoreStr,
      skillStr,
      yomiCategory: result.yomiCategory,
      tag: result.tag,
      instrument: result.instrument,
      difficulty: result.difficulty,
    });

    setSongName(result.songName || "");
    const diffParts = (result.difficulty || "").split(" ");
    setDiffLevel(diffParts[0] || "EXT");
    setDiffValue(diffParts[1] || "");
    setInstrument(result.instrument?.toUpperCase() === "BASS" ? "BASS" : "GUITAR");
    setScore(scoreStr);
    setSkill(skillStr);
    setRemark("");
    setCategory("Other");
    setTag(result.tag || "");
    setYomiCategory(result.yomiCategory || "");
  }, [result, source]);

  const currentBest = useMemo(() => {
    if (!matchedSong) return null;
    if (source === "arcade") {
      return {
        score: Number(matchedSong["街機版最佳達成率 (%)"]) || 0,
        skill: Number(matchedSong["街機版 Skill 點數"]) || 0,
      };
    }
    return {
      score: Number(matchedSong["家用版最佳達成率 (%)"]) || 0,
      skill: Number(matchedSong["家用版 Skill 點數"]) || 0,
    };
  }, [matchedSong, source]);

  const handleSaveClick = () => {
    const scoreVal = parseFloat(score);
    if (isNaN(scoreVal) || isNaN(parseFloat(skill))) {
      toast.error("請輸入有效的數值");
      return;
    }
    if (currentBest && currentBest.score > 0 && scoreVal < currentBest.score) {
      setShowConfirm(true);
      return;
    }
    handleSave();
  };

  const handleSave = async () => {
    console.log("【RecognitionEditSheet handleSave 開始】state snapshot:", {
      score, skill, songName, instrument, diffLevel, diffValue,
      source, category, tag, yomiCategory, remark,
    });

    const scoreVal = parseFloat(score);
    const skillVal = parseFloat(skill);
    if (isNaN(scoreVal) || isNaN(skillVal)) {
      toast.error("請輸入有效的數值");
      return;
    }

    setSaving(true);

    const difficulty = `${diffLevel} ${diffValue}`.trim();

    const payload: Record<string, unknown> = {
      mode,
      songName,
      instrument,
      difficulty,
      arcadeScore: "",
      arcadeSkill: "",
      homeScore: "",
      homeSkill: "",
      remark: remark || "",
      category: category || "Other",
      tag: tag || "",
      yomiCategory: yomiCategory || "",
    };

    if (source === "arcade") {
      payload.arcadeScore = scoreVal;
      payload.arcadeSkill = skillVal;
    } else {
      payload.homeScore = scoreVal;
      payload.homeSkill = skillVal;
    }

    console.log("【RecognitionEditSheet 送出 Payload】:", JSON.stringify(payload, null, 2));

    try {
      const result = await updateScore(payload as any);

      if (!result.ok) {
        toast.error(result.message || "儲存失敗，請稍後再試");
        setSaving(false);
        return;
      }

      const verified = await verifySave(mode, songName, instrument, difficulty);

      if (verified) {
        toast.success(isUpdate ? "更新成功" : "新增成功");
      } else {
        toast.warning("已送出，但尚未在資料中確認到更新，請稍後重新整理確認");
      }

      onClose();
      onSaved();
    } catch {
      toast.error("儲存失敗，請稍後再試");
    } finally {
      setSaving(false);
    }
  };

  const isGF = mode === "GF";

  return (
    <>
    <AnimatePresence>
      {result && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-lg px-5 pt-4 pb-8 max-h-[80vh] overflow-y-auto"
          >
            {/* Header with status badge */}
            <div className="flex items-center justify-between mb-3 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <h2 className="font-display font-bold text-base text-foreground shrink-0">
                  {isUpdate ? "更新成績" : "新增歌曲"}
                </h2>
                {isUpdate ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[11px] font-display font-bold whitespace-nowrap">
                    <RefreshCw size={10} />
                    已有紀錄
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[11px] font-display font-bold whitespace-nowrap">
                    <AlertCircle size={10} />
                    新歌曲
                  </span>
                )}
              </div>
              <button onClick={onClose} className="p-2 -mr-1 hover:bg-muted rounded-lg transition-colors shrink-0">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {/* Source dropdown (editable) */}
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/50">
              <span className="text-xs font-body font-semibold text-muted-foreground whitespace-nowrap">儲存至：</span>
              <div className="relative flex-1">
                <select
                  value={source}
                  onChange={handleSourceChange}
                  className="w-full bg-transparent text-sm font-display font-bold text-foreground focus:outline-none appearance-none pr-6 min-h-[28px]"
                >
                  <option value="arcade">街機版</option>
                  <option value="console">家用版</option>
                </select>
                <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {/* Song Name */}
              <FieldInput label="歌曲名稱" value={songName} onChange={setSongName} placeholder="例: MODEL DD ULTIMATES" />

              {/* Category + YomiCategory in one row */}
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="text-xs font-body font-semibold text-muted-foreground mb-1 block">新舊分類</label>
                  <div className="flex items-center gap-4 py-2 min-h-[44px]">
                    {[{ value: "HOT", label: "Hot" }, { value: "Other", label: "Other" }].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer min-h-[44px]" onClick={() => setCategory(opt.value)}>
                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          category === opt.value ? "border-primary" : "border-muted-foreground/40"
                        }`}>
                          {category === opt.value && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </span>
                        <span className="text-sm font-body text-foreground">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="w-1/2">
                  <label className="text-xs font-body font-semibold text-muted-foreground mb-1 block">歌名發音/分類</label>
                  <div className="relative">
                    <select
                      value={yomiCategory}
                      onChange={(e) => setYomiCategory(e.target.value)}
                      className="w-full bg-input rounded-lg px-3 min-h-[44px] pr-8 text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                    >
                      <option value="">未分類</option>
                      {["あ","か","さ","た","な","は","ま","や","ら","わ","A-Z","數字/符號"].map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Instrument Toggle */}
              <div>
                <label className="text-xs font-body font-semibold text-muted-foreground mb-1 block">樂器</label>
                <ToggleGroup
                  options={[
                    { value: "GUITAR", label: "Guitar" },
                    { value: "BASS", label: "Bass" },
                  ]}
                  value={instrument}
                  onChange={setInstrument}
                />
              </div>

              {/* Difficulty: Level (select) + Value (input) in one row */}
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="text-xs font-body font-semibold text-muted-foreground mb-1 block">譜面等級</label>
                  <div className="relative">
                    <select
                      value={diffLevel}
                      onChange={(e) => setDiffLevel(e.target.value)}
                      className="w-full bg-input rounded-lg px-3 min-h-[44px] pr-8 text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                    >
                      <option value="BSC">BSC</option>
                      <option value="ADV">ADV</option>
                      <option value="EXT">EXT</option>
                      <option value="MAS">MAS</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="w-1/2">
                  <FieldInput label="難度數值" value={diffValue} onChange={setDiffValue} placeholder="例: 7.25" />
                </div>
              </div>
              {/* Theoretical max skill */}
              {diffValue && !isNaN(parseFloat(diffValue)) && (
                <p className="text-xs font-body font-medium text-accent-foreground/70 mt-1 px-0.5">
                  理論最高 Skill：<span className="font-semibold text-primary">{(parseFloat(diffValue) * 20).toFixed(2)} pts</span>
                </p>
              )}

              {/* Score + Skill in one row */}
              <div className="flex gap-3">
                <div className="w-1/2">
                  <label className="text-xs font-body font-semibold text-muted-foreground mb-1 block">達成率 (%)</label>
                  {currentBest && currentBest.score > 0 && (
                    <p className={`text-[10px] font-body mb-1 font-medium ${
                      score && parseFloat(score) < currentBest.score ? "text-destructive" : "text-muted-foreground"
                    }`}>
                      目前最高：{currentBest.score}%
                    </p>
                  )}
                  <input
                    type="number"
                    step="0.01"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="89.39"
                    className="w-full bg-input rounded-lg px-3 min-h-[44px] text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="w-1/2">
                  <label className="text-xs font-body font-semibold text-muted-foreground mb-1 block">Skill 成績</label>
                  {currentBest && currentBest.skill > 0 && (
                    <p className={`text-[10px] font-body mb-1 font-medium ${
                      skill && parseFloat(skill) < currentBest.skill ? "text-destructive" : "text-muted-foreground"
                    }`}>
                      目前最高：{currentBest.skill}
                    </p>
                  )}
                  <input
                    type="number"
                    step="0.01"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    placeholder="137.66"
                    className="w-full bg-input rounded-lg px-3 min-h-[44px] text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Tag */}
              <div>
                <label className="text-xs font-body font-semibold text-muted-foreground mb-1 block">標籤（非必填）</label>
                <TagSelect
                  options={availableTags}
                  value={tag}
                  onChange={setTag}
                />
              </div>

              {/* Remark */}
              <div>
                <label className="text-xs font-body font-semibold text-muted-foreground mb-1 block">備註</label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="輸入備註..."
                  rows={2}
                  className="w-full bg-input rounded-lg px-3 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none border-0 outline-none"
                />
              </div>

              {/* Save */}
              <button
                onClick={handleSaveClick}
                disabled={saving}
                className={`w-full min-h-[48px] py-3 rounded-lg font-display font-semibold text-sm tracking-wider transition-all duration-150 ${
                  isGF
                    ? "bg-primary text-primary-foreground glow-primary"
                    : "bg-accent text-accent-foreground glow-secondary"
                } disabled:opacity-50`}
              >
                {saving ? "儲存中..." : isUpdate ? "更新成績" : "新增歌曲"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
      <AlertDialogContent className="max-w-[340px] rounded-lg z-[100]" overlayClassName="z-[90]">
        <AlertDialogHeader>
          <AlertDialogTitle>確認覆蓋成績</AlertDialogTitle>
          <AlertDialogDescription>
            新輸入的成績低於目前最高紀錄，確定要覆蓋儲存嗎？
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction onClick={() => { setShowConfirm(false); handleSave(); }}>
            確定
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-xs font-body font-semibold text-muted-foreground mb-1 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-input rounded-lg px-3 min-h-[44px] text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}