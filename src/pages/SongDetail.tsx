import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useScores } from "@/hooks/useScores";

export default function SongDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const songId = id ? Number(id) : undefined;

  const { data: allScores, isLoading } = useScores({ userId: user?.id });

  const songScores = allScores?.filter((s) => s._songId === songId) ?? [];
  const song = songScores[0];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--color-brand)" }}
        />
      </div>
    );
  }

  if (!song) {
    return (
      <div className="flex justify-center py-16">
        <p style={{ color: "var(--color-text-muted)" }}>找不到此歌曲的成績</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4" style={{ color: "var(--color-text-primary)" }}>
      <div className="flex items-center gap-4">
        {song.歌曲封面 && (
          <img src={song.歌曲封面} alt="" className="w-16 h-16 rounded-lg object-cover" />
        )}
        <div>
          <h1 className="text-xl font-bold">{song.歌曲名稱}</h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{song.收錄版本}</p>
        </div>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--color-border-default)" }}
      >
        {songScores.map((s, i) => (
          <div
            key={`${s._scoreId ?? i}`}
            className="flex items-center gap-3 px-4 py-3 border-b last:border-0"
            style={{ borderColor: "var(--color-border-default)" }}
          >
            <span
              className="w-10 text-xs font-semibold"
              style={{ color: "var(--color-brand)" }}
            >
              {s.譜面等級}
            </span>
            <span className="text-xs shrink-0" style={{ color: "var(--color-text-muted)" }}>
              {s._source === "konaste" ? "🏠" : "🕹"}
            </span>
            <span className="flex-1 text-sm tabular-nums" style={{ color: "var(--color-text-secondary)" }}>
              {s._source === "konaste"
                ? `${s["家用版最佳達成率 (%)"]}%`
                : `${s["街機版最佳達成率 (%)"]}%`}
            </span>
            <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--skill-gold-dark)" }}>
              {Number(s["家用版 Skill 點數"] || s["街機版 Skill 點數"]).toFixed(1)}
            </span>
            {s._isExcellent && (
              <span className="text-xs font-bold px-1 rounded" style={{ background: "var(--exc-pink-bg)", color: "var(--exc-pink)" }}>
                EXC
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
