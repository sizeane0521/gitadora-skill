import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSongs, coverUrl } from "@/hooks/useSongs";
import SongCoverImage from "@/components/SongCoverImage";
import type { GameType } from "@/types/database";
import { cn } from "@/lib/utils";

interface SongsBrowseViewProps {
  className?: string;
}

export default function SongsBrowseView({ className }: SongsBrowseViewProps) {
  const [gameType, setGameType] = useState<GameType>("GF");
  const [search, setSearch] = useState("");
  const [showTop, setShowTop] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useSongs({ gameType, search });

  const songs = data?.pages.flatMap((p) => p) ?? [];

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={cn(className)} style={{ color: "var(--color-text-primary)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 space-y-2 border-b"
        style={{
          background: "var(--color-bg-elevated)",
          borderColor: "var(--color-border-default)",
        }}
      >
        <div className="flex gap-2">
          {(["GF", "DM"] as GameType[]).map((g) => (
            <button
              key={g}
              onClick={() => setGameType(g)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded border transition-colors cursor-pointer",
                gameType === g
                  ? "text-white border-transparent"
                  : "border-[var(--color-border-default)] text-[var(--color-text-muted)]"
              )}
              style={gameType === g ? { background: "var(--color-brand)" } : {}}
            >
              {g}
            </button>
          ))}
        </div>
        <Input
          placeholder="搜尋歌曲名稱"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--color-brand)" }}
          />
        </div>
      )}

      {songs.map((song) => (
        <Link
          key={song.id}
          to={`/songs/${song.id}`}
          className="flex items-center gap-3 px-4 py-3 border-b hover:opacity-80"
          style={{ borderColor: "var(--color-border-default)" }}
        >
          <SongCoverImage
            src={coverUrl(song)}
            alt={song.title}
            className="w-12 h-12 rounded shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
              {song.title}
            </p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {song.version ?? ""}
            </p>
          </div>
        </Link>
      ))}

      {!isLoading && songs.length === 0 && (
        <p className="text-center py-16 text-sm" style={{ color: "var(--color-text-muted)" }}>
          找不到歌曲
        </p>
      )}

      <div ref={sentinelRef} className="h-1" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <div
            className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--color-brand)" }}
          />
        </div>
      )}

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-4 z-50 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-opacity cursor-pointer"
          style={{ background: "var(--color-brand)" }}
          aria-label="回到頂部"
        >
          <ChevronUp className="text-white" size={20} />
        </button>
      )}
    </div>
  );
}
