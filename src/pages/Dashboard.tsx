import { useState, useMemo, useCallback, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";
import { usePianFen, SCOPE_TIERS, type ScopeTier } from "@/hooks/usePianFen";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import type { SongData } from "@/types/song";
import type { GameType } from "@/types/database";
import { toast } from "@/hooks/use-toast";
import SongCard from "@/components/SongCard";
import EditSheet from "@/components/EditSheet";
import { useZetarakuSongs } from "@/hooks/useZetarakuSongs";
import { useUnifiedSongList } from "@/hooks/useUnifiedSongList";
import SongCardSkeleton from "@/components/SongCardSkeleton";
import SongListPagination from "@/components/SongListPagination";
import ScrollToTopButton from "@/components/ScrollToTopButton";

const ZETARAKU_COVER_BASE = "https://dp4p6x0xfi5o9.cloudfront.net/gitadora/img/cover";

type SortKey = "all" | "home_skill" | "arcade_skill";
type HotOther = "hot" | "other";

function ScoreList({ gameType, isDark, scope }: { gameType: GameType; isDark: boolean; scope: ScopeTier }) {
  const { user } = useAuthContext();
  const [hotOther, setHotOther] = useState<HotOther>("hot");
  const [sortKey, setSortKey] = useState<SortKey>("all");
  const [underperforming, setUnderperforming] = useState(false);
  const [page, setPage] = useState(1);
  const [editSong, setEditSong] = useState<SongData | null>(null);
  const PAGE_SIZE = 25;
  const coverMap = useZetarakuSongs();

  const mode = gameType === "DM" ? "DM" : "GF";
  const { data, isLoading } = useUnifiedSongList(mode);
  const { data: pianFenData } = usePianFen(mode, scope);

  const kasegiMap = useMemo(() => {
    const map = new Map<string, number>();
    const makeKey = (name: string, diff: string, part: string) =>
      `${name.trim()}|${diff.trim().toUpperCase()}|${part.trim().toUpperCase()}`;
    for (const r of pianFenData?.hot ?? []) map.set(makeKey(r.name, r.diff, r.part), r.averageSkill);
    for (const r of pianFenData?.other ?? []) {
      const key = makeKey(r.name, r.diff, r.part);
      if (!map.has(key)) map.set(key, r.averageSkill);
    }
    return map;
  }, [pianFenData]);

  const getPlayerSkill = useCallback((s: SongData) => {
    if (sortKey === "home_skill") return Number(s["家用版 Skill 點數"]) || 0;
    if (sortKey === "arcade_skill") return Number(s["街機版 Skill 點數"]) || 0;
    return Math.max(Number(s["街機版 Skill 點數"]) || 0, Number(s["家用版 Skill 點數"]) || 0);
  }, [sortKey]);

  const getKasegiKey = (s: SongData) => {
    const part = s.樂器類型 === "bass" ? "B" : s.樂器類型 === "drums" ? "D" : "G";
    return `${s.歌曲名稱.trim()}|${s.譜面等級.trim().toUpperCase()}|${part}`;
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    let items = data;

    // HOT / OTHER filter
    if (hotOther === "hot") {
      items = items.filter((s) => s.新舊分類 === "HOT");
    } else {
      items = items.filter((s) => s.新舊分類 !== "HOT");
    }

    // Source filter derived from sortKey
    if (sortKey === "home_skill") {
      items = items.filter((s) => Number(s["家用版 Skill 點數"]) > 0);
    } else if (sortKey === "arcade_skill") {
      items = items.filter((s) => Number(s["街機版 Skill 點數"]) > 0);
    }

    // Underperforming filter
    if (underperforming) {
      items = items.filter((s) => {
        const avg = kasegiMap.get(getKasegiKey(s));
        return avg !== undefined && getPlayerSkill(s) < avg;
      });
    }

    const sorted = [...items].sort((a, b) => {
      // When underperforming active, sort by gap descending
      if (underperforming) {
        const aGap = (kasegiMap.get(getKasegiKey(a)) ?? 0) - getPlayerSkill(a);
        const bGap = (kasegiMap.get(getKasegiKey(b)) ?? 0) - getPlayerSkill(b);
        return bGap - aGap;
      }
      if (sortKey === "home_skill") {
        return (Number(b["家用版 Skill 點數"]) || 0) - (Number(a["家用版 Skill 點數"]) || 0);
      }
      if (sortKey === "arcade_skill") {
        return (Number(b["街機版 Skill 點數"]) || 0) - (Number(a["街機版 Skill 點數"]) || 0);
      }
      // "all": sort by best skill
      return Math.max(Number(b["街機版 Skill 點數"]) || 0, Number(b["家用版 Skill 點數"]) || 0)
           - Math.max(Number(a["街機版 Skill 點數"]) || 0, Number(a["家用版 Skill 點數"]) || 0);
    });
    return sorted;
  }, [data, hotOther, sortKey, underperforming, kasegiMap, getPlayerSkill]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = useCallback((n: number) => {
    setPage(n);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
  }, [page]);

  const hasFilter = sortKey !== "all";

  const resetFilters = () => {
    setSortKey("all");
    setUnderperforming(false);
    setPage(1);
  };

  const sectionNeon = hotOther === "hot" ? "var(--neon-pink)" : "var(--neon-cyan)";

  if (isLoading) {
    return (
      <div className="space-y-2 px-4 py-3">
        {Array.from({ length: 6 }).map((_, i) => <SongCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p style={{ color: "var(--color-text-muted)" }}>尚無歌曲資料</p>
        <Link to="/import">
          <Button style={{ background: "var(--color-brand)", color: "#fff" }}>
            匯入成績
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Row 1 (sticky): HOT/OTHER tabs (50%) + 未達標+sort (50%) */}
      <div
        className="sticky top-[52px] z-[9] flex items-center px-3 py-2 gap-2"
        style={{
          background: isDark ? "#0A051A" : "var(--color-bg-elevated)",
          borderBottom: `1px solid ${isDark ? "var(--bg-grid)" : "var(--color-border-default)"}`,
        }}
      >
        {/* Left half: HOT / OTHER skewed tabs */}
        <div className="flex w-1/2">
          {(["hot", "other"] as const).map((s, idx) => {
            const isActive = hotOther === s;
            const neon = s === "hot" ? "var(--neon-pink)" : "var(--neon-cyan)";
            return (
              <button
                key={s}
                onClick={() => { setHotOther(s); setPage(1); }}
                className="relative flex-1 py-1.5 overflow-hidden text-center"
                style={{
                  background: isActive && isDark ? `color-mix(in srgb, ${neon} 8%, transparent)` : "transparent",
                  border: isDark
                    ? `1px solid ${isActive ? neon : "var(--bg-mute)"}`
                    : `1px solid ${isActive ? "var(--color-brand)" : "var(--color-border-default)"}`,
                  borderBottom: isActive
                    ? (isDark ? `2px solid ${neon}` : `2px solid var(--color-brand)`)
                    : `1px solid ${isDark ? "var(--bg-grid)" : "var(--color-border-default)"}`,
                  clipPath: idx === 0
                    ? "polygon(0 0, 100% 0, 92% 100%, 0 100%)"
                    : "polygon(8% 0, 100% 0, 100% 100%, 0 100%)",
                  color: isActive
                    ? (isDark ? neon : "var(--color-brand)")
                    : (isDark ? "var(--text-dim)" : "var(--color-text-muted)"),
                  fontFamily: "var(--font-display)",
                  fontSize: "12px",
                  letterSpacing: "0.12em",
                  fontWeight: 700,
                  transition: "all 150ms ease-out",
                  textShadow: isActive && isDark ? `0 0 8px ${neon}` : "none",
                  cursor: "pointer",
                }}
              >
                {s.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Right half: 未達標 toggle + sort dropdown */}
        <div className="flex w-1/2 items-center gap-2">
          <button
            onClick={() => { setUnderperforming((v) => !v); setPage(1); }}
            className="whitespace-nowrap px-2.5 py-1 text-xs rounded font-medium border transition-colors shrink-0"
            style={underperforming
              ? { background: "var(--neon-pink)", color: "#fff", borderColor: "transparent", boxShadow: "0 0 8px var(--neon-pink)" }
              : { borderColor: "var(--color-border-default)", color: "var(--color-text-muted)" }}
          >
            未達標
          </button>
          <Select value={sortKey} onValueChange={(v) => { setSortKey(v as SortKey); setPage(1); }}>
            <SelectTrigger className="h-7 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="home_skill">家機 Skill ↓</SelectItem>
              <SelectItem value="arcade_skill">街機 Skill ↓</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Gradient separator matching current HOT/OTHER color */}
      <div
        style={{
          height: "2px",
          background: `linear-gradient(to right, ${sectionNeon} 0%, transparent 70%)`,
          transition: "background 200ms ease-out",
          marginBottom: "4px",
        }}
      />

      {/* Song list */}
      {filtered.length === 0 ? (
        <p className="px-4 py-8 text-sm text-center" style={{ color: "var(--color-text-muted)" }}>
          無符合條件的歌曲
        </p>
      ) : (
        <div className="px-3">
          {paginated.map((item, i) => {
            const imageName = coverMap.get(item.歌曲名稱);
            const songWithCover: SongData = imageName && !item.歌曲封面
              ? { ...item, 歌曲封面: `${ZETARAKU_COVER_BASE}/${imageName}` }
              : item;
            const instrPart = item.樂器類型 === "bass" ? "B" : item.樂器類型 === "drums" ? "D" : "G";
            const overlayKey = `${item.歌曲名稱.trim()}|${item.譜面等級.trim().toUpperCase()}|${instrPart}`;
            const overlayAvg = kasegiMap.get(overlayKey);
            const hideSource = sortKey === "home_skill" ? "arcade" as const
              : sortKey === "arcade_skill" ? "home" as const
              : undefined;
            return (
              <SongCard
                key={`${item.歌曲名稱}-${item.樂器類型}-${item.譜面等級}`}
                song={songWithCover}
                mode={mode}
                rank={(page - 1) * PAGE_SIZE + i + 1}
                onEdit={setEditSong}
                kasegiOverlay={overlayAvg != null ? { averageSkill: overlayAvg } : null}
                hideSource={hideSource}
              />
            );
          })}
        </div>
      )}

      <SongListPagination currentPage={page} totalPages={totalPages} onPageChange={goToPage} />

      <EditSheet
        song={editSong}
        mode={mode}
        availableTags={[]}
        onClose={() => setEditSong(null)}
        onSaved={() => setEditSong(null)}
      />
    </div>
  );
}

export default function Dashboard() {
  const { tab = "gf" } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [scope, setScope] = useState<ScopeTier>(
    (Number(localStorage.getItem("dashboard_scope")) || 7000) as ScopeTier
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const imported = params.get("imported");
    const failed = params.get("failed");
    if (imported !== null) {
      const count = parseInt(imported, 10);
      const failCount = parseInt(failed ?? "0", 10);
      toast({
        title: failCount > 0 ? `匯入完成（部分失敗）` : "成績匯入成功 ✓",
        description: failCount > 0
          ? `${count} 首更新，${failCount} 首失敗`
          : `${count} 首成績已同步`,
      });
      navigate(location.pathname, { replace: true });
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const gameType = tab === "dm" ? "DM" : "GF";

  return (
    <div style={{ color: "var(--color-text-primary)" }}>
      {/* Page Header */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: isDark ? "var(--bg-grid)" : "var(--color-border-default)" }}
      >
        <div className="flex items-center justify-between">
          <h1
            className="font-display font-bold uppercase"
            style={{
              fontSize: "20px",
              letterSpacing: "0.2em",
              color: isDark ? "var(--neon-pink)" : "var(--color-brand)",
              textShadow: isDark
                ? "0 0 10px var(--neon-pink), 0 0 24px color-mix(in srgb, var(--neon-pink) 50%, transparent)"
                : "none",
            }}
          >
            成績
          </h1>
          <Select
            value={String(scope)}
            onValueChange={(v) => {
              const t = Number(v) as ScopeTier;
              setScope(t);
              localStorage.setItem("dashboard_scope", v);
            }}
          >
            <SelectTrigger className="h-7 text-xs w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCOPE_TIERS.map((tier) => (
                <SelectItem key={tier} value={String(tier)}>{tier}~</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* GF / DM tabs — sticky, PianFen skewed style */}
      <div
        className="sticky top-0 z-10 flex"
        style={{
          background: isDark ? "#0A051A" : "var(--color-bg-elevated)",
          borderBottom: `1px solid ${isDark ? "var(--bg-grid)" : "var(--color-border-default)"}`,
        }}
      >
        {(["gf", "dm"] as const).map((inst, idx) => {
          const isActive = gameType.toLowerCase() === inst;
          const neonColor = inst === "gf" ? "var(--neon-pink)" : "var(--neon-cyan)";
          return (
            <button
              key={inst}
              onClick={() => navigate(`/dashboard/${inst}`)}
              className="relative flex-1 py-3 overflow-hidden"
              style={{
                background: isActive && isDark ? `color-mix(in srgb, ${neonColor} 8%, transparent)` : "transparent",
                border: isDark
                  ? `1px solid ${isActive ? neonColor : "var(--bg-mute)"}`
                  : `1px solid ${isActive ? "var(--color-brand)" : "var(--color-border-default)"}`,
                borderBottom: isActive
                  ? (isDark ? `2px solid ${neonColor}` : `2px solid var(--color-brand)`)
                  : `1px solid ${isDark ? "var(--bg-grid)" : "var(--color-border-default)"}`,
                clipPath: idx === 0
                  ? "polygon(0 0, 100% 0, 92% 100%, 0 100%)"
                  : "polygon(8% 0, 100% 0, 100% 100%, 0 100%)",
                color: isActive
                  ? (isDark ? neonColor : "var(--color-brand)")
                  : (isDark ? "var(--text-dim)" : "var(--color-text-muted)"),
                fontFamily: "var(--font-display)",
                fontSize: "13px",
                letterSpacing: "0.15em",
                transition: "all 150ms ease-out",
                textShadow: isActive && isDark ? `0 0 8px ${neonColor}` : "none",
                cursor: "pointer",
              }}
            >
              {inst.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Unified song + score list */}
      <ScoreList gameType={gameType as GameType} isDark={isDark} scope={scope} />
      <ScrollToTopButton />
    </div>
  );
}
