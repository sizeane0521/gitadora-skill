import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { GameType, SongRow } from "@/types/database";

const PAGE_SIZE = 50;
const ZETARAKU_COVER_BASE = "https://dp4p6x0xfi5o9.cloudfront.net/gitadora/img/cover";

export function coverUrl(song: Pick<SongRow, "image_name" | "cover_url">): string {
  if (song.image_name) return `${ZETARAKU_COVER_BASE}/${song.image_name}`;
  return song.cover_url ?? "";
}

export interface UseSongsOptions {
  gameType?: GameType;
  search?: string;
}

export function useSongs({ gameType, search }: UseSongsOptions = {}) {
  return useInfiniteQuery({
    queryKey: ["songs", gameType, search],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const from = (pageParam as number) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // instrument filter 取代 client-side dedup：GF → guitar, DM → drums
      const instrument = gameType === "DM" ? "drums" : "guitar";

      let query = supabase
        .from("songs")
        .select("id, title, game_type, instrument, image_name, cover_url, level_bsc, level_adv, level_ext, level_mas, version, reading, category, tags")
        .eq("instrument", instrument)
        .order("title", { ascending: true })
        .range(from, to);

      if (search) query = query.ilike("title", `%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as SongRow[];
    },
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      // 若回傳筆數等於 PAGE_SIZE，表示還有下一頁
      if (lastPage.length === PAGE_SIZE) return (lastPageParam as number) + 1;
      return undefined;
    },
  });
}
