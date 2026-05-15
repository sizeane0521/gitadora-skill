import { useQuery } from "@tanstack/react-query";

interface ZetarakuSong {
  songId: string;
  title: string;
  imageName: string | null;
}

const ZETARAKU_DATA_URL = "https://dp4p6x0xfi5o9.cloudfront.net/gitadora/data.json";

async function fetchZetarakuSongs(): Promise<Map<string, string>> {
  try {
    const res = await fetch(ZETARAKU_DATA_URL);
    if (!res.ok) return new Map();
    const json = await res.json();
    // Zetaraku returns { songs: [...], categories: [...], ... }
    const songs: ZetarakuSong[] = Array.isArray(json) ? json : (json.songs ?? []);
    const map = new Map<string, string>();
    for (const song of songs) {
      if (song.title && song.imageName) {
        map.set(song.title, song.imageName);
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

export function useZetarakuSongs(): Map<string, string> {
  const { data } = useQuery({
    queryKey: ["zetaraku-songs"],
    queryFn: fetchZetarakuSongs,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  return data ?? new Map();
}
