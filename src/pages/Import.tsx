import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { fetchGsvSkillScores, mapDiff, mapPart } from "@/hooks/useGsvImport";

function useKasegiSyncDate() {
  return useQuery({
    queryKey: ["kasegi-sync-date"],
    queryFn: async () => {
      const { data } = await supabase
        .from("kasegi_records")
        .select("synced_at")
        .order("synced_at", { ascending: false })
        .limit(1)
        .single();
      return data?.synced_at ?? null;
    },
  });
}

function useArcadeImportHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ["import-history", userId, "arcade"],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("scores")
        .select("imported_at")
        .eq("user_id", userId!)
        .eq("source", "arcade")
        .order("imported_at", { ascending: false })
        .limit(1);
      const count = await supabase
        .from("scores")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId!)
        .eq("source", "arcade");
      return {
        lastImport: data?.[0]?.imported_at ?? null,
        total: count.count ?? 0,
      };
    },
  });
}

export default function Import() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const { data: arcadeHistory } = useArcadeImportHistory(user?.id);
  const { data: kasegiSyncDate } = useKasegiSyncDate();
  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  const [gsvSkillId, setGsvSkillId] = useState<string>("");
  const [gsvImporting, setGsvImporting] = useState(false);
  const [gsvResult, setGsvResult] = useState<{ success: number; failed: number } | null>(null);

  async function handleGsvImport() {
    if (!user || !gsvSkillId.trim()) return;
    setGsvImporting(true);
    setGsvResult(null);
    let success = 0;
    let failed = 0;

    // Map gsv.fun part → Zetaraku instrument suffix
    function getZetarakuId(name: string, part: string): string {
      const p = part.toUpperCase();
      if (p === "D") return `${name}_drum`;
      if (p === "B") return `${name}_bass`;
      return `${name}_guitar`;
    }

    // Instrument-qualified fallback key for songs not in Zetaraku catalogue
    function getGsvFallbackId(name: string, part: string): string {
      const p = part.toUpperCase();
      if (p === "D" || p.includes("DRUM")) return `gsv_${name}_drum`;
      if (p === "B" || p.includes("BASS")) return `gsv_${name}_bass`;
      return `gsv_${name}_guitar`;
    }

    try {
      // Step 1: fetch gsv.fun records
      const records = await fetchGsvSkillScores(parseInt(gsvSkillId, 10));
      const now = new Date().toISOString();

      // Step 2: find existing songs — try Zetaraku IDs first, then gsv_ fallback
      const zetarakuCandidates = [...new Set(records.map(r => getZetarakuId(r.name, r.part)))];
      const gsvCandidates = [...new Set(records.map(r => getGsvFallbackId(r.name, r.part)))];
      const { data: existingSongs } = await supabase
        .from("songs")
        .select("id, konami_song_id")
        .in("konami_song_id", [...zetarakuCandidates, ...gsvCandidates]);

      const idLookup = new Map<string, number>(
        existingSongs?.map(s => [s.konami_song_id, s.id]) ?? []
      );

      // songMap keyed by "name|part" → preferred song_id (Zetaraku > gsv_)
      const songMap = new Map<string, number>();
      for (const r of records) {
        const preferred = idLookup.get(getZetarakuId(r.name, r.part)) ?? idLookup.get(getGsvFallbackId(r.name, r.part));
        if (preferred) songMap.set(`${r.name}|${r.part}`, preferred);
      }

      // Step 3: insert missing songs using Zetaraku-format ID (so future sync can match)
      const needsNewSong = records.filter(r => !songMap.has(`${r.name}|${r.part}`));
      const missingSongs = Array.from(
        new Map(
          needsNewSong.map(r => {
            const { game_type } = mapPart(r.part);
            const zetarakuId = getZetarakuId(r.name, r.part);
            return [zetarakuId, { konami_song_id: zetarakuId, title: r.name, game_type, artist: "", category: r.category }] as const;
          })
        ).values()
      );
      if (missingSongs.length > 0) {
        const { data: newSongs } = await supabase
          .from("songs").insert(missingSongs).select("id, konami_song_id");
        for (const s of newSongs ?? []) {
          idLookup.set(s.konami_song_id, s.id);
          for (const r of needsNewSong.filter(r => getZetarakuId(r.name, r.part) === s.konami_song_id)) {
            songMap.set(`${r.name}|${r.part}`, s.id);
          }
        }
      }

      // Step 3b: update category for all songs in this import
      const hotIds: number[] = [];
      const otherIds: number[] = [];
      const seen = new Set<number>();
      for (const r of records) {
        const id = songMap.get(`${r.name}|${r.part}`);
        if (id && !seen.has(id)) {
          seen.add(id);
          (r.category === "HOT" ? hotIds : otherIds).push(id);
        }
      }
      if (hotIds.length > 0) await supabase.from("songs").update({ category: "HOT" }).in("id", hotIds);
      if (otherIds.length > 0) await supabase.from("songs").update({ category: "Other" }).in("id", otherIds);

      // Step 3c: re-link existing gsv_ scores → Zetaraku song_id to eliminate duplicates
      const gsvToZetaraku = new Map<number, number>();
      for (const r of records) {
        const zetarakuSongId = idLookup.get(getZetarakuId(r.name, r.part));
        const gsvSongId = idLookup.get(getGsvFallbackId(r.name, r.part));
        if (zetarakuSongId && gsvSongId && zetarakuSongId !== gsvSongId) {
          gsvToZetaraku.set(gsvSongId, zetarakuSongId);
        }
      }
      if (gsvToZetaraku.size > 0) {
        await Promise.all(
          Array.from(gsvToZetaraku.entries()).map(([gsvId, zetarakuId]) =>
            supabase.from("scores")
              .update({ song_id: zetarakuId })
              .eq("user_id", user.id)
              .eq("song_id", gsvId)
          )
        );
      }

      // Step 4: bulk find existing scores for this user
      const { data: existingScores } = await supabase
        .from("scores")
        .select("id, song_id, game_type, difficulty")
        .eq("user_id", user.id);

      const scoreKey = (songId: number, gt: string, diff: string) => `${songId}|${gt}|${diff}`;
      const existingScoreMap = new Map<string, number>(
        existingScores?.map(s => [scoreKey(s.song_id, s.game_type, s.difficulty), s.id]) ?? []
      );

      // Step 5: partition into inserts vs updates
      const toInsert: object[] = [];
      const toUpdate: { id: number; achievement_rate: number; skill_point: number; level_value: number | null; imported_at: string }[] = [];

      for (const record of records) {
        const { game_type } = mapPart(record.part);
        const difficulty = mapDiff(record.diff);
        const songId = songMap.get(`${record.name}|${record.part}`);
        if (!songId) { failed++; continue; }

        const achievementRate = parseFloat(record.achive_value.replace("%", "")) || 0;
        const existingId = existingScoreMap.get(scoreKey(songId, game_type, difficulty));

        if (existingId) {
          toUpdate.push({ id: existingId, achievement_rate: achievementRate, skill_point: record.skill_value, level_value: record.diff_value > 0 ? record.diff_value : null, imported_at: now });
        } else {
          toInsert.push({
            user_id: user.id, song_id: songId, game_type, difficulty,
            achievement_rate: achievementRate, skill_point: record.skill_value,
            play_count: 0, best_grade: null, is_excellent: false, is_full_combo: false,
            source: "arcade", level_value: record.diff_value > 0 ? record.diff_value : null, imported_at: now,
          });
        }
      }

      // Step 6: bulk insert new scores
      if (toInsert.length > 0) {
        const { error } = await supabase.from("scores").insert(toInsert);
        if (error) failed += toInsert.length; else success += toInsert.length;
      }

      // Step 7: update existing scores
      for (const s of toUpdate) {
        const { error } = await supabase.from("scores")
          .update({ achievement_rate: s.achievement_rate, skill_point: s.skill_point, level_value: s.level_value, imported_at: s.imported_at, source: "arcade" })
          .eq("id", s.id);
        if (error) failed++; else success++;
      }

    } catch (err) {
      toast({
        title: "匯入失敗",
        description: err instanceof Error ? err.message : "gsv.fun 連線失敗，請稍後再試",
        variant: "destructive",
      });
      setGsvImporting(false);
      return;
    }

    setGsvImporting(false);
    setGsvResult({ success, failed });
    queryClient.invalidateQueries({ queryKey: ["scores"] });
    queryClient.invalidateQueries({ queryKey: ["import-history"] });
    toast({
      title: failed > 0 ? "匯入完成（部分失敗）" : "成績匯入成功 ✓",
      description: failed > 0 ? `${success} 首更新，${failed} 首失敗` : `${success} 首成績已同步`,
    });
  }

  return (
    <div
      className="max-w-lg mx-auto px-4 py-8 space-y-6"
      style={{ color: "var(--color-text-primary)" }}
    >
      {/* Import history */}
      <div
        className="p-3 rounded-lg text-sm space-y-1"
        style={{ background: "var(--color-bg-secondary)" }}
      >
        <p style={{ color: "var(--color-text-secondary)" }}>
          最近街機匯入：
          {arcadeHistory?.lastImport
            ? `${format(new Date(arcadeHistory.lastImport), "MM/dd HH:mm", { locale: zhTW })} — ${arcadeHistory.total} 筆`
            : "尚未匯入"}
        </p>
        <p style={{ color: "var(--color-text-secondary)" }}>
          賺分曲資料：
          {kasegiSyncDate
            ? format(new Date(kasegiSyncDate), "yyyy/MM/dd")
            : "尚未同步"}
        </p>
      </div>

      {/* Admin sync block */}
      {isAdmin && (
        <div
          className="p-4 rounded-xl border space-y-3"
          style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-secondary)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            管理者：資料同步
          </h2>
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: "var(--color-text-secondary)" }}>
                同步 Zetaraku 歌曲
              </p>
              <code
                className="text-xs px-2 py-1 rounded block"
                style={{
                  background: "var(--color-bg-primary)",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                npm run sync:songs
              </code>
            </div>
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: "var(--color-text-secondary)" }}>
                同步賺分曲
              </p>
              <code
                className="text-xs px-2 py-1 rounded block"
                style={{
                  background: "var(--color-bg-primary)",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                npm run sync:kasegi
              </code>
            </div>
          </div>
        </div>
      )}

      {/* GSV.fun import section */}
      <div
        className="space-y-3 p-4 rounded-xl border"
        style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-secondary)" }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
          從 gsv.fun 直接匯入
        </h2>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          輸入 gsv.fun 玩家 ID（固定不變，例：gsv.fun/zh/galaxywave_delta/1935/g 或 /d 中的 1935）
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            placeholder="成績 ID，例：44355"
            value={gsvSkillId}
            onChange={(e) => setGsvSkillId(e.target.value.replace(/\D/g, ""))}
            className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none"
            style={{
              borderColor: "var(--color-border-default)",
              background: "var(--color-bg-primary)",
              color: "var(--color-text-primary)",
            }}
          />
          <button
            onClick={handleGsvImport}
            disabled={gsvSkillId.length === 0 || gsvImporting}
            className="px-4 py-2 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-40 flex items-center gap-1.5"
            style={{ background: "var(--color-brand)", color: "#fff" }}
          >
            {gsvImporting && (
              <span
                className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "rgba(255,255,255,0.5)", borderTopColor: "transparent" }}
              />
            )}
            {gsvImporting ? "匯入中…" : "匯入"}
          </button>
        </div>

        {/* Result feedback */}
        {gsvResult && (
          <div
            className="rounded-lg p-3 space-y-2"
            style={{
              background: gsvResult.failed === 0
                ? "color-mix(in srgb, #22C55E 12%, transparent)"
                : "color-mix(in srgb, #F59E0B 12%, transparent)",
              border: `1px solid ${gsvResult.failed === 0 ? "#22C55E" : "#F59E0B"}`,
            }}
          >
            <p className="text-xs font-semibold" style={{ color: gsvResult.failed === 0 ? "#22C55E" : "#F59E0B" }}>
              {gsvResult.failed === 0
                ? `✓ 匯入完成：${gsvResult.success} 首成績已同步`
                : `⚠ 部分失敗：${gsvResult.success} 首成功，${gsvResult.failed} 首失敗`}
            </p>
            <div className="flex gap-2">
              {gsvResult.success > 0 && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-xs px-3 py-1.5 rounded font-medium"
                  style={{ background: "var(--color-brand)", color: "#fff" }}
                >
                  查看成績 →
                </button>
              )}
              {gsvResult.failed > 0 && (
                <button
                  onClick={handleGsvImport}
                  className="text-xs px-3 py-1.5 rounded font-medium"
                  style={{ border: "1px solid var(--color-border-default)", color: "var(--color-text-secondary)" }}
                >
                  重試
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
