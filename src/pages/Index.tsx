import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { GameMode, SongData, WishlistItem } from "@/types/song";
import { fetchSongs, toggleFavorite } from "@/lib/api";
import { recognizeImage, RecognitionResult } from "@/lib/recognize";
import StickyHeader from "@/components/StickyHeader";
import BottomNav from "@/components/BottomNav";
import SongCard from "@/components/SongCard";
import SongCardSkeleton from "@/components/SongCardSkeleton";
import EditSheet from "@/components/EditSheet";
import FabCamera from "@/components/FabCamera";
import RecognitionLoadingOverlay from "@/components/RecognitionLoadingOverlay";
import RecognitionEditSheet from "@/components/RecognitionEditSheet";
import AdvancedFilterSheet, { AdvancedFilters, DIFF_RANGES, SKILL_THRESHOLDS } from "@/components/AdvancedFilterSheet";
import { Loader2 } from "lucide-react";
import SongListPagination from "@/components/SongListPagination";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { useQueryClient } from "@tanstack/react-query";
import { SkillUpInfo } from "@/components/SongCard";

const PAGE_SIZE = 15;

export default function Index() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<GameMode>("GF");
  const [search, setSearch] = useState("");
  const [hotFilter, setHotFilter] = useState("ALL");
  const [favOnly, setFavOnly] = useState(false);
  const [editSong, setEditSong] = useState<SongData | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [recognitionSource, setRecognitionSource] = useState<"arcade" | "console">("arcade");
  const [currentPage, setCurrentPage] = useState(1);
  const [skillUpMode, setSkillUpMode] = useState(false);
  const prevHotFilterRef = useRef(hotFilter);

  const handleSkillUpToggle = useCallback((on: boolean) => {
    if (on) {
      prevHotFilterRef.current = hotFilter;
      setHotFilter("Other");
    } else {
      setHotFilter(prevHotFilterRef.current);
    }
    setSkillUpMode(on);
  }, [hotFilter]);

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({ levels: [], diffRanges: [], unplayedHome: false, unplayedArcade: false, tags: [], skillRange: null, category: "", sortBy: "homeSkillDesc" });

  const hasAdvancedFilters = advancedFilters.diffRanges.length > 0 || advancedFilters.unplayedHome || advancedFilters.unplayedArcade || advancedFilters.tags.length > 0 || advancedFilters.skillRange !== null || advancedFilters.category !== "";

  // Fetch ALL songs once
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["songs", mode],
    queryFn: () => fetchSongs(mode),
    staleTime: 0,
  });

  const songs = data?.songs ?? [];
  const apiTags = data?.tags ?? [];
  const rawWishlist = data?.wishlist ?? [];


  // Dynamic tier label from wishlist data
  const defaultTier = useMemo(() => {
    const tierSet = new Set<string>();
    rawWishlist.forEach((item) => {
      if (item.targetTier) tierSet.add(item.targetTier);
    });
    const tiers = Array.from(tierSet).sort((a, b) => Number(a) - Number(b));
    return tiers[0] || "";
  }, [rawWishlist]);

  const wishlistMap = useMemo(() => {
    const map = new Map<string, WishlistItem>();
    rawWishlist.forEach((item) => {
      const key = `${item.songName}|${item.instrument.toUpperCase()}|${item.difficulty.toUpperCase()}`;
      map.set(key, item);
    });
    return map;
  }, [rawWishlist]);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>(apiTags);
    songs.forEach((s) => {
      if (s.標籤) s.標籤.split(",").map((t) => t.trim()).filter(Boolean).forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [songs, apiTags]);

  const availableCategories = useMemo(() => {
    const catSet = new Set<string>();
    songs.forEach((s) => {
      if (s["歌名發音/分類"]) catSet.add(s["歌名發音/分類"]);
    });
    return Array.from(catSet).sort();
  }, [songs]);

  const [manualRefreshing, setManualRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    await refetch();
    toast.success("已重新整理");
  }, [refetch]);

  const handleManualRefresh = useCallback(async () => {
    setManualRefreshing(true);
    await handleRefresh();
    setManualRefreshing(false);
  }, [handleRefresh]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") refetch();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [refetch]);

  const { pulling, pullDistance, refreshing, onTouchStart, onTouchMove, onTouchEnd, containerRef } =
    usePullToRefresh({ onRefresh: handleRefresh });

  // Build skill-up info map: per-version status for all wishlist songs
  const skillUpMap = useMemo(() => {
    if (!skillUpMode || !defaultTier) return null;
    const map = new Map<string, SkillUpInfo>();
    rawWishlist.filter((w) => w.targetTier === defaultTier).forEach((w) => {
      const key = `${w.songName}|${w.instrument.toUpperCase()}|${w.difficulty.toUpperCase()}`;
      const record = songs.find((s) => `${s.歌曲名稱}|${s.樂器類型.toUpperCase()}|${s.譜面等級.toUpperCase()}` === key);
      const home = record ? Number(record["家用版 Skill 點數"]) || 0 : 0;
      const arcade = record ? Number(record["街機版 Skill 點數"]) || 0 : 0;

      const calcStatus = (skill: number): { status: "not_played" | "below" | "reached"; gap: number; surplus: number } => {
        if (skill === 0) return { status: "not_played", gap: w.avgSkill, surplus: 0 };
        if (skill >= w.avgSkill) return { status: "reached", gap: 0, surplus: Math.round((skill - w.avgSkill) * 100) / 100 };
        return { status: "below", gap: Math.round((w.avgSkill - skill) * 100) / 100, surplus: 0 };
      };

      const homeCalc = calcStatus(home);
      const arcadeCalc = calcStatus(arcade);

      map.set(key, {
        avgSkill: w.avgSkill,
        homeSkill: home,
        arcadeSkill: arcade,
        homeGap: homeCalc.gap,
        arcadeGap: arcadeCalc.gap,
        homeSurplus: homeCalc.surplus,
        arcadeSurplus: arcadeCalc.surplus,
        homeStatus: homeCalc.status,
        arcadeStatus: arcadeCalc.status,
      });
    });
    return map;
  }, [skillUpMode, defaultTier, rawWishlist, songs]);

  // In skill-up mode: show ALL wishlist songs in sheet order, creating placeholders for missing ones
  const skillUpSongs = useMemo(() => {
    if (!skillUpMode || !defaultTier) return null;
    const songIndex = new Map<string, SongData>();
    songs.forEach((s) => {
      const key = `${s.歌曲名稱}|${s.樂器類型.toUpperCase()}|${s.譜面等級.toUpperCase()}`;
      if (!songIndex.has(key)) songIndex.set(key, s);
    });

    // Normalize API category ("HOT"/"OTHER") to match app convention ("HOT"/"Other")
    const normalizeCat = (cat?: string) => {
      if (!cat) return "";
      const upper = cat.toUpperCase();
      if (upper === "HOT") return "HOT";
      if (upper === "OTHER") return "Other";
      return cat;
    };

    return rawWishlist
      .filter((w) => w.targetTier === defaultTier)
      .map((w) => {
        const key = `${w.songName}|${w.instrument.toUpperCase()}|${w.difficulty.toUpperCase()}`;
        const existing = songIndex.get(key);
        const wishlistCat = normalizeCat(w.category || w.hotCategory);
        if (existing) {
          // Override category to match wishlist classification for correct tab filtering
          return existing.新舊分類 === wishlistCat ? existing : { ...existing, 新舊分類: wishlistCat };
        }
        // Create placeholder SongData for songs not in user's records
        return {
          歌曲封面: "",
          歌曲名稱: w.songName,
          樂器類型: w.instrument,
          譜面等級: w.difficulty,
          難度數值: w.level || 0,
          收錄版本: "",
          "歌名發音/分類": w.yomiCategory || "",
          "家用版最佳達成率 (%)": 0,
          "家用版 Skill 點數": 0,
          "街機版最佳達成率 (%)": 0,
          "街機版 Skill 點數": 0,
          標籤: "",
          備註: "",
          新舊分類: normalizeCat(w.category || w.hotCategory),
        } as SongData;
      });
  }, [skillUpMode, defaultTier, rawWishlist, songs]);

  // Client-side filtering + sorting
  const filtered = useMemo(() => {
    // In skill-up mode: filter by hotFilter (default Other), keep sheet order
    if (skillUpMode && skillUpSongs) {
      if (hotFilter === "ALL") return skillUpSongs;
      return skillUpSongs.filter((s) => s.新舊分類 === hotFilter);
    }

    const result = songs.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch = s.歌曲名稱.toLowerCase().includes(q) || (s.備註 && s.備註.toLowerCase().includes(q));
      const matchHot = hotFilter === "ALL" || s.新舊分類 === hotFilter;
      const matchFav = !favOnly || s.isFavorite === "TRUE" || s.isFavorite === true;

      const homeScore = Number(s["家用版最佳達成率 (%)"]) || 0;
      const arcadeScore = Number(s["街機版最佳達成率 (%)"]) || 0;
      const matchUnplayed = (!advancedFilters.unplayedHome || homeScore === 0) && (!advancedFilters.unplayedArcade || arcadeScore === 0);

      const homeSkill = Number(s["家用版 Skill 點數"]) || 0;
      const matchSkill = advancedFilters.skillRange === null || (
        homeSkill >= SKILL_THRESHOLDS[advancedFilters.skillRange].min &&
        homeSkill <= SKILL_THRESHOLDS[advancedFilters.skillRange].max
      );

      const matchCategory = !advancedFilters.category || s["歌名發音/分類"] === advancedFilters.category;

      const matchRange =
        advancedFilters.diffRanges.length === 0 ||
        advancedFilters.diffRanges.some((i) => {
          const r = DIFF_RANGES[i];
          return s.難度數值 >= r.min && s.難度數值 <= r.max;
        });

      const songTags = s.標籤 ? s.標籤.split(",").map((t) => t.trim()).filter(Boolean) : [];
      const matchTags = advancedFilters.tags.length === 0 || advancedFilters.tags.some((t) => songTags.includes(t));

      return matchSearch && matchHot && matchFav && matchUnplayed && matchSkill && matchCategory && matchRange && matchTags;
    });

    const sortKey = advancedFilters.sortBy;
    result.sort((a, b) => {
      let va = 0, vb = 0;
      if (sortKey === "homeSkillDesc" || sortKey === "homeSkillAsc") {
        va = Number(a["家用版 Skill 點數"]) || 0;
        vb = Number(b["家用版 Skill 點數"]) || 0;
      } else if (sortKey === "arcadeSkillDesc" || sortKey === "arcadeSkillAsc") {
        va = Number(a["街機版 Skill 點數"]) || 0;
        vb = Number(b["街機版 Skill 點數"]) || 0;
      } else if (sortKey === "difficultyDesc" || sortKey === "difficultyAsc") {
        va = a.難度數值;
        vb = b.難度數值;
      }
      const isAsc = sortKey.endsWith("Asc");
      return isAsc ? va - vb : vb - va;
    });

    return result;
  }, [songs, search, hotFilter, favOnly, advancedFilters, skillUpMode, skillUpSongs]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, hotFilter, favOnly, mode, advancedFilters, skillUpMode]);

  // Client-side pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [currentPage]);

  const handleToggleFavorite = useCallback(async (song: SongData, newState: boolean) => {
    queryClient.setQueryData(["songs", mode], (old: { songs: SongData[]; tags: string[]; wishlist: WishlistItem[] } | undefined) => {
      if (!old) return old;
      return {
        ...old,
        songs: old.songs.map((s) =>
          s.歌曲名稱 === song.歌曲名稱 && s.樂器類型 === song.樂器類型 && s.譜面等級 === song.譜面等級
            ? { ...s, isFavorite: newState ? "TRUE" : "" }
            : s
        ),
      };
    });

    const result = await toggleFavorite(mode, song.歌曲名稱, song.樂器類型, song.譜面等級, newState);
    if (!result.ok) {
      toast.error("更新最愛失敗");
      queryClient.setQueryData(["songs", mode], (old: { songs: SongData[]; tags: string[]; wishlist: WishlistItem[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          songs: old.songs.map((s) =>
            s.歌曲名稱 === song.歌曲名稱 && s.樂器類型 === song.樂器類型 && s.譜面等級 === song.譜面等級
              ? { ...s, isFavorite: newState ? "" : "TRUE" }
              : s
          ),
        };
      });
    }
  }, [mode, queryClient]);

  return (
    <div
      ref={containerRef}
      className="h-screen bg-background overflow-y-auto"
      style={{ touchAction: pulling ? "none" : "auto", overscrollBehavior: "none", paddingTop: "calc(env(safe-area-inset-top) + 9rem)", paddingBottom: "calc(env(safe-area-inset-bottom) + 4rem)" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div
        className="flex flex-col justify-center items-center overflow-hidden transition-all duration-200"
        style={{ height: pulling || refreshing ? pullDistance : 0 }}
      >
        <Loader2
          className={`text-primary transition-transform ${refreshing ? "animate-spin" : ""}`}
          size={28}
          style={{ opacity: Math.min(pullDistance / 60, 1), transform: `rotate(${pullDistance * 3}deg)` }}
        />
        <span
          className="text-sm font-body text-muted-foreground mt-1 transition-opacity font-medium"
          style={{ opacity: Math.min(pullDistance / 60, 1) }}
        >
          {refreshing ? "重新整理中..." : pullDistance >= 80 ? "✓ 放開以重新整理" : "↓ 下拉重新整理"}
        </span>
      </div>

      <StickyHeader
        search={search}
        onSearchChange={setSearch}
        hotFilter={hotFilter}
        onHotFilterChange={setHotFilter}
        onOpenAdvanced={() => setAdvancedOpen(true)}
        hasAdvancedFilters={hasAdvancedFilters}
        songCount={filtered.length}
        favOnly={favOnly}
        onFavOnlyChange={setFavOnly}
        onRefresh={handleManualRefresh}
        isRefreshing={manualRefreshing}
        skillUpMode={skillUpMode}
        onSkillUpModeChange={handleSkillUpToggle}
        skillUpLabel={defaultTier}
        sortLabel={(() => {
          const labels: Record<string, string> = { homeSkillDesc: "家機 Skill ↓", homeSkillAsc: "家機 Skill ↑", arcadeSkillDesc: "街機 Skill ↓", arcadeSkillAsc: "街機 Skill ↑", difficultyDesc: "難度 ↓", difficultyAsc: "難度 ↑" };
          return labels[advancedFilters.sortBy] || "";
        })()}
      />

      <main className="px-4 py-3">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <SongCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-20 font-body">
            找不到符合條件的歌曲
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {pageItems.map((song) => {
                const key = `${song.歌曲名稱}|${song.樂器類型.toUpperCase()}|${song.譜面等級.toUpperCase()}`;
                const suInfo = skillUpMap?.get(key) ?? null;
                return (
                  <SongCard
                    key={`${song.歌曲名稱}-${song.樂器類型}-${song.譜面等級}`}
                    song={song}
                    mode={mode}
                    onEdit={setEditSong}
                    wishlistMap={wishlistMap}
                    onToggleFavorite={handleToggleFavorite}
                    skillUpInfo={suInfo}
                  />
                );
              })}
            </div>

            {/* Pagination controls */}
            <SongListPagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
          </>
        )}
      </main>

      <FabCamera
        loading={recognizing}
        onFileSelect={async (file, source) => {
          setRecognitionSource(source);
          setRecognizing(true);
          try {
            const result = await recognizeImage(file);
            setRecognitionResult(result);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "辨識失敗，請稍後再試";
            toast.error(msg);
          } finally {
            setRecognizing(false);
          }
        }}
      />

      <BottomNav mode={mode} onModeChange={setMode} />

      <RecognitionLoadingOverlay visible={recognizing} />

      <RecognitionEditSheet
        result={recognitionResult}
        mode={mode}
        songs={songs}
        availableTags={availableTags}
        lockedSource={recognitionSource}
        onClose={() => setRecognitionResult(null)}
        onSaved={() => refetch()}
      />

      <EditSheet
        song={editSong}
        mode={mode}
        availableTags={availableTags}
        onClose={() => setEditSong(null)}
        onSaved={() => refetch()}
      />

      <AdvancedFilterSheet
        open={advancedOpen}
        onOpenChange={setAdvancedOpen}
        filters={advancedFilters}
        onApply={setAdvancedFilters}
        availableTags={availableTags}
        availableCategories={availableCategories}
      />
    </div>
  );
}
