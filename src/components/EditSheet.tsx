import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { SongData, GameMode } from "@/types/song";
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

interface EditSheetProps {
  song: SongData | null;
  mode: GameMode;
  availableTags: string[];
  onClose: () => void;
  onSaved: () => void;
}

type SourceType = "arcade" | "home";

export default function EditSheet({ song, mode, availableTags, onClose, onSaved }: EditSheetProps) {
  const [source, setSource] = useState<SourceType>("arcade");
  const [score, setScore] = useState("");
  const [skill, setSkill] = useState("");
  const [remark, setRemark] = useState("");
  const [category, setCategory] = useState("Other");
  const [tag, setTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleOpen = () => {
    if (song) {
      setSource("arcade");
      prefillForSource("arcade");
      setRemark(song.備註 || "");
      setCategory(song.新舊分類 || "Other");
      const existingTags = song.標籤 ? song.標籤.split(",").map(t => t.trim()).filter(Boolean) : [];
      setTag(existingTags[0] || "");
    }
  };

  const prefillForSource = (s: SourceType) => {
    if (!song) return;
    if (s === "arcade") {
      const rate = Number(song["街機版最佳達成率 (%)"]) || 0;
      const sk = Number(song["街機版 Skill 點數"]) || 0;
      setScore(rate > 0 ? String(rate) : "");
      setSkill(sk > 0 ? String(sk) : "");
    } else {
      const rate = Number(song["家用版最佳達成率 (%)"]) || 0;
      const sk = Number(song["家用版 Skill 點數"]) || 0;
      setScore(rate > 0 ? String(rate) : "");
      setSkill(sk > 0 ? String(sk) : "");
    }
  };

  const handleSourceChange = (s: string) => {
    const src = s as SourceType;
    setSource(src);
    prefillForSource(src);
  };

  const currentBest = song ? (
    source === "arcade"
      ? Number(song["街機版最佳達成率 (%)"]) || 0
      : Number(song["家用版最佳達成率 (%)"]) || 0
  ) : 0;

  const handleSaveClick = () => {
    if (!song) return;
    const scoreVal = score.trim() === "" ? 0 : parseFloat(score);
    if (score.trim() !== "" && isNaN(scoreVal)) {
      toast.error("請輸入有效的數值");
      return;
    }
    if (score.trim() !== "" && currentBest > 0 && scoreVal < currentBest) {
      setShowConfirm(true);
      return;
    }
    handleSave();
  };

  const handleSave = async () => {
    if (!song) return;
    const scoreVal = score.trim() === "" ? undefined : parseFloat(score);
    const skillVal = skill.trim() === "" ? undefined : parseFloat(skill);
    if ((scoreVal !== undefined && isNaN(scoreVal)) || (skillVal !== undefined && isNaN(skillVal))) {
      toast.error("請輸入有效的數值");
      return;
    }
    setSaving(true);

    const difficulty = `${song.譜面等級} ${song.難度數值}`;

    // 取得現有成績作為預設值，避免送空字串覆蓋掉另一邊的資料
    const existingArcadeScore = Number(song["街機版最佳達成率 (%)"]) || "";
    const existingArcadeSkill = Number(song["街機版 Skill 點數"]) || "";
    const existingHomeScore = Number(song["家用版最佳達成率 (%)"]) || "";
    const existingHomeSkill = Number(song["家用版 Skill 點數"]) || "";

    const payload: Record<string, unknown> = {
      mode,
      songName: song.歌曲名稱,
      instrument: song.樂器類型,
      difficulty,
      remark: remark || "",
      category: category || "Other",
      tag: tag || "",
      yomiCategory: song["歌名發音/分類"] || "",
    };

    if (source === "arcade") {
      payload.arcadeScore = scoreVal ?? "";
      payload.arcadeSkill = skillVal ?? "";
      // 保留家用版的現有成績，避免被空字串覆蓋
      payload.homeScore = existingHomeScore;
      payload.homeSkill = existingHomeSkill;
    } else {
      payload.homeScore = scoreVal ?? "";
      payload.homeSkill = skillVal ?? "";
      // 保留街機版的現有成績，避免被空字串覆蓋
      payload.arcadeScore = existingArcadeScore;
      payload.arcadeSkill = existingArcadeSkill;
    }

    const result = await updateScore(payload as any);
    if (result.ok) {
      // verifySave 內建 retry（首次等 3 秒，之後每 1.5 秒重試，共 3 次）
      const verified = await verifySave(mode, song.歌曲名稱, song.樂器類型, difficulty);
      if (verified) {
        toast.success("成績已更新！");
      } else {
        toast.warning("已送出，但尚未在資料中確認到更新，請稍後重新整理確認");
      }
      onClose();
      onSaved();
    } else {
      toast.error(result.message || "儲存失敗，請稍後再試");
    }
    setSaving(false);
  };

  const isGF = mode === "GF";

  return (
    <>
    <AnimatePresence>
      {song && (
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
            onAnimationComplete={() => handleOpen()}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-lg px-5 pt-4 pb-8 max-h-[70vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-base text-foreground truncate pr-4">
                {song.歌曲名稱}
              </h2>
              <button onClick={onClose} className="p-1 hover:bg-muted rounded transition-colors">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {/* Source Toggle */}
            <ToggleGroup
              options={[
                { value: "arcade", label: "街機版" },
                { value: "home", label: "家用版" },
              ]}
              value={source}
              onChange={handleSourceChange}
            />

            <div className="space-y-3 mt-3">
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">
                  更新{source === "arcade" ? "街機版" : "家用版"}最佳達成率 (%)
                </label>
                {currentBest > 0 && (
                  <p className={`text-[10px] font-body mb-1 font-medium ${
                    score && parseFloat(score) < currentBest ? "text-destructive" : "text-muted-foreground"
                  }`}>
                    目前最高：{currentBest}%
                  </p>
                )}
                <input
                  type="number"
                  step="0.01"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="例: 89.39"
                  className="w-full bg-input rounded px-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">
                  更新{source === "arcade" ? "街機版" : "家用版"} Skill 點數
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  placeholder="例: 137.66"
                  className="w-full bg-input rounded px-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Tag */}
              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">標籤（非必填）</label>
                <TagSelect
                  options={availableTags}
                  value={tag}
                  onChange={setTag}
                />
              </div>

              <div>
                <label className="text-xs font-body text-muted-foreground mb-1 block">備註</label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="輸入備註..."
                  rows={3}
                  className="w-full bg-input rounded px-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none border-0 outline-none"
                />
              </div>
              <button
                onClick={handleSaveClick}
                disabled={saving}
                className={`w-full py-3 rounded font-display font-semibold text-sm tracking-wider transition-all duration-150 ${
                  isGF
                    ? "bg-primary text-primary-foreground glow-primary"
                    : "bg-accent text-accent-foreground glow-secondary"
                } disabled:opacity-50`}
              >
                {saving ? "儲存中..." : "儲存"}
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
