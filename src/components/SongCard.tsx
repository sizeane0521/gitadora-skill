import { useState, useEffect, memo } from "react";
import { Music2, Pencil, MessageSquareText, Heart } from "lucide-react";
import { SongData, GameMode, WishlistItem } from "@/types/song";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { getYomiRowSync, getYomiRowAsync } from "@/lib/yomi";

export interface SkillUpInfo {
  avgSkill: number;
  homeSkill: number;
  arcadeSkill: number;
  homeGap: number;
  arcadeGap: number;
  homeSurplus: number;
  arcadeSurplus: number;
  homeStatus: "not_played" | "below" | "reached";
  arcadeStatus: "not_played" | "below" | "reached";
}

interface SongCardProps {
  song: SongData;
  mode: GameMode;
  onEdit: (song: SongData) => void;
  rank?: number;
  wishlistMap?: Map<string, WishlistItem>;
  onToggleFavorite?: (song: SongData, newState: boolean) => void;
  skillUpInfo?: SkillUpInfo | null;
  kasegiOverlay?: { averageSkill: number } | null;
  hideSource?: "arcade" | "home";
}

// Match PianFen exactly
const DIFF_COLORS_LIGHT: Record<string, string> = {
  BSC: "bg-green-500/20 text-green-400",
  ADV: "bg-yellow-500/20 text-yellow-400",
  EXT: "bg-red-500/20 text-red-400",
  MAS: "bg-purple-500/20 text-purple-400",
};
const DIFF_STYLES_DARK: Record<string, { background: string; color: string }> = {
  BSC: { background: "var(--neon-cyan)",   color: "#000" },
  ADV: { background: "var(--neon-amber)",  color: "#000" },
  EXT: { background: "var(--neon-pink)",   color: "#000" },
  MAS: { background: "var(--neon-purple)", color: "#fff" },
};
const DIFF_BORDER_COLOR: Record<string, string> = {
  BSC: "var(--neon-cyan)",
  ADV: "var(--neon-amber)",
  EXT: "var(--neon-pink)",
  MAS: "var(--neon-purple)",
};
const DIFF_LEVEL_COLOR_LIGHT: Record<string, string> = {
  BSC: "#4ade80",
  ADV: "#facc15",
  EXT: "#f87171",
  MAS: "#c084fc",
};
const PART_COLOR: Record<string, string> = {
  GUITAR: "#FFB100",
  Guitar: "#FFB100",
  BASS:   "#6EE7B7",
  Bass:   "#6EE7B7",
  DRUMS:  "var(--neon-cyan)",
  Drums:  "var(--neon-cyan)",
};

