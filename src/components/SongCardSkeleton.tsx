export default function SongCardSkeleton() {
  return (
    <div
      className="flex items-start gap-2 px-3 py-3 rounded-md"
      style={{
        background: "color-mix(in srgb, #1E1530 85%, var(--bg-card, hsl(var(--card))))",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Cover — 40×40 */}
      <div
        className="w-10 h-10 shrink-0 rounded animate-pulse"
        style={{ background: "rgba(255,255,255,0.08)" }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="h-3 w-2/5 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="h-[6px] w-full rounded-full mt-2 animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="h-[6px] w-full rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>
    </div>
  );
}
