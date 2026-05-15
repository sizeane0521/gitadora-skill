import { useState, useEffect } from "react";
import SongCardSkeleton from "@/components/SongCardSkeleton";
import { useNavigate, useParams } from "react-router-dom";
import { Music2 } from "lucide-react";
import { useKasegiFromDB, SCOPE_TIERS, type ScopeTier, type PianFenRecord, type SortBy } from "@/hooks/usePianFen";
import { useZetarakuSongs } from "@/hooks/useZetarakuSongs";
import { getYomiRowSync, getYomiRowAsync, warmupKuroshiro } from "@/lib/yomi";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const ZETARAKU_COVER_BASE = "https://dp4p6x0xfi5o9.cloudfront.net/gitadora/img/cover";

const PART_COLOR: Record<string, string> = {
  G: "#FFB100",
  B: "#6EE7B7",
  D: "var(--neon-cyan)",
};

const DIFF_BORDER_COLOR: Record<string, string> = {
  BSC: "var(--neon-cyan)",
  ADV: "var(--neon-amber)",
  EXT: "var(--neon-pink)",
  MAS: "var(--neon-purple)",
};

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

const PART_LABEL: Record<string, string> = {
  G: "Guitar",
  B: "Bass",
  D: "Drums",
};

const PAGE_SIZE = 25;