function ScoreRow({
  label,
  rate,
  skill,
  isExcellent,
  isFullCombo,
  barColor,
  isDark,
  isHighest,
}: {
  label: string;
  rate: number;
  skill: number;
  isExcellent: boolean;
  isFullCombo: boolean;
  barColor: string;
  isDark: boolean;
  isHighest?: boolean;
}) {
  const resolvedBarColor = isHighest ? "#C6FF1A" : barColor;
  const isUnplayed = rate === 0 && skill === 0;

  return (
    <div className="flex items-center gap-1.5">
      <span
        style={{
          width: 18,
          flexShrink: 0,
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--color-text-muted)",
        }}
      >
        {label}
      </span>
      {isUnplayed ? (
        <span style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>—</span>
      ) : (
        <>
          <div
            className="flex-1 rounded-full"
            style={{ height: 6, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.min(Math.max(rate, 0), 100)}%`, background: resolvedBarColor }}
            />
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: isHighest ? "#C6FF1A" : "var(--color-text-primary)",
              flexShrink: 0,
              tabularNums: true,
            } as React.CSSProperties}
          >
            {skill > 0 ? skill.toFixed(1) : "—"}
          </span>
          {isExcellent && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: 700,
                padding: "1px 4px",
                borderRadius: "3px",
                flexShrink: 0,
                background: "var(--exc-pink-bg)",
                color: "var(--exc-pink)",
              }}
            >
              EXC
            </span>
          )}
          {!isExcellent && isFullCombo && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: 600,
                padding: "1px 4px",
                borderRadius: "3px",
                flexShrink: 0,
                background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
                color: "var(--color-text-muted)",
              }}
            >
              FC
            </span>
          )}
        </>
      )}
    </div>
  );
}

function SongCardInner({
  song,
  onEdit,
  rank,
  wishlistMap,
  onToggleFavorite,
  kasegiOverlay,
  hideSource,
}: SongCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [showNote, setShowNote] = useState(false);
  const isFav = song.isFavorite === "TRUE" || song.isFavorite === true;

  // Yomi: 優先用 DB 的 reading，fallback 用 kuroshiro（同賺分曲邏輯）
  const songName = song.歌曲名稱;
  const dbYomi = song["歌名發音/分類"];
  const syncRow = dbYomi || getYomiRowSync(songName);
  const [yomiRow, setYomiRow] = useState<string>(syncRow ?? "");
  useEffect(() => {
    if (syncRow !== null) { setYomiRow(syncRow ?? ""); return; }
    getYomiRowAsync(songName).then(setYomiRow);
  }, [songName, syncRow]);

  const diffKey = song.譜面等級?.toUpperCase() ?? "";
  const diffLightClass = DIFF_COLORS_LIGHT[diffKey] ?? "bg-zinc-500/20 text-zinc-400";
  const diffDarkStyle = DIFF_STYLES_DARK[diffKey] ?? { background: "#555", color: "#fff" };
  const coverBorderColor = DIFF_BORDER_COLOR[diffKey] ?? "var(--neon-cyan)";
  const partColor = PART_COLOR[song.樂器類型] ?? "#6EE7B7";

  const hasNote = !!song.備註;
  const wishlistKey = `${song.歌曲名稱}|${song.樂器類型.toUpperCase()}|${song.譜面等級.toUpperCase()}`;
  const wishlistItem = wishlistMap?.get(wishlistKey);

  const homeRate = Number(song["家用版最佳達成率 (%)"]) || 0;
  const homeSkill = Number(song["家用版 Skill 點數"]) || 0;
  const arcadeRate = Number(song["街機版最佳達成率 (%)"]) || 0;
  const arcadeSkill = Number(song["街機版 Skill 點數"]) || 0;

  const playerBestSkill = Math.max(arcadeSkill, homeSkill);
  const kasegiGap = kasegiOverlay ? kasegiOverlay.averageSkill - playerBestSkill : null;

  return (
    <>
      <div
        className="flex items-start gap-2 px-3 py-3"
        style={{
          marginBottom: "6px",
          background: isDark ? "color-mix(in srgb, #1E1530 85%, var(--bg-card))" : "#F8F9FB",
          borderRadius: "4px",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`,
        }}
      >
        {/* Rank number */}
        {rank != null && (
          <span
            style={{
              color: isDark ? "var(--neon-cyan)" : "var(--color-text-muted)",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontStyle: "italic",
              width: "22px",
              textAlign: "right",
              flexShrink: 0,
              fontSize: "13px",
            }}
          >
            {String(rank).padStart(2, "0")}
          </span>
        )}

        {/* Left column: cover (top) + diff badge (bottom) */}
        <div style={{ width: "40px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
          {/* Cover */}
          <div
            style={{
              padding: "1px",
              background: isDark ? coverBorderColor : `${coverBorderColor}88`,
              borderRadius: "3px",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {song.歌曲封面 ? (
              <img
                src={song.歌曲封面}
                alt=""
                style={{ width: 38, height: 38, objectFit: "cover", display: "block", borderRadius: "2px" }}
              />
            ) : (
              <div
                style={{
                  width: 38,
                  height: 38,
                  background: isDark ? "var(--color-bg-secondary)" : "#FFFFFF",
                  borderRadius: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Music2 size={16} style={{ color: isDark ? "var(--text-dim)" : "#CBD5E1", opacity: 0.7 }} />
              </div>
            )}
          </div>

          {/* Diff badge: vertically stacked label + level */}
          <div
            className={cn(!isDark && diffLightClass)}
            style={{
              width: "40px",
              borderRadius: "3px",
              padding: "2px 4px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              ...(isDark ? { background: diffDarkStyle.background, color: diffDarkStyle.color } : {}),
            }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontSize: "9px", fontWeight: 700, lineHeight: "13px" }}>
              {diffKey}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, lineHeight: "14px" }}>
              {parseFloat(Number(song.難度數值).toFixed(2)).toString()}
            </span>
          </div>
        </div>

        {/* Info area */}
        <div className="flex-1 min-w-0">
          {/* Line 1: yomi icon + title + buttons */}
          <div className="flex items-center gap-1.5 min-w-0">
            {yomiRow && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "20px",
                  height: "16px",
                  flexShrink: 0,
                  border: `1px solid ${isDark ? "color-mix(in srgb, var(--neon-cyan) 50%, transparent)" : "var(--color-border-default)"}`,
                  borderRadius: "2px",
                  color: isDark ? "var(--neon-cyan)" : "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  background: isDark ? "color-mix(in srgb, var(--neon-cyan) 6%, transparent)" : "transparent",
                }}
              >
                {yomiRow.replace("行", "")}
              </span>
            )}
            <p
              className="font-medium truncate flex-1 min-w-0"
              style={{ color: "var(--color-text-primary)", fontSize: "13px" }}
            >
              {song.歌曲名稱}
            </p>
            <div className="flex items-center gap-0.5 shrink-0">
              {hasNote && (
                <button onClick={() => setShowNote(true)} className="p-1 rounded hover:bg-muted transition-colors" aria-label="查看備註">
                  <MessageSquareText size={13} style={{ color: "var(--color-text-muted)" }} />
                </button>
              )}
              <button onClick={() => onToggleFavorite?.(song, !isFav)} className="p-1 rounded hover:bg-muted transition-colors" aria-label={isFav ? "取消最愛" : "加入最愛"}>
                <Heart size={13} className={isFav ? "text-destructive fill-destructive" : "text-muted-foreground"} />
              </button>
              <button onClick={() => onEdit(song)} className="p-1 rounded hover:bg-muted transition-colors" aria-label="編輯成績">
                <Pencil size={13} style={{ color: "var(--color-text-muted)" }} />
              </button>
            </div>
          </div>

          {/* Line 2: instrument (left) | kasegi badge group (right) */}
          <div className="flex items-center mt-0.5 justify-between gap-1">
            <span style={{ color: isDark ? partColor : `${partColor}CC`, fontSize: "10px", fontWeight: 600, flexShrink: 0 }}>
              {song.樂器類型}
            </span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {wishlistItem && (
                <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "3px", background: isDark ? "color-mix(in srgb, var(--neon-lime) 10%, transparent)" : "rgba(0,0,0,0.06)", color: isDark ? "var(--neon-lime)" : "var(--color-text-muted)" }}>
                  {wishlistItem.targetTier}目標 {wishlistItem.avgSkill}
                </span>
              )}
              {kasegiOverlay && (
                <>
                  {kasegiGap !== null && kasegiGap > 0 && (
                    <>
                      <span style={{ fontSize: "9px", padding: "1px 4px", borderRadius: "2px", border: "1px solid rgba(255,27,141,0.7)", color: "rgba(255,27,141,0.7)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                        未達標
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, color: "rgba(255,27,141,0.7)", whiteSpace: "nowrap" }}>
                        ―{kasegiGap.toFixed(1)}
                      </span>
                    </>
                  )}
                  <span style={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
                    <span style={{ fontSize: "9px", color: "var(--color-text-muted)", fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}>目標</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "#C6FF1A" }}>
                      {kasegiOverlay.averageSkill.toFixed(1)}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Gradient separator: pink on right, fades to left */}
          <div style={{ height: "2px", margin: "5px 0 4px", background: "linear-gradient(to left, rgba(255,27,141,0.6) 0%, transparent 80%)" }} />

          {/* Score rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {hideSource !== "arcade" && (
              <ScoreRow
                label="街"
                rate={arcadeRate}
                skill={arcadeSkill}
                isExcellent={!!song._isExcellent}
                isFullCombo={!!song._isFullCombo}
                barColor="color-mix(in srgb, var(--neon-pink) 70%, transparent)"
                isDark={isDark}
                isHighest={arcadeSkill > 0 && arcadeSkill >= homeSkill}
              />
            )}
            {hideSource !== "home" && (
              <ScoreRow
                label="家"
                rate={homeRate}
                skill={homeSkill}
                isExcellent={!!song._isExcellent}
                isFullCombo={!!song._isFullCombo}
                barColor="color-mix(in srgb, var(--neon-cyan) 70%, transparent)"
                isDark={isDark}
                isHighest={homeSkill > 0 && homeSkill > arcadeSkill}
              />
            )}
          </div>
        </div>
      </div>

      {/* Note modal */}
      <AnimatePresence>
        {showNote && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-background/60 backdrop-blur-sm"
              onClick={() => setShowNote(false)}
            />
            <div className="fixed z-[90] inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }}
                className="pointer-events-auto w-[calc(100%-2rem)] max-w-sm bg-card rounded-lg p-5 shadow-lg"
              >
                <h3 className="font-display font-bold text-sm text-foreground mb-1">{song.歌曲名稱}</h3>
                <p className="text-[10px] text-muted-foreground mb-3">備註</p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{song.備註}</p>
                <button onClick={() => setShowNote(false)} className="mt-4 w-full py-2 rounded bg-muted text-muted-foreground text-sm hover:bg-muted/80 transition-colors">
                  關閉
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

const SongCard = memo(SongCardInner, (prev, next) => {
  return (
    prev.song === next.song &&
    prev.mode === next.mode &&
    prev.onEdit === next.onEdit &&
    prev.onToggleFavorite === next.onToggleFavorite &&
    prev.wishlistMap === next.wishlistMap &&
    prev.skillUpInfo === next.skillUpInfo &&
    prev.kasegiOverlay === next.kasegiOverlay
  );
});

export default SongCard;
