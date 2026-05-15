import { X, RotateCcw, EyeOff, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";

const DIFF_RANGES = [
  { label: "~ 6.99", min: 0, max: 6.99 },
  { label: "7.00 - 7.49", min: 7.0, max: 7.49 },
  { label: "7.50 - 7.99", min: 7.5, max: 7.99 },
  { label: "8.00 - 8.49", min: 8.0, max: 8.49 },
  { label: "8.50 +", min: 8.5, max: 99 },
] as const;

const SKILL_THRESHOLDS = [
  { label: "< 120", min: 0, max: 119.99 },
  { label: "120 - 139", min: 120, max: 139.99 },
  { label: "≥ 140", min: 140, max: Infinity },
] as const;

export type SortByOption = "homeSkillDesc" | "homeSkillAsc" | "arcadeSkillDesc" | "arcadeSkillAsc" | "difficultyDesc" | "difficultyAsc";

export interface AdvancedFilters {
  levels: string[];
  diffRanges: number[];
  unplayedHome: boolean;
  unplayedArcade: boolean;
  tags: string[];
  skillRange: number | null;
  category: string;
  sortBy: SortByOption;
}

interface AdvancedFilterSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  filters: AdvancedFilters;
  onApply: (f: AdvancedFilters) => void;
  availableTags: string[];
  availableCategories: string[];
}

export { DIFF_RANGES, SKILL_THRESHOLDS };

const SORT_OPTIONS: { value: SortByOption; label: string }[] = [
  { value: "homeSkillDesc", label: "家機 Skill ↓" },
  { value: "homeSkillAsc", label: "家機 Skill ↑" },
  { value: "arcadeSkillDesc", label: "街機 Skill ↓" },
  { value: "arcadeSkillAsc", label: "街機 Skill ↑" },
  { value: "difficultyDesc", label: "難度 ↓" },
  { value: "difficultyAsc", label: "難度 ↑" },
];

const DEFAULT_FILTERS: AdvancedFilters = {
  levels: [],
  diffRanges: [],
  unplayedHome: false,
  unplayedArcade: false,
  tags: [],
  skillRange: null,
  category: "",
  sortBy: "homeSkillDesc",
};

export default function AdvancedFilterSheet({ open, onOpenChange, filters, onApply, availableTags, availableCategories }: AdvancedFilterSheetProps) {
  const [draft, setDraft] = useState<AdvancedFilters>(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const toggleRange = (i: number) => {
    setDraft((d) => ({
      ...d,
      diffRanges: d.diffRanges.includes(i) ? d.diffRanges.filter((x) => x !== i) : [...d.diffRanges, i],
    }));
  };

  const reset = () => setDraft(DEFAULT_FILTERS);

  const apply = () => {
    onApply(draft);
    onOpenChange(false);
  };

  const activeCount =
    draft.diffRanges.length +
    draft.tags.length +
    (draft.unplayedHome ? 1 : 0) +
    (draft.unplayedArcade ? 1 : 0) +
    (draft.skillRange !== null ? 1 : 0) +
    (draft.category ? 1 : 0);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[75vh]" aria-describedby={undefined}>
        <DrawerHeader className="flex items-center justify-between px-5 pb-0">
          <DrawerTitle className="font-display text-base font-bold tracking-wide">進階篩選</DrawerTitle>
          <button onClick={() => onOpenChange(false)} className="p-2 rounded hover:bg-muted transition-colors">
            <X size={18} className="text-muted-foreground" />
          </button>
        </DrawerHeader>

        <div className="px-5 py-4 space-y-5 overflow-y-auto flex-1">
          {/* Sort */}
          <section>
            <h3 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              排序方式
            </h3>
            <div className="relative">
              <select
                value={draft.sortBy}
                onChange={(e) => setDraft((d) => ({ ...d, sortBy: e.target.value as SortByOption }))}
                className="w-full min-h-[44px] rounded-md border-2 px-3 pr-9 text-sm font-body font-semibold appearance-none bg-card text-foreground transition-all focus:outline-none focus:border-primary border-border"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </section>

          {/* Unplayed */}
          <section>
            <h3 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              遊玩狀態
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDraft((d) => ({ ...d, unplayedHome: !d.unplayedHome }))}
                className={`flex items-center justify-center gap-2 min-h-[44px] rounded-md border-2 text-sm font-display font-bold tracking-wide transition-all ${
                  draft.unplayedHome
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                <EyeOff size={15} />
                家機未玩
              </button>
              <button
                onClick={() => setDraft((d) => ({ ...d, unplayedArcade: !d.unplayedArcade }))}
                className={`flex items-center justify-center gap-2 min-h-[44px] rounded-md border-2 text-sm font-display font-bold tracking-wide transition-all ${
                  draft.unplayedArcade
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                <EyeOff size={15} />
                街機未玩
              </button>
            </div>
          </section>

          {/* Tags (dropdown) */}
          {availableTags.length > 0 && (
            <section>
              <h3 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                分類標籤
              </h3>
              <div className="relative">
                <select
                  value={draft.tags[0] || ""}
                  onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value ? [e.target.value] : [] }))}
                  className="w-full min-h-[44px] rounded-md border-2 px-3 pr-9 text-sm font-body font-semibold appearance-none bg-card text-foreground transition-all focus:outline-none focus:border-primary border-border"
                >
                  <option value="">全部</option>
                  {availableTags.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </section>
          )}

          {/* Skill Threshold */}
          <section>
            <h3 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              家機 Skill 分數
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {SKILL_THRESHOLDS.map((t, i) => {
                const active = draft.skillRange === i;
                return (
                  <button
                    key={i}
                    onClick={() => setDraft((d) => ({ ...d, skillRange: d.skillRange === i ? null : i }))}
                    className={`min-h-[44px] rounded-md border-2 text-sm font-body font-semibold tracking-wide transition-all ${
                      active
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Category (歌名發音/分類) */}
          {availableCategories.length > 0 && (
            <section>
              <h3 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                歌名發音 / 分類
              </h3>
              <div className="relative">
                <select
                  value={draft.category}
                  onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                  className="w-full min-h-[44px] rounded-md border-2 px-3 pr-9 text-sm font-body font-semibold appearance-none bg-card text-foreground transition-all focus:outline-none focus:border-primary border-border"
                >
                  <option value="">全部</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </section>
          )}

          {/* Difficulty Range */}
          <section>
            <h3 className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              難度區間
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {DIFF_RANGES.map((r, i) => {
                const active = draft.diffRanges.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggleRange(i)}
                    className={`min-h-[44px] rounded-md border-2 text-xs font-body font-semibold tracking-wide transition-all ${
                      active
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <DrawerFooter className="flex-row gap-3 px-5 pb-6" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}>
          <button
            onClick={reset}
            className="flex-1 flex items-center justify-center gap-1.5 min-h-[48px] rounded-md bg-muted text-muted-foreground text-sm font-display font-semibold hover:bg-muted/80 transition-colors"
          >
            <RotateCcw size={14} />
            重設
          </button>
          <button
            onClick={apply}
            className="flex-1 min-h-[48px] rounded-md bg-primary text-primary-foreground text-sm font-display font-bold shadow-[0_0_16px_hsl(var(--primary)/0.3)] hover:opacity-90 transition-all"
          >
            套用{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