function RecordRow({
  record,
  rank,
  coverMap,
  isDark,
}: {
  record: PianFenRecord;
  rank: number;
  coverMap: Map<string, string>;
  isDark: boolean;
}) {
  const diffKey = record.diff.toUpperCase();
  const diffLightClass = DIFF_COLORS_LIGHT[diffKey] ?? "bg-zinc-500/20 text-zinc-400";
  const diffDarkStyle = DIFF_STYLES_DARK[diffKey] ?? { background: "#555", color: "#fff" };

  const imageName = coverMap.get(record.name);
  const coverUrl = imageName ? `${ZETARAKU_COVER_BASE}/${imageName}` : null;
  const partColor = PART_COLOR[record.part] ?? "#6EE7B7";
  const coverBorderColor = DIFF_BORDER_COLOR[diffKey] ?? "var(--neon-cyan)";

  const syncRow = getYomiRowSync(record.name);
  const [yomiRow, setYomiRow] = useState<string>(syncRow ?? "");

  useEffect(() => {
    if (syncRow !== null) return;
    getYomiRowAsync(record.name).then(setYomiRow);
  }, [record.name, syncRow]);

  return (
    <div
      className="flex items-center gap-2 px-3 py-3"
      style={{
        marginBottom: "6px",
        background: isDark
          ? "color-mix(in srgb, #1E1530 85%, var(--bg-card))"
          : "#F8F9FB",
        borderRadius: "4px",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`,
      }}
    >
      {/* Rank */}
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

      {/* Cover */}
      <div
        style={{
          padding: "1px",
          background: isDark ? coverBorderColor : `${coverBorderColor}88`,
          borderRadius: "3px",
          flexShrink: 0,
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            style={{
              width: "38px",
              height: "38px",
              objectFit: "cover",
              display: "block",
              borderRadius: "2px",
            }}
          />
        ) : (
          <div
            style={{
              width: "38px",
              height: "38px",
              background: isDark ? "var(--color-bg-secondary)" : "#FFFFFF",
              borderRadius: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Music2
              size={16}
              style={{
                color: isDark ? "var(--text-dim)" : "#CBD5E1",
                opacity: 0.7,
              }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Title line: yomi badge + song name */}
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
            className="font-medium truncate"
            style={{ color: "var(--color-text-primary)", fontSize: "13px" }}
          >
            {record.name}
          </p>
        </div>
        {/* Metadata line: diff + part + level */}
        <div className="flex items-center gap-1 mt-0.5">
          <span
            className={cn(!isDark && diffLightClass)}
            style={{
              padding: "1px 5px",
              borderRadius: "3px",
              fontFamily: "var(--font-display)",
              fontSize: "9px",
              fontWeight: 700,
              flexShrink: 0,
              ...(isDark
                ? { background: diffDarkStyle.background, color: diffDarkStyle.color }
                : {}),
            }}
          >
            {diffKey}
          </span>
          <span style={{ color: isDark ? partColor : `${partColor}CC`, fontSize: "10px", fontWeight: 600, flexShrink: 0 }}>
            {PART_LABEL[record.part] ?? record.part}
          </span>
          <span
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              flexShrink: 0,
            }}
          >
            {record.diffValue}
          </span>
        </div>
      </div>

      {/* Skill + Percent */}
      <div className="flex flex-col items-end shrink-0">
        <p
          className={cn("tabular-nums italic", isDark && "skill-neon-glow")}
          style={{
            color: isDark ? "var(--neon-lime)" : record.part === "D" ? "#00C0CC" : "#CC1671",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: "15px",
          }}
        >
          {record.averageSkill.toFixed(1)}
        </p>
        <p
          className="tabular-nums"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
          }}
        >
          {record.percent.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

function SectionHeader({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <div
      className="px-4 py-2 text-xs font-bold uppercase tracking-widest border-b"
      style={{
        color: isDark ? "var(--neon-lime)" : "var(--color-text-muted)",
        background: "var(--color-bg-primary)",
        borderColor: isDark ? "var(--bg-grid)" : "var(--color-border-default)",
        borderLeft: isDark ? "2px solid var(--neon-lime)" : undefined,
        fontFamily: "var(--font-display)",
        letterSpacing: "0.2em",
      }}
    >
      {title}
    </div>
  );
}

function PaginationControls({
  page,
  totalPages,
  onPrev,
  onNext,
  isDark,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  isDark: boolean;
}) {
  if (totalPages <= 1) return null;
  return (
    <div
      className="flex items-center justify-center gap-4 py-4"
      style={{ borderTop: `1px solid ${isDark ? "var(--bg-grid)" : "var(--color-border-default)"}` }}
    >
      <button
        onClick={onPrev}
        disabled={page === 1}
        style={{
          padding: "4px 14px",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          fontWeight: 700,
          border: `1px solid ${isDark ? (page === 1 ? "var(--bg-mute)" : "var(--neon-cyan)") : "var(--color-border-default)"}`,
          color: isDark ? (page === 1 ? "var(--text-dim)" : "var(--neon-cyan)") : (page === 1 ? "var(--color-text-disabled)" : "var(--color-brand)"),
          background: "transparent",
          opacity: page === 1 ? 0.4 : 1,
          cursor: page === 1 ? "default" : "pointer",
          transition: "all 150ms ease-out",
        }}
      >
        ◄
      </button>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: isDark ? "var(--neon-lime)" : "var(--color-text-muted)",
          letterSpacing: "0.1em",
        }}
      >
        {page} / {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page === totalPages}
        style={{
          padding: "4px 14px",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          fontWeight: 700,
          border: `1px solid ${isDark ? (page === totalPages ? "var(--bg-mute)" : "var(--neon-cyan)") : "var(--color-border-default)"}`,
          color: isDark ? (page === totalPages ? "var(--text-dim)" : "var(--neon-cyan)") : (page === totalPages ? "var(--color-text-disabled)" : "var(--color-brand)"),
          background: "transparent",
          opacity: page === totalPages ? 0.4 : 1,
          cursor: page === totalPages ? "default" : "pointer",
          transition: "all 150ms ease-out",
        }}
      >
        ►
      </button>
    </div>
  );
}

export default function PianFen() {
  const { instrument = "gf" } = useParams<{ instrument?: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const gameType = instrument.toUpperCase() === "DM" ? "DM" : "GF";
  const [scope, setScope] = useState<ScopeTier>(7000);
  const [section, setSection] = useState<"hot" | "other">("hot");
  const [hotPage, setHotPage] = useState(1);
  const [otherPage, setOtherPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortBy>("percent");

  const { data, isLoading, isError } = useKasegiFromDB(gameType as "GF" | "DM", scope, sortBy);
  const coverMap = useZetarakuSongs();

  useEffect(() => {
    document.documentElement.dataset.instrument = gameType.toLowerCase();
    return () => { delete document.documentElement.dataset.instrument; };
  }, [gameType]);

  // Reset pages and section when instrument or scope changes
  useEffect(() => {
    setSection("hot");
    setHotPage(1);
    setOtherPage(1);
  }, [gameType, scope]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
  }, [hotPage, otherPage]);

  useEffect(() => {
    if (!data) return;
    const allRecords = [...data.hot, ...data.other];
    const hasKanji = allRecords.some((r) => getYomiRowSync(r.name) === null);
    if (hasKanji) warmupKuroshiro();
  }, [data]);

  const hotTotalPages = Math.max(1, Math.ceil((data?.hot.length ?? 0) / PAGE_SIZE));
  const otherTotalPages = Math.max(1, Math.ceil((data?.other.length ?? 0) / PAGE_SIZE));
  const hotPageItems = data?.hot.slice((hotPage - 1) * PAGE_SIZE, hotPage * PAGE_SIZE) ?? [];
  const otherPageItems = data?.other.slice((otherPage - 1) * PAGE_SIZE, otherPage * PAGE_SIZE) ?? [];

  const sectionNeon = section === "hot" ? "var(--neon-pink)" : "var(--neon-cyan)";
  const cardBg = isDarkMode ? "var(--bg-card)" : "var(--color-bg-primary)";

  const sortPillStyle = (active: boolean) =>
    active
      ? isDarkMode
        ? { border: "1px solid var(--neon-lime)", color: "var(--neon-lime)", background: "color-mix(in srgb, var(--neon-lime) 10%, transparent)" }
        : { background: "var(--color-brand)", color: "#fff", borderRadius: "3px", border: "none" }
      : { border: `1px solid ${isDarkMode ? "var(--bg-mute)" : "transparent"}`, color: isDarkMode ? "var(--text-dim)" : "var(--color-text-muted)", background: "transparent" };

  return (
    <div style={{ color: "var(--color-text-primary)" }}>

      {/* Page Header */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: isDarkMode ? "var(--bg-grid)" : "var(--color-border-default)" }}
      >
        <h1
          className="font-display font-bold uppercase"
          style={{
            fontSize: "20px",
            letterSpacing: "0.2em",
            color: isDarkMode ? "var(--neon-pink)" : "var(--color-brand)",
            textShadow: isDarkMode
              ? "0 0 10px var(--neon-pink), 0 0 24px color-mix(in srgb, var(--neon-pink) 50%, transparent)"
              : "none",
          }}
        >
          賺分曲
        </h1>
      </div>

      {/* GF / DM Tab */}
      <div
        className="sticky top-0 z-10 flex"
        style={{
          background: isDarkMode ? "#0A051A" : "var(--color-bg-elevated)",
          borderBottom: `1px solid ${isDarkMode ? "var(--bg-grid)" : "var(--color-border-default)"}`,
        }}
      >
        {(["gf", "dm"] as const).map((inst, idx) => {
          const isActive = instrument === inst;
          const neonColor = inst === "gf" ? "var(--neon-pink)" : "var(--neon-cyan)";
          return (
            <button
              key={inst}
              onClick={() => navigate(`/pian-fen/${inst}`)}
              className="relative flex-1 py-3 overflow-hidden"
              style={{
                background: isActive && isDarkMode
                  ? `color-mix(in srgb, ${neonColor} 8%, transparent)`
                  : "transparent",
                border: isDarkMode
                  ? `1px solid ${isActive ? neonColor : "var(--bg-mute)"}`
                  : `1px solid ${isActive ? "var(--color-brand)" : "var(--color-border-default)"}`,
                borderBottom: isActive
                  ? (isDarkMode ? `2px solid ${neonColor}` : `2px solid var(--color-brand)`)
                  : `1px solid ${isDarkMode ? "var(--bg-grid)" : "var(--color-border-default)"}`,
                clipPath: idx === 0
                  ? "polygon(0 0, 100% 0, 92% 100%, 0 100%)"
                  : "polygon(8% 0, 100% 0, 100% 100%, 0 100%)",
                color: isActive
                  ? (isDarkMode ? neonColor : "var(--color-brand)")
                  : (isDarkMode ? "var(--text-dim)" : "var(--color-text-muted)"),
                fontFamily: "var(--font-display)",
                fontSize: "13px",
                letterSpacing: "0.15em",
                transition: "all 150ms ease-out",
                textShadow: isActive && isDarkMode
                  ? `0 0 8px ${neonColor}`
                  : "none",
              }}
            >
              {inst.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Scope selector */}
      <div
        className="px-4 py-2 border-b flex items-center gap-2 overflow-x-auto"
        style={{ borderColor: isDarkMode ? "var(--bg-grid)" : "var(--color-border-default)" }}
      >
        <span
          className="text-xs shrink-0"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.05em",
          }}
        >
          技能段位
        </span>
        <div className="flex gap-1">
          {SCOPE_TIERS.map((tier) => (
            <button
              key={tier}
              onClick={() => setScope(tier)}
              className="text-xs shrink-0 transition-colors"
              style={{
                padding: "2px 6px",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                ...(scope === tier
                  ? isDarkMode
                    ? { border: "1px solid var(--neon-lime)", color: "var(--neon-lime)", background: "color-mix(in srgb, var(--neon-lime) 10%, transparent)" }
                    : { background: "var(--color-brand)", color: "#fff", borderRadius: "3px", border: "none" }
                  : { border: `1px solid ${isDarkMode ? "var(--bg-mute)" : "transparent"}`, color: isDarkMode ? "var(--text-dim)" : "var(--color-text-muted)", background: "transparent" }),
              }}
            >
              {tier}~
            </button>
          ))}
        </div>
      </div>

      {/* HOT / OTHER tab row */}
      <div
        className="px-3 py-2 flex items-center justify-between"
      >
        <div className="flex gap-1">
          {(["hot", "other"] as const).map((s) => {
            const isActive = section === s;
            const neon = s === "hot" ? "var(--neon-pink)" : "var(--neon-cyan)";
            return (
              <button
                key={s}
                onClick={() => setSection(s)}
                style={{
                  padding: "3px 12px",
                  fontFamily: "var(--font-display)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  borderRadius: "3px",
                  transition: "all 150ms ease-out",
                  cursor: "pointer",
                  ...(isActive
                    ? isDarkMode
                      ? { border: `1px solid color-mix(in srgb, ${neon} 55%, transparent)`, color: neon, background: `color-mix(in srgb, ${neon} 10%, transparent)` }
                      : { border: "1px solid var(--color-brand)", color: "var(--color-brand)", background: "color-mix(in srgb, var(--color-brand) 10%, transparent)" }
                    : { border: `1px solid ${isDarkMode ? "var(--bg-mute)" : "var(--color-border-default)"}`, color: isDarkMode ? "var(--text-dim)" : "var(--color-text-muted)", background: "transparent" }),
                }}
              >
                {s.toUpperCase()}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1">
          {(["skill", "percent"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSortBy(mode)}
              className="text-xs transition-colors"
              style={{
                padding: "2px 7px",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                borderRadius: "3px",
                cursor: "pointer",
                ...sortPillStyle(sortBy === mode),
              }}
            >
              {mode === "skill" ? "技能分" : "玩家%"}
            </button>
          ))}
        </div>
      </div>

      {/* 漸層分隔線 */}
      <div
        style={{
          height: "2px",
          background: `linear-gradient(to right, ${sectionNeon} 0%, transparent 70%)`,
          transition: "background 200ms ease-out",
          marginBottom: "4px",
        }}
      />

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2 px-4 py-3">
          {Array.from({ length: 6 }).map((_, i) => <SongCardSkeleton key={i} />)}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            無法載入賺分曲資料，請稍後再試
          </p>
        </div>
      )}

      {/* Empty: not yet synced */}
      {!isLoading && !isError && data && data.hot.length === 0 && data.other.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            賺分曲資料尚未同步，請管理者執行同步
          </p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && data && (data.hot.length > 0 || data.other.length > 0) && (
        <div style={{ overflow: "hidden" }}>
            {section === "hot" ? (
              <>
                {hotPageItems.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-center" style={{ color: "var(--color-text-muted)" }}>無資料</p>
                ) : (
                  hotPageItems.map((record, idx) => (
                    <RecordRow
                      key={`hot-${(hotPage - 1) * PAGE_SIZE + idx}`}
                      record={record}
                      rank={(hotPage - 1) * PAGE_SIZE + idx + 1}
                      coverMap={coverMap}
                      isDark={isDarkMode}
                    />
                  ))
                )}
                <PaginationControls
                  page={hotPage}
                  totalPages={hotTotalPages}
                  onPrev={() => setHotPage(p => Math.max(1, p - 1))}
                  onNext={() => setHotPage(p => Math.min(hotTotalPages, p + 1))}
                  isDark={isDarkMode}
                />
              </>
            ) : (
              <>
                {otherPageItems.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-center" style={{ color: "var(--color-text-muted)" }}>無資料</p>
                ) : (
                  otherPageItems.map((record, idx) => (
                    <RecordRow
                      key={`other-${(otherPage - 1) * PAGE_SIZE + idx}`}
                      record={record}
                      rank={(otherPage - 1) * PAGE_SIZE + idx + 1}
                      coverMap={coverMap}
                      isDark={isDarkMode}
                    />
                  ))
                )}
                <PaginationControls
                  page={otherPage}
                  totalPages={otherTotalPages}
                  onPrev={() => setOtherPage(p => Math.max(1, p - 1))}
                  onNext={() => setOtherPage(p => Math.min(otherTotalPages, p + 1))}
                  isDark={isDarkMode}
                />
              </>
            )}
        </div>
      )}
    </div>
  );
}
