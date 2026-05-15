import { Search, Sun, Moon, Flame, LayoutGrid, SlidersHorizontal, Heart, X, RotateCw } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

interface StickyHeaderProps {
  search: string;
  onSearchChange: (v: string) => void;
  hotFilter: string;
  onHotFilterChange: (v: string) => void;
  onOpenAdvanced: () => void;
  hasAdvancedFilters: boolean;
  songCount?: number;
  favOnly: boolean;
  onFavOnlyChange: (v: boolean) => void;
  onRefresh?: () => void;
  sortLabel?: string;
  isRefreshing?: boolean;
  skillUpMode: boolean;
  onSkillUpModeChange: (v: boolean) => void;
  skillUpLabel: string;
}

const HOT_OPTIONS = [
  { value: "ALL", label: "ALL", icon: LayoutGrid },
  { value: "HOT", label: "HOT", icon: Flame },
  { value: "Other", label: "Other", icon: null },
] as const;

export default function StickyHeader({ search, onSearchChange, hotFilter, onHotFilterChange, onOpenAdvanced, hasAdvancedFilters, songCount, favOnly, onFavOnlyChange, onRefresh, isRefreshing, skillUpMode, onSkillUpModeChange, skillUpLabel, sortLabel }: StickyHeaderProps) {
  const { theme, toggle } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md px-4 pb-2 space-y-2" style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}>
      <div className="flex items-center gap-2">
        <h1 className="font-display text-lg font-bold tracking-wider text-primary shrink-0">
          SIZ
        </h1>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="搜尋歌曲..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-input rounded pl-9 pr-8 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors"
              aria-label="清除搜尋"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          )}
        </div>
        <button
          onClick={() => onFavOnlyChange(!favOnly)}
          className={`p-2 rounded transition-colors shrink-0 ${favOnly ? "bg-destructive/15" : "hover:bg-muted"}`}
          aria-label="只顯示最愛"
        >
          <Heart size={18} className={favOnly ? "text-destructive fill-destructive" : "text-muted-foreground"} />
        </button>
        <button onClick={onOpenAdvanced} className="relative p-2 rounded hover:bg-muted transition-colors shrink-0" aria-label="進階篩選">
          <SlidersHorizontal size={18} className="text-muted-foreground" />
          {hasAdvancedFilters && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
          )}
        </button>
        <button onClick={toggle} className="p-2 rounded hover:bg-muted transition-colors shrink-0" aria-label="切換主題">
          {theme === "dark" ? <Sun size={18} className="text-muted-foreground" /> : <Moon size={18} className="text-muted-foreground" />}
        </button>
      </div>

      {/* HOT / Other Segmented Control */}
      <div className="flex bg-input rounded p-0.5 gap-0.5 mb-2">
        {HOT_OPTIONS.map((opt) => {
          const active = hotFilter === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => onHotFilterChange(opt.value)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-display font-semibold tracking-wide transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {Icon && <Icon size={13} className={active ? "text-primary-foreground" : ""} />}
              {opt.label}
            </button>
          );
        })}
      </div>

      {songCount !== undefined && (
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {onRefresh && (
              <button onClick={onRefresh} disabled={isRefreshing} className="p-1 rounded hover:bg-muted transition-colors disabled:opacity-50" aria-label="重新整理">
                <RotateCw size={13} className={`text-muted-foreground ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            )}
            <p className="text-xs font-body text-muted-foreground truncate whitespace-nowrap">
              共 {songCount} 首歌曲{sortLabel ? ` ｜ ${sortLabel}` : ""}
            </p>
          </div>
          {skillUpLabel && (
            <button
              onClick={() => onSkillUpModeChange(!skillUpMode)}
              className={`relative z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-display font-bold tracking-wide transition-all ${
                skillUpMode
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "bg-muted text-muted-foreground border border-transparent hover:bg-muted/80"
              }`}
            >
              <span className={`w-2 h-2 rounded-full transition-colors ${skillUpMode ? "bg-primary" : "bg-muted-foreground/40"}`} />
              {skillUpLabel}賺分
            </button>
          )}
        </div>
      )}
    </header>
  );
}
